from django.contrib import admin
from django.urls import include, path
from django.shortcuts import redirect

def root_redirect(request):
    if request.user.is_authenticated:
        return redirect('dashboard')   # 로그인 O → 대시보드
    return redirect('login')           # 로그인 X → 로그인 페이지

urlpatterns = [
    # path("admin/", admin.site.urls),
    # path('',  include('dashboard.urls')),              


    # -- 백업 -- #
    path("admin/", include('admin.urls')),
    path("django-admin/", admin.site.urls),
    path('', root_redirect),                          # localhost/ 처리
    path("accounts/", include('accounts.urls')),
    path('dashboard/', include('dashboard.urls')),
    path("groups/", include('groups.urls')),
    path("attendance/", include('attendance.urls')),
    path("penalty/", include('penalty.urls')),
    path("ai/", include('ai.urls')),
    path("support/", include('support.urls')),
    # REST API 라우트
    path("api/dashboard/", include('dashboard.api_urls')),
    path("api/ai/", include('ai.api_urls')),
    path("calendar/", include('support.calendar_urls')),
]
