from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.api_stats, name='api_dashboard_stats'),
    path('recent-activities/', views.api_recent_activities, name='api_dashboard_recent_activities'),
    path('notifications/', views.api_notifications, name='api_dashboard_notifications'),
]
