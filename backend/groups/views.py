import json
from datetime import datetime, timedelta

from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import StudyGroup, GroupMembership

# ── 기존 HTML 뷰 (유지) ──────────────────────────────────────────────────────
def group_list_view(request):
    return render(request, 'groups/group_list.html')

def group_detail_view(request):
    return render(request, 'groups/group_detail.html')

def group_home_view(request, group_id=1):
    context = {
        'group_id': group_id,
        'user_role': 'leader',
    }
    return render(request, 'groups/group_home.html', context)


# ── 공통 헬퍼 ────────────────────────────────────────────────────────────────
GROUP_COLORS = ['#0077ff', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

def _color(group_id):
    return GROUP_COLORS[(group_id - 1) % len(GROUP_COLORS)]

def _auth(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    return None

def _calc_rate(user_id, group_id):
    from attendance.models import AttendanceSession, AttendanceRecord
    total = AttendanceSession.objects.filter(group_id=group_id).count()
    if not total:
        return 0.0
    present = AttendanceRecord.objects.filter(
        session__group_id=group_id, user_id=user_id, status='present'
    ).count()
    return round(present / total * 100, 1)

def _user_role(user_id, group_id):
    try:
        m = GroupMembership.objects.get(group_id=group_id, user_id=user_id, is_active=True)
        return m.role
    except GroupMembership.DoesNotExist:
        return None

def _member_count(group):
    return GroupMembership.objects.filter(group=group, is_active=True).count()


# ── 그룹 목록 API ─────────────────────────────────────────────────────────────
def api_my_groups(request):
    err = _auth(request)
    if err: return err

    memberships = GroupMembership.objects.filter(
        user=request.user, is_active=True
    ).select_related('group')

    result = []
    for m in memberships:
        g = m.group
        if not g.is_active:
            continue
        result.append({
            'id': g.id,
            'name': g.name,
            'description': g.description,
            'member_count': _member_count(g),
            'max_members': g.max_members,
            'role': m.role,
            'attendance_rate': _calc_rate(request.user.id, g.id),
            'color': _color(g.id),
            'is_active': g.is_active,
        })
    return JsonResponse({'groups': result})


def api_public_groups(request):
    err = _auth(request)
    if err: return err

    my_ids = set(GroupMembership.objects.filter(
        user=request.user, is_active=True
    ).values_list('group_id', flat=True))

    groups = StudyGroup.objects.filter(is_active=True).exclude(id__in=my_ids)
    result = []
    for g in groups:
        result.append({
            'id': g.id,
            'name': g.name,
            'description': g.description,
            'member_count': _member_count(g),
            'max_members': g.max_members,
            'role': '',
            'attendance_rate': 0,
            'color': _color(g.id),
            'is_public': True,
        })
    return JsonResponse({'groups': result})


# ── 그룹 상세 API ─────────────────────────────────────────────────────────────
def api_group_detail(request, group_id):
    err = _auth(request)
    if err: return err

    try:
        g = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    role = _user_role(request.user.id, group_id) or ''

    try:
        lm = GroupMembership.objects.get(group=g, role='leader', is_active=True)
        leader_name = lm.user.nickname or lm.user.username
    except GroupMembership.DoesNotExist:
        leader_name = ''

    return JsonResponse({
        'id': g.id,
        'name': g.name,
        'description': g.description,
        'member_count': _member_count(g),
        'max_members': g.max_members,
        'role': role,
        'attendance_rate': _calc_rate(request.user.id, group_id) if role else 0,
        'color': _color(g.id),
        'leader_name': leader_name,
        'created_at': g.created_at.strftime('%Y-%m-%d'),
        'is_active': g.is_active,
    })


def api_group_members(request, group_id):
    err = _auth(request)
    if err: return err

    try:
        g = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    is_leader = GroupMembership.objects.filter(
        group=g, user=request.user, role='leader', is_active=True
    ).exists()

    memberships = GroupMembership.objects.filter(group=g, is_active=True).select_related('user')
    result = []
    for m in memberships:
        rate = _calc_rate(m.user.id, group_id)
        result.append({
            'id': m.user.id,
            'nickname': m.user.nickname or m.user.username,
            'role': m.role,
            'attendance_rate': rate,
        })
    return JsonResponse({'is_leader': is_leader, 'members': result})


def api_group_notices(request, group_id):
    err = _auth(request)
    if err: return err

    from support.models import Notice
    notices = Notice.objects.filter(group_id=group_id).select_related('author').order_by('-created_at')
    result = []
    for n in notices:
        result.append({
            'id': n.id,
            'title': n.title,
            'content': n.content,
            'created_at': n.created_at.strftime('%Y.%m.%d'),
            'isPinned': n.is_pinned,
        })
    return JsonResponse(result, safe=False)


def api_group_sessions(request, group_id):
    err = _auth(request)
    if err: return err

    from attendance.models import AttendanceSession, AttendanceRecord
    sessions = AttendanceSession.objects.filter(group_id=group_id).order_by('-session_date')
    result = []
    for s in sessions:
        has_record = AttendanceRecord.objects.filter(session=s, user=request.user).exists()
        result.append({
            'id': s.id,
            'topic': s.title or '출석 세션',
            'date': s.session_date.strftime('%Y.%m.%d'),
            'status': 'completed' if has_record else 'unchecked',
            'description': '',
        })
    return JsonResponse(result, safe=False)


# ── 그룹 관리 액션 API ───────────────────────────────────────────────────────
@csrf_exempt
def api_group_update(request, group_id):
    err = _auth(request)
    if err: return err
    if request.method not in ('PATCH', 'PUT'):
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        g = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if not GroupMembership.objects.filter(group=g, user=request.user, role='leader').exists():
        return JsonResponse({'error': 'Permission denied'}, status=403)

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    if 'name' in data:
        g.name = data['name']
    if 'description' in data:
        g.description = data['description']
    if 'max_members' in data:
        g.max_members = int(data['max_members'])
    g.save()
    return JsonResponse({'success': True})


@csrf_exempt
def api_group_delete(request, group_id):
    err = _auth(request)
    if err: return err
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        g = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if not GroupMembership.objects.filter(group=g, user=request.user, role='leader').exists():
        return JsonResponse({'error': 'Permission denied'}, status=403)

    g.is_active = False
    g.save()
    return JsonResponse({'success': True})


@csrf_exempt
def api_group_leave(request, group_id):
    err = _auth(request)
    if err: return err
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        m = GroupMembership.objects.get(group_id=group_id, user=request.user, is_active=True)
    except GroupMembership.DoesNotExist:
        return JsonResponse({'error': 'Not a member'}, status=404)

    m.is_active = False
    m.save()
    return JsonResponse({'success': True})


@csrf_exempt
def api_group_delegate_leader(request, group_id):
    err = _auth(request)
    if err: return err
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        g = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if not GroupMembership.objects.filter(group=g, user=request.user, role='leader').exists():
        return JsonResponse({'error': 'Permission denied'}, status=403)

    try:
        data = json.loads(request.body)
        new_leader_id = data.get('new_leader_id')
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    try:
        new_m = GroupMembership.objects.get(group=g, user_id=new_leader_id, is_active=True)
    except GroupMembership.DoesNotExist:
        return JsonResponse({'error': 'User not in group'}, status=404)

    GroupMembership.objects.filter(group=g, user=request.user).update(role='member')
    new_m.role = 'leader'
    new_m.save()
    return JsonResponse({'success': True})


@csrf_exempt
def api_group_self_check(request, group_id, session_id):
    err = _auth(request)
    if err: return err
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    from attendance.models import AttendanceSession, AttendanceRecord
    from django.utils import timezone

    try:
        s = AttendanceSession.objects.get(id=session_id, group_id=group_id)
    except AttendanceSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)

    record, created = AttendanceRecord.objects.get_or_create(
        session=s, user=request.user,
        defaults={'status': 'present', 'checked_at': timezone.now()},
    )
    if not created:
        record.status = 'present'
        record.checked_at = timezone.now()
        record.save()

    return JsonResponse({'success': True})


# ── 출석 세션 체크 (리더) ─────────────────────────────────────────────────────
@csrf_exempt
def api_session_submit(request, group_id, session_id):
    err = _auth(request)
    if err: return err
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    from attendance.models import AttendanceSession, AttendanceRecord
    from django.contrib.auth import get_user_model
    from django.utils import timezone

    if not GroupMembership.objects.filter(group_id=group_id, user=request.user, role='leader').exists():
        return JsonResponse({'error': 'Leader only'}, status=403)

    try:
        s = AttendanceSession.objects.get(id=session_id, group_id=group_id)
    except AttendanceSession.DoesNotExist:
        return JsonResponse({'error': 'Session not found'}, status=404)

    try:
        data = json.loads(request.body)
        records = data.get('records', [])
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    User = get_user_model()
    for rec in records:
        uid = rec.get('member_id')
        status = rec.get('status', 'absent')
        try:
            user = User.objects.get(id=uid)
        except User.DoesNotExist:
            continue
        AttendanceRecord.objects.update_or_create(
            session=s, user=user,
            defaults={'status': status, 'checked_at': timezone.now()},
        )

    return JsonResponse({'success': True})


# ── 출석 통계 API ─────────────────────────────────────────────────────────────
def api_attendance_stats(request, group_id):
    err = _auth(request)
    if err: return err

    from attendance.models import AttendanceSession, AttendanceRecord
    from django.utils import timezone

    try:
        g = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    filter_type = request.GET.get('filter', 'month')
    date_from = request.GET.get('from')
    date_to = request.GET.get('to')

    today = timezone.now().date()
    if filter_type == 'month':
        start, end = today.replace(day=1), today
    elif filter_type == 'week':
        start, end = today - timedelta(days=today.weekday()), today
    elif filter_type == 'custom' and date_from and date_to:
        try:
            start = datetime.strptime(date_from, '%Y-%m-%d').date()
            end = datetime.strptime(date_to, '%Y-%m-%d').date()
        except ValueError:
            start, end = today - timedelta(days=30), today
    else:
        start, end = today - timedelta(days=30), today

    sessions = AttendanceSession.objects.filter(
        group_id=group_id, session_date__range=[start, end]
    ).order_by('session_date')
    session_count = sessions.count()

    memberships = GroupMembership.objects.filter(group=g, is_active=True).select_related('user')
    members_data = []
    total_present = total_late = total_absent = 0

    for m in memberships:
        qs = AttendanceRecord.objects.filter(
            session__group_id=group_id,
            session__session_date__range=[start, end],
            user=m.user,
        )
        p = qs.filter(status='present').count()
        l = qs.filter(status='late').count()
        a = qs.filter(status='absent').count()
        rate = round(p / session_count * 100, 1) if session_count else 0
        total_present += p
        total_late += l
        total_absent += a
        members_data.append({
            'id': str(m.user.id),
            'nickname': m.user.nickname or m.user.username,
            'role': m.role,
            'attendanceRate': rate,
            'presentCount': p,
            'lateCount': l,
            'absentCount': a,
            'trend': [],
        })

    member_count = len(members_data)
    denom = member_count * session_count
    group_avg_rate = round(total_present / denom * 100, 1) if denom else 0

    sessions_data = []
    for s in sessions:
        recs = AttendanceRecord.objects.filter(session=s)
        p = recs.filter(status='present').count()
        l = recs.filter(status='late').count()
        ab = recs.filter(status='absent').count()
        rate = round(p / member_count * 100, 1) if member_count else 0
        sessions_data.append({
            'date': s.session_date.strftime('%Y.%m.%d'),
            'topic': s.title or '출석 세션',
            'present': p,
            'late': l,
            'absent': ab,
            'rate': rate,
        })

    return JsonResponse({
        'total_present': total_present,
        'total_late': total_late,
        'total_absent': total_absent,
        'group_avg_rate': group_avg_rate,
        'members': members_data,
        'sessions': sessions_data,
    })


# ── 벌금 API ──────────────────────────────────────────────────────────────────
def api_group_penalty(request, group_id):
    err = _auth(request)
    if err: return err

    from penalty.models import Penalty

    try:
        g = StudyGroup.objects.get(id=group_id)
    except StudyGroup.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if not GroupMembership.objects.filter(group=g, user=request.user, is_active=True).exists():
        return JsonResponse({'error': 'Not a member'}, status=403)

    user_role = _user_role(request.user.id, group_id) or 'member'
    penalties = list(Penalty.objects.filter(group=g).select_related('user').order_by('-created_at'))

    records = []
    for p in penalties:
        records.append({
            'id': p.id,
            'memberId': str(p.user.id),
            'memberNickname': p.user.nickname or p.user.username,
            'reason': p.reason,
            'date': p.created_at.strftime('%Y-%m-%d'),
            'amount': p.amount,
            'isPaid': p.is_paid,
        })

    memberships = GroupMembership.objects.filter(group=g, is_active=True).select_related('user')
    summaries = []
    for m in memberships:
        user_penalties = [p for p in penalties if p.user_id == m.user.id]
        unpaid = sum(p.amount for p in user_penalties if not p.is_paid)
        paid = sum(p.amount for p in user_penalties if p.is_paid)
        total = unpaid + paid
        rate = round(paid / total * 100) if total else 100
        summaries.append({
            'userId': str(m.user.id),
            'nickname': m.user.nickname or m.user.username,
            'isLeader': m.role == 'leader',
            'unpaidAmount': unpaid,
            'paidAmount': paid,
            'paidRate': rate,
        })

    rule_key = f'penalty_rule_{group_id}'
    rule = request.session.get(rule_key, {'absent_fee': 5000, 'late_fee': 2000})

    return JsonResponse({
        'records': records,
        'member_summaries': summaries,
        'penalty_rule': {'absentFee': rule['absent_fee'], 'lateFee': rule['late_fee']},
        'is_leader': user_role == 'leader',
    })


@csrf_exempt
def api_penalty_pay(request, group_id, penalty_id):
    err = _auth(request)
    if err: return err
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    from penalty.models import Penalty
    if _user_role(request.user.id, group_id) != 'leader':
        return JsonResponse({'error': 'Permission denied'}, status=403)

    try:
        p = Penalty.objects.get(id=penalty_id, group_id=group_id)
    except Penalty.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    p.is_paid = True
    p.save()
    return JsonResponse({'success': True})


@csrf_exempt
def api_penalty_pay_all(request, group_id):
    err = _auth(request)
    if err: return err
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    from penalty.models import Penalty
    if _user_role(request.user.id, group_id) != 'leader':
        return JsonResponse({'error': 'Permission denied'}, status=403)

    try:
        data = json.loads(request.body)
        ids = data.get('ids', [])
    except (json.JSONDecodeError, ValueError):
        ids = []

    if ids:
        Penalty.objects.filter(id__in=ids, group_id=group_id).update(is_paid=True)
    else:
        Penalty.objects.filter(group_id=group_id, is_paid=False).update(is_paid=True)

    return JsonResponse({'success': True})


@csrf_exempt
def api_penalty_rule(request, group_id):
    err = _auth(request)
    if err: return err

    if request.method in ('POST', 'PATCH'):
        try:
            data = json.loads(request.body)
            request.session[f'penalty_rule_{group_id}'] = {
                'absent_fee': int(data.get('absent_fee', 5000)),
                'late_fee': int(data.get('late_fee', 2000)),
            }
        except (json.JSONDecodeError, ValueError, TypeError):
            pass
        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


# ── 학습 자료 API ─────────────────────────────────────────────────────────────
@csrf_exempt
def api_resource_list(request, group_id):
    err = _auth(request)
    if err: return err

    from support.models import Resource

    if request.method == 'GET':
        resources = Resource.objects.filter(group_id=group_id).select_related('uploaded_by').order_by('-uploaded_at')
        result = []
        for r in resources:
            fname = r.title
            ext = fname.rsplit('.', 1)[-1].lower() if '.' in fname else 'file'
            can_del = (
                r.uploaded_by == request.user or
                GroupMembership.objects.filter(group_id=group_id, user=request.user, role='leader').exists()
            )
            result.append({
                'id': r.id,
                'fileName': r.title,
                'fileExt': ext,
                'category': '강의자료',
                'uploaderNickname': r.uploaded_by.nickname or r.uploaded_by.username,
                'date': r.uploaded_at.strftime('%Y-%m-%d'),
                'fileSize': '—',
                'downloadCount': 0,
                'canDelete': can_del,
                'fileUrl': r.file_url or '',
            })
        is_leader = GroupMembership.objects.filter(
            group_id=group_id, user=request.user, role='leader', is_active=True
        ).exists()
        return JsonResponse({'is_leader': is_leader, 'items': result})

    if request.method == 'POST':
        title = request.POST.get('title', request.FILES.get('file', {}).name if request.FILES else '업로드 파일')
        r = Resource.objects.create(
            group_id=group_id,
            title=str(title),
            uploaded_by=request.user,
        )
        return JsonResponse({
            'id': r.id,
            'fileName': r.title,
            'fileExt': r.title.rsplit('.', 1)[-1].lower() if '.' in r.title else 'file',
            'category': '강의자료',
            'uploaderNickname': request.user.nickname or request.user.username,
            'date': r.uploaded_at.strftime('%Y-%m-%d'),
            'fileSize': '—',
            'downloadCount': 0,
            'canDelete': True,
        }, status=201)

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_resource_detail(request, group_id, resource_id):
    err = _auth(request)
    if err: return err

    from support.models import Resource

    try:
        r = Resource.objects.get(id=resource_id, group_id=group_id)
    except Resource.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if request.method == 'DELETE':
        can_del = (
            r.uploaded_by == request.user or
            GroupMembership.objects.filter(group_id=group_id, user=request.user, role='leader').exists()
        )
        if not can_del:
            return JsonResponse({'error': 'Permission denied'}, status=403)
        r.delete()
        return JsonResponse({'success': True})

    return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
def api_resource_download(request, group_id, resource_id):
    if request.method == 'POST':
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Method not allowed'}, status=405)


def api_resource_file(request, group_id, resource_id):
    err = _auth(request)
    if err: return err

    from support.models import Resource
    from django.http import HttpResponseRedirect

    try:
        r = Resource.objects.get(id=resource_id, group_id=group_id)
    except Resource.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    if r.file_url:
        return HttpResponseRedirect(r.file_url)
    return JsonResponse({'error': 'No file attached'}, status=404)
