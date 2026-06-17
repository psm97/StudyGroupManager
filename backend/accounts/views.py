import json
import re

from django.shortcuts import render, redirect
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_GET
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
