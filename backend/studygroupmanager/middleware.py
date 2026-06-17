from django.shortcuts import redirect
from django.conf import settings

PUBLIC_URLS = [
    '/accounts/login/',
    '/accounts/signup/',
    '/admin/login/',
]

# 닉네임 미설정 리다이렉트에서 제외할 경로 접두사
NICKNAME_EXEMPT_PREFIXES = [
    '/accounts/nickname/',
    '/accounts/logout/',
    '/accounts/login/',
    '/accounts/signup/',
    '/admin/',
]

_ADMIN_COOKIE_KEY  = 'admin_auth'
_ADMIN_COOKIE_SALT = 'sgm-admin'
_NICKNAME_SESSION  = 'sgm_nickname'


def _is_admin_authenticated(request):
    try:
        request.get_signed_cookie(_ADMIN_COOKIE_KEY, salt=_ADMIN_COOKIE_SALT)
        return True
    except Exception:
        return False


def _needs_nickname(request):
    """인증된 일반 유저 중 닉네임 미설정 여부 — 세션으로 판단 (DB 없음)"""
    if not request.user.is_authenticated:
        return False
    return not bool(request.session.get(_NICKNAME_SESSION))


class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        path      = request.path_info
        is_public = any(path.startswith(url) for url in PUBLIC_URLS)

        # 1) 비로그인 접근 차단
        if not is_public and not request.user.is_authenticated and not _is_admin_authenticated(request):
            login_url = getattr(settings, 'LOGIN_URL', '/accounts/login/')
            if path != login_url:
                return redirect(f'{login_url}?next={path}')

        # 2) 닉네임 미설정 유저 → 닉네임 설정 페이지로 강제 이동 (관리자 제외)
        is_nickname_exempt = any(path.startswith(p) for p in NICKNAME_EXEMPT_PREFIXES)
        if (not is_nickname_exempt
                and not _is_admin_authenticated(request)
                and _needs_nickname(request)):
            return redirect('/accounts/nickname/')

        return self.get_response(request)
