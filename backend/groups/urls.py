from django.urls import path
from . import views

urlpatterns = [
    # ── 기존 HTML 뷰 ──────────────────────────────────────────────────────────
    path('group_list/', views.group_list_view, name='group_list'),
    path('group_detail/', views.group_detail_view, name='group_detail'),
    path('group_home/', views.group_home_view, name='group_home'),
    path('<int:group_id>/home/', views.group_home_view, name='group_home_detail'),

    # ── 그룹 목록 API ─────────────────────────────────────────────────────────
    path('api/my-groups/', views.api_my_groups, name='api_my_groups'),
    path('api/public/', views.api_public_groups, name='api_public_groups'),

    # ── 그룹 상세 API ─────────────────────────────────────────────────────────
    path('api/<int:group_id>/', views.api_group_detail, name='api_group_detail'),
    path('api/<int:group_id>/members/', views.api_group_members, name='api_group_members'),
    path('api/<int:group_id>/notices/', views.api_group_notices, name='api_group_notices'),
    path('api/<int:group_id>/sessions/', views.api_group_sessions, name='api_group_sessions'),

    # ── 그룹 관리 API ─────────────────────────────────────────────────────────
    path('api/<int:group_id>/update/', views.api_group_update, name='api_group_update'),
    path('api/<int:group_id>/delete/', views.api_group_delete, name='api_group_delete'),
    path('api/<int:group_id>/leave/', views.api_group_leave, name='api_group_leave'),
    path('api/<int:group_id>/delegate-leader/', views.api_group_delegate_leader, name='api_group_delegate_leader'),

    # ── 출석 자가체크 & 리더 체크 ─────────────────────────────────────────────
    path('api/<int:group_id>/sessions/<int:session_id>/self-check/', views.api_group_self_check, name='api_group_self_check'),
    path('<int:group_id>/sessions/<int:session_id>/check/', views.api_session_submit, name='api_session_submit'),

    # ── 출석 통계 API ─────────────────────────────────────────────────────────
    path('<int:group_id>/attendance/stats/api/', views.api_attendance_stats, name='api_attendance_stats'),

    # ── 벌금 API ──────────────────────────────────────────────────────────────
    path('<int:group_id>/penalty/api/', views.api_group_penalty, name='api_group_penalty'),
    path('<int:group_id>/penalty/<int:penalty_id>/pay/', views.api_penalty_pay, name='api_penalty_pay'),
    path('<int:group_id>/penalty/pay-all/', views.api_penalty_pay_all, name='api_penalty_pay_all'),
    path('<int:group_id>/penalty/rule/', views.api_penalty_rule, name='api_penalty_rule'),

    # ── 학습 자료 API ─────────────────────────────────────────────────────────
    path('<int:group_id>/resources/', views.api_resource_list, name='api_resource_list'),
    path('<int:group_id>/resources/<int:resource_id>/', views.api_resource_detail, name='api_resource_detail'),
    path('<int:group_id>/resources/<int:resource_id>/download/', views.api_resource_download, name='api_resource_download'),
    path('<int:group_id>/resources/<int:resource_id>/file/', views.api_resource_file, name='api_resource_file'),
]