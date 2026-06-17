from django.urls import path
from . import views

urlpatterns = [
    path('ai_attendance_analysis/', views.ai_attendance_analysis_view, name='ai_attendance_analysis'),    
    path('ai_monthly_report/', views.ai_monthly_report_view, name='ai_monthly_report'),    
    path('ai_planner/', views.ai_planner_view, name='ai_planner')    
]


# 나중에 /groups/<id>/ai/attendance-analysis/ 이런 URL로 수정해야 함
# ai 서비스를 삭제하고 groups 서비스에 넣어야 할 수도 있음