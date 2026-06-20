from django.urls import path
from . import views

urlpatterns = [
    path('attendance-analysis/', views.api_attendance_analysis, name='api_attendance_analysis'),
    path('planner/init/', views.api_planner_init, name='api_planner_init'),
    path('planner/chat/', views.api_planner_chat, name='api_planner_chat'),
]
