from django.shortcuts import render
from django.http import JsonResponse
from django.db import models as django_models


def dashboard_view(request):
    return render(request, 'main/dashboard.html')


# ── REST API ──────────────────────────────────────────────────────────────────
def api_stats(request):
    """GET /api/dashboard/stats/"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    from groups.models import GroupMembership
    from attendance.models import AttendanceRecord
    from penalty.models import Penalty
    from django.utils import timezone

    today = timezone.now().date()
    month_start = today.replace(day=1)

    groups_count = GroupMembership.objects.filter(user=request.user, is_active=True).count()

    records = AttendanceRecord.objects.filter(
        user=request.user,
        session__session_date__gte=month_start,
    )
    present = records.filter(status='present').count()
    total_att = records.count()
    rate = round(present / total_att * 100) if total_att else 0

    unpaid = Penalty.objects.filter(
        user=request.user, is_paid=False
    ).aggregate(s=django_models.Sum('amount'))['s'] or 0

    return JsonResponse({
        'groups': groups_count,
        'attendance': f'{total_att}회' if total_att else '—',
        'penalty': f'₩{unpaid:,}' if unpaid else '₩0',
        'rate': f'{rate}%',
    })


def api_recent_activities(request):
    """GET /api/dashboard/recent-activities/"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    from attendance.models import AttendanceRecord
    from penalty.models import Penalty
    from django.utils import timezone

    now = timezone.now()

    records = AttendanceRecord.objects.filter(
        user=request.user,
    ).select_related('session', 'session__group').order_by(
        '-session__session_date', '-session__created_at'
    )[:10]

    STATUS_COLOR = {'present': '#10b981', 'absent': '#ef4444', 'late': '#f59e0b'}

    activities = []
    for r in records:
        session_date = r.session.session_date
        group_name = r.session.group.name
        status = r.status
        color = STATUS_COLOR.get(status, '#64748b')

        ref_dt = r.checked_at
        if ref_dt:
            delta = now - ref_dt
            total_seconds = int(delta.total_seconds())
            if total_seconds < 60:
                time_str = '방금 전'
            elif total_seconds < 3600:
                time_str = f'{total_seconds // 60}분 전'
            elif total_seconds < 86400:
                local_time = timezone.localtime(ref_dt)
                time_str = f'오늘 {local_time.strftime("%H:%M")}'
            elif delta.days == 1:
                local_time = timezone.localtime(ref_dt)
                time_str = f'어제 {local_time.strftime("%H:%M")}'
            else:
                time_str = f'{delta.days}일 전'
        else:
            delta_days = (now.date() - session_date).days
            if delta_days == 0:
                time_str = '오늘'
            elif delta_days == 1:
                time_str = '어제'
            else:
                time_str = f'{delta_days}일 전'

        if status == 'present':
            desc = f'{group_name} 출석 완료'
        elif status == 'late':
            desc = f'{group_name} 지각'
        else:
            desc = f'{group_name} 결석'
            has_penalty = Penalty.objects.filter(
                user=request.user,
                group=r.session.group,
                created_at__date=session_date,
            ).exists()
            if has_penalty:
                desc += ' (벌금 부과)'

        activities.append({'desc': desc, 'time': time_str, 'color': color})

    return JsonResponse({'activities': activities})


def api_notifications(request):
    """GET /api/dashboard/notifications/"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    from django.utils import timezone
    from datetime import timedelta

    now = timezone.now()
    cutoff_24h = now - timedelta(hours=24)
    cutoff_30d = now - timedelta(days=30)

    raw = []  # (datetime, id, icon, msg)

    # 1. 최근 출석 기록
    from attendance.models import AttendanceRecord
    records = AttendanceRecord.objects.filter(
        user=request.user,
        session__session_date__gte=(now - timedelta(days=30)).date(),
    ).select_related('session', 'session__group').order_by('-session__session_date')[:5]

    STATUS_MAP = {
        'present': ('✅', '{group} 출석이 확인되었습니다.'),
        'late':    ('⏰', '{group} 세션에 지각이 기록되었습니다.'),
        'absent':  ('❌', '{group} 세션에 결석이 기록되었습니다.'),
    }
    for r in records:
        icon, msg_tmpl = STATUS_MAP.get(r.status, ('📋', '{group} 출석 기록이 업데이트되었습니다.'))
        msg = msg_tmpl.format(group=r.session.group.name)
        ref_dt = r.checked_at or timezone.make_aware(
            timezone.datetime.combine(r.session.session_date, timezone.datetime.min.time())
        )
        raw.append((ref_dt, f'att_{r.id}', icon, msg))

    # 2. 미납 벌금
    from penalty.models import Penalty
    penalties = Penalty.objects.filter(
        user=request.user,
        is_paid=False,
        created_at__gte=cutoff_30d,
    ).select_related('group').order_by('-created_at')[:3]
    for p in penalties:
        raw.append((
            p.created_at,
            f'pen_{p.id}',
            '💰',
            f'{p.group.name} 벌금 납부 요청이 도착했습니다. (₩{p.amount:,})',
        ))

    # 3. 내 그룹의 최근 공지
    from support.models import Notice
    from groups.models import GroupMembership
    user_group_ids = list(GroupMembership.objects.filter(
        user=request.user, is_active=True
    ).values_list('group_id', flat=True))
    if user_group_ids:
        notices = Notice.objects.filter(
            group_id__in=user_group_ids,
            created_at__gte=cutoff_30d,
        ).exclude(author=request.user).select_related('group').order_by('-created_at')[:3]
        for n in notices:
            group_name = n.group.name if n.group else '전체'
            raw.append((
                n.created_at,
                f'ntc_{n.id}',
                '📢',
                f'{group_name}에 새 공지가 등록되었습니다: {n.title}',
            ))

    raw.sort(key=lambda x: x[0], reverse=True)
    raw = raw[:10]

    def fmt_time(dt):
        total_seconds = int((now - dt).total_seconds())
        if total_seconds < 60:
            return '방금 전'
        if total_seconds < 3600:
            return f'{total_seconds // 60}분 전'
        if total_seconds < 86400:
            return f'{total_seconds // 3600}시간 전'
        days = (now - dt).days
        return '어제' if days == 1 else f'{days}일 전'

    notifications = [
        {'id': nid, 'icon': icon, 'msg': msg, 'time': fmt_time(dt), 'read': dt < cutoff_24h}
        for dt, nid, icon, msg in raw
    ]

    return JsonResponse({'notifications': notifications})

