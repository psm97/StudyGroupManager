from django.urls import path
from . import views

urlpatterns = [
    path('attendance_check/', views.attendance_check_view, name='attendance_check'),     # 출석체크
    path('attendance_stats/', views.attendance_stats_view, name='attendance_stats'),     # 출석 통계

]