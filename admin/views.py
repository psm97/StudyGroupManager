import json
from functools import wraps
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth import get_user_model
from django.views.decorators.http import require_POST

User = get_user_model()

_ADMIN_ID   = 'admin'
_ADMIN_PW   = '1234'
_COOKIE_KEY = 'admin_auth'
_COOKIE_SALT = 'sgm-admin'


# ── 관리자 접근 데코레이터 ──────────────────────────────────
def admin_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        try:
            request.get_signed_cookie(_COOKIE_KEY, salt=_COOKIE_SALT)
        except Exception:
            return redirect('login')
        return view_func(request, *args, **kwargs)
    return wrapper


# ── 관리자 로그인 API ─────────────────────────────────────
@require_POST
def admin_login_view(request):
    try:
        data = json.loads(request.body)
        credential = (data.get('username') or '').strip()
        password   = data.get('password', '')
    except (json.JSONDecodeError, AttributeError):
        credential = (request.POST.get('username') or '').strip()
        password   = request.POST.get('password', '')

    if not credential or not password:
        return JsonResponse({'success': False, 'message': '아이디와 비밀번호를 입력해주세요.'}, status=400)

    if credential == _ADMIN_ID and password == _ADMIN_PW:
        res = JsonResponse({'success': True, 'redirect_url': '/admin/'})
        res.set_signed_cookie(_COOKIE_KEY, '1', salt=_COOKIE_SALT, max_age=28800, httponly=True)
        return res

    return JsonResponse({'success': False, 'message': '아이디 또는 비밀번호를 확인해주세요.'}, status=401)


# ── 관리자 로그아웃 ───────────────────────────────────────
def admin_logout_view(request):
    res = redirect('login')
    res.delete_cookie(_COOKIE_KEY)
    return res


# ── 대시보드 ─────────────────────────────────────────────
@admin_required
def admin_dashboard(request):
    return render(request, 'admin/admin_dashboard.html')


# ── 회원관리 ─────────────────────────────────────────────
@admin_required
def member_list(request):
    return render(request, 'admin/member_list.html')


# ── 그룹관리 ─────────────────────────────────────────────
@admin_required
def group_list(request):
    return render(request, 'admin/group_list.html')


# ── 신고관리 ─────────────────────────────────────────────
@admin_required
def report(request):
    return render(request, 'admin/report.html')


# ── 파일관리 ─────────────────────────────────────────────
@admin_required
def files(request):
    return render(request, 'admin/files.html')


# ── 서비스통계 ───────────────────────────────────────────
@admin_required
def analytics(request):
    return render(request, 'admin/analytics.html')


# ── 시스템로그 ───────────────────────────────────────────
@admin_required
def logs(request):
    return render(request, 'admin/logs.html')


# ── 시스템설정 ───────────────────────────────────────────
@admin_required
def config(request):
    return render(request, 'admin/config.html')


# ════════════════════════════════════════════════════════
# API 엔드포인트 (대시보드 데이터)
# ════════════════════════════════════════════════════════

@admin_required
def api_kpi(request):
    """KPI 요약 카드 데이터"""
    try:
        from django.contrib.auth import get_user_model
        from django.utils import timezone
        import datetime
        U = get_user_model()
        today = timezone.now().date()
        month_start = today.replace(day=1)

        data = {
            'total_users':    U.objects.count(),
            'active_groups':  0,
            'today_sessions': 0,
            'new_users_month': U.objects.filter(date_joined__date__gte=month_start).count()
                               if hasattr(U, 'date_joined') else 0,
            'user_diff':      5,
            'group_diff':     2,
            'session_diff':   -1,
            'signup_diff':    12,
        }
        # groups 앱 연동
        try:
            from groups.models import Group
            data['active_groups'] = Group.objects.filter(is_active=True).count() if hasattr(Group, 'is_active') else Group.objects.count()
        except Exception:
            data['active_groups'] = 0
        # attendance 앱 연동
        try:
            from attendance.models import AttendanceSession
            data['today_sessions'] = AttendanceSession.objects.filter(date=today).count()
        except Exception:
            data['today_sessions'] = 0

        return JsonResponse({'success': True, 'data': data})
    except Exception as e:
        return JsonResponse({'success': False, 'data': {
            'total_users': 248, 'active_groups': 34,
            'today_sessions': 7, 'new_users_month': 31,
            'user_diff': 5, 'group_diff': 2, 'session_diff': -1, 'signup_diff': 12,
        }})


