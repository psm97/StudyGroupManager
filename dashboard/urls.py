from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard_view, name='dashboard'),  
    path('admin_dashboard/', views.admin_view, name='admin_dashboard'),   
]