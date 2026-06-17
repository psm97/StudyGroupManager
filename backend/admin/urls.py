from django.urls import path
from . import views

urlpatterns = [
    # ── 페이지 뷰 ──────────────────────────────────────────
    path('',             views.admin_dashboard,   name='admin_dashboard'),
    path('member_list/', views.member_list,        name='admin_member_list'),
    path('group_list/',  views.group_list,         name='admin_group_list'),
    path('report/',      views.report,             name='admin_report'),
    path('files/',       views.files,              name='admin_files'),
    path('analytics/',   views.analytics,          name='admin_analytics'),
    path('logs/',        views.logs,               name='admin_logs'),
    path('config/',      views.config,             name='admin_config'),

    path('profile/',       views.admin_profile,       name='admin_profile'),

    # ── 인증 ───────────────────────────────────────────────
    path('login/',       views.admin_login_view,   name='admin_login'),
    path('logout/',      views.admin_logout_view,  name='admin_logout'),

    # ── API ────────────────────────────────────────────────
    path('api/kpi/',            views.api_kpi,            name='admin_api_kpi'),
    path('api/signup-trend/',   views.api_signup_trend,   name='admin_api_signup_trend'),
    path('api/group-activity/', views.api_group_activity, name='admin_api_group_activity'),
    path('api/system-status/',  views.api_system_status,  name='admin_api_system_status'),
    path('api/recent-users/',   views.api_recent_users,   name='admin_api_recent_users'),
    path('api/activity-log/',   views.api_activity_log,   name='admin_api_activity_log'),
]
