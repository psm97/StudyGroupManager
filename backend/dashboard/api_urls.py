from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.api_stats, name='api_dashboard_stats'),
]
