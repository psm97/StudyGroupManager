from django.urls import path
from . import views

urlpatterns = [
    path('ai_attendance_analysis/', views.ai_attendance_analysis_view, name='ai_attendance_analysis'),
    path('ai_monthly_report/', views.ai_monthly_report_view, name='ai_monthly_report'),
    path('ai_planner/', views.ai_planner_view, name='ai_planner'),
    # REST API (HTML-path routes that need query params to distinguish from Next.js pages)
    path('monthly-report/', views.api_monthly_report, name='api_monthly_report'),
    path('monthly-report/<int:report_id>/', views.api_monthly_report_detail, name='api_monthly_report_detail'),
]