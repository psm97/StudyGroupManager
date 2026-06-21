import json
import re
from datetime import timedelta

from django.shortcuts import render, redirect
from django.contrib.auth import logout as auth_logout, login as auth_login, get_user_model
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from django.utils import timezone
from datetime import datetime

NICKNAME_RE  = re.compile(r'^[가-힣a-zA-Z0-9_]+$')
SESSION_KEY  = 'sgm_nickname'   # 세션에 닉네임을 저장하는 키


def login_view(request):
    next_url = request.GET.get('next', '')
    return render(request, 'accounts/login.html', {
        'current_year': datetime.now().year,
        'next': next_url,
    })

def profile_view(request):
    return render(request, 'accounts/profile.html')

def profile_settings_view(request):
    return render(request, 'accounts/profile_settings.html')

def signup_view(request):
    return render(request, 'accounts/signup.html')

def logout_view(request):
    auth_logout(request)
    return redirect('login')


@csrf_exempt
def api_logout(request):
    """POST /accounts/api/logout/ - 세션 종료"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    auth_logout(request)
    return JsonResponse({'success': True})


@login_required
def nickname_view(request):
    # 이미 닉네임이 설정된 유저는 대시보드로 (1회 표시 보장)
    if request.session.get(SESSION_KEY):
        return redirect('dashboard')

    if request.method == 'POST':
        try:
            data     = json.loads(request.body)
            nickname = (data.get('nickname') or '').strip()
        except (json.JSONDecodeError, AttributeError):
            return JsonResponse({'success': False, 'message': '잘못된 요청입니다.'}, status=400)

        error = _validate_nickname(nickname)
        if error:
            return JsonResponse({'success': False, 'message': error}, status=400)

        # 세션에 닉네임 저장 (DB 없음)
        request.session[SESSION_KEY] = nickname

        return JsonResponse({'success': True, 'redirect_url': '/dashboard/'})

    return render(request, 'accounts/nickname.html')


@login_required
@require_GET
def nickname_check_view(request):
    """형식 유효성만 확인 (DB 없음 — 중복 체크는 추후 DB 연동 시 추가)"""
    nickname = (request.GET.get('nickname') or '').strip()
    error    = _validate_nickname(nickname)
    if error:
        return JsonResponse({'valid': False, 'message': error})
    return JsonResponse({'valid': True})


def _validate_nickname(nickname):
    if not nickname:
        return '닉네임을 입력해주세요.'
    if len(nickname) < 2 or len(nickname) > 20:
        return '닉네임은 2~20자 이내로 입력해주세요.'
    if not NICKNAME_RE.match(nickname):
        return '한글, 영문, 숫자, 언더스코어(_)만 사용 가능합니다.'
    return None


# ── REST API ──────────────────────────────────────────────────────────────────
@csrf_exempt
def api_google_login(request):
    """POST /accounts/api/google-login/ — Google OAuth 사용자 생성/조회 후 Django 세션 발급"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        google_id = str(data.get('google_id', '')).strip()
        email     = str(data.get('email', '')).strip().lower()
        name      = str(data.get('name', '')).strip()
        picture   = str(data.get('picture', '')).strip()
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    if not email:
        return JsonResponse({'error': 'Email required'}, status=400)

    User = get_user_model()

    # 이메일로 기존 유저 조회 → 없으면 신규 생성
    try:
        user = User.objects.get(email=email)
        # 프로필 이미지 갱신 (비어 있을 때만)
        if picture and not user.profile_image:
            user.profile_image = picture
            user.save(update_fields=['profile_image', 'updated_at'])
    except User.DoesNotExist:
        # 고유 username 생성: google_<id> 또는 email prefix
        base = f'google_{google_id}' if google_id else email.split('@')[0]
        username, counter = base, 1
        while User.objects.filter(username=username).exists():
            username = f'{base}_{counter}'
            counter += 1

        user = User(username=username, email=email, nickname=name,
                    profile_image=picture, role='member', is_active=True)
        user.set_unusable_password()
        user.save()

    # Django 세션 생성 (Set-Cookie 응답 헤더로 브라우저에 전달됨)
    auth_login(request, user, backend='django.contrib.auth.backends.ModelBackend')

    # 닉네임이 이미 있으면 세션에도 저장해 닉네임 설정 페이지 건너뜀
    if user.nickname and not request.session.get(SESSION_KEY):
        request.session[SESSION_KEY] = user.nickname

    needs_nickname = not bool(request.session.get(SESSION_KEY))

    return JsonResponse({'success': True, 'needs_nickname': needs_nickname})


def api_profile(request):
    """GET /accounts/api/profile/ - 현재 사용자 출석·벌금 요약"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    from attendance.models import AttendanceRecord

    today = timezone.now().date()
    month_start = today.replace(day=1)

    records = AttendanceRecord.objects.filter(
        user=request.user,
        session__session_date__gte=month_start,
    )
    monthly_present = records.filter(status='present').count()
    monthly_late = records.filter(status='late').count()
    monthly_absent = records.filter(status='absent').count()
    total = monthly_present + monthly_late + monthly_absent
    monthly_rate = round(monthly_present / total * 100) if total else 0

    # 최근 35일 히트맵 (0=없음, 1=결석, 2=지각, 3=출석)
    heatmap = []
    for i in range(34, -1, -1):
        d = today - timedelta(days=i)
        day_records = AttendanceRecord.objects.filter(user=request.user, session__session_date=d)
        if not day_records.exists():
            heatmap.append(0)
        elif day_records.filter(status='present').exists():
            heatmap.append(3)
        elif day_records.filter(status='late').exists():
            heatmap.append(2)
        else:
            heatmap.append(1)

    return JsonResponse({
        'monthly_rate': monthly_rate,
        'monthly_present': monthly_present,
        'monthly_late': monthly_late,
        'monthly_absent': monthly_absent,
        'heatmap_data': heatmap,
        'nickname': request.user.nickname or request.user.username,
        'email': request.user.email,
        'profile_image': getattr(request.user, 'profile_image', ''),
        'date_joined': request.user.date_joined.strftime('%Y-%m-%d') if hasattr(request.user, 'date_joined') else '',
    })


def api_me(request):
    """GET /accounts/api/me/ - 현재 사용자 기본 정보"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    return JsonResponse({
        'id': request.user.id,
        'username': request.user.username,
        'nickname': request.user.nickname or request.user.username,
        'email': request.user.email,
        'profile_image': getattr(request.user, 'profile_image', ''),
        'role': getattr(request.user, 'role', 'member'),
    })