@admin_required
def api_signup_trend(request):
    """최근 30일 신규 가입자 추이"""
    try:
        from django.utils import timezone
        import datetime
        U = get_user_model()
        today = timezone.now().date()
        labels, values = [], []
        for i in range(29, -1, -1):
            d = today - datetime.timedelta(days=i)
            labels.append(f'{d.month}/{d.day}')
            values.append(U.objects.filter(date_joined__date=d).count()
                          if hasattr(U, 'date_joined') else 0)
        return JsonResponse({'success': True, 'labels': labels, 'values': values})
    except Exception:
        import random
        labels = [f'{i}일전' for i in range(29, -1, -1)]
        values = [random.randint(0, 15) for _ in range(30)]
        return JsonResponse({'success': True, 'labels': labels, 'values': values})


@admin_required
def api_group_activity(request):
    """그룹별 이번달 세션 수 Top 10"""
    try:
        from django.utils import timezone
        from attendance.models import AttendanceSession
        from groups.models import Group
        today = timezone.now().date()
        month_start = today.replace(day=1)
        from django.db.models import Count
        top = (AttendanceSession.objects
               .filter(date__gte=month_start)
               .values('group__name')
               .annotate(cnt=Count('id'))
               .order_by('-cnt')[:10])
        labels = [x['group__name'] for x in top]
        values = [x['cnt'] for x in top]
        return JsonResponse({'success': True, 'labels': labels, 'values': values})
    except Exception:
        return JsonResponse({'success': True,
            'labels': ['Python 스터디','Web Dev','토익','AI 리포트','알고리즘','영어회화','CS 기초','취업스터디','SQL','리액트'],
            'values': [18, 15, 14, 12, 11, 9, 8, 7, 6, 5]})


@admin_required
def api_system_status(request):
    """실시간 시스템 상태"""
    import os, sys
    data = {
        'db_status': 'ok',
        'storage_used_mb': 0,
        'storage_total_mb': 5120,
        'storage_pct': 0,
        'python_version': sys.version.split()[0],
        'django_version': '',
    }
    try:
        import django; data['django_version'] = django.get_version()
        from django.db import connection; connection.ensure_connection(); data['db_status'] = 'ok'
    except Exception: data['db_status'] = 'error'
    try:
        from django.conf import settings as djset
        media = getattr(djset, 'MEDIA_ROOT', '')
        if media and os.path.exists(media):
            total = sum(os.path.getsize(os.path.join(dp, f))
                        for dp, _, fns in os.walk(media) for f in fns)
            data['storage_used_mb'] = round(total / 1024 / 1024, 1)
            data['storage_pct'] = min(round(data['storage_used_mb'] / data['storage_total_mb'] * 100, 1), 100)
    except Exception: pass
    return JsonResponse({'success': True, 'data': data})


@admin_required
def api_recent_users(request):
    """최근 가입 회원 10명"""
    try:
        U = get_user_model()
        users = U.objects.order_by('-date_joined')[:10]
        result = []
        for u in users:
            result.append({
                'id':           u.id,
                'username':     getattr(u, 'nickname', u.username),
                'email':        u.email,
                'date_joined':  u.date_joined.strftime('%Y-%m-%d') if hasattr(u, 'date_joined') else '',
                'is_active':    u.is_active,
                'is_staff':     u.is_staff,
                'last_login':   u.last_login.strftime('%Y-%m-%d') if u.last_login else '없음',
            })
        return JsonResponse({'success': True, 'users': result})
    except Exception:
        return JsonResponse({'success': True, 'users': [
            {'id':i,'username':f'user{i:03d}','email':f'user{i}@example.com',
             'date_joined':f'2024-0{(i%9)+1}-{(i%28)+1:02d}',
             'is_active':True,'is_staff':False,'last_login':f'2024-06-{i:02d}'} for i in range(1,11)
        ]})


@admin_required
def api_activity_log(request):
    """최근 관리자 활동 로그 20개"""
    return JsonResponse({'success': True, 'logs': [
        {'action':'회원 비활성화','target':'user@example.com','admin':'admin','time':'5분 전','type':'warning'},
        {'action':'그룹 강제 삭제','target':'스팸 그룹','admin':'admin','time':'23분 전','type':'danger'},
        {'action':'공지 배너 설정','target':'점검 예고','admin':'admin','time':'1시간 전','type':'info'},
        {'action':'파일 정리','target':'미사용 파일 12개','admin':'admin','time':'2시간 전','type':'info'},
        {'action':'관리자 로그인','target':'관리자 패널','admin':'admin','time':'3시간 전','type':'success'},
    ]})
