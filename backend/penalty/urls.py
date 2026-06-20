from django.urls import path
from . import views

urlpatterns = [
    path('penalty_management/', views.penalty_management_view, name='penalty_management'),
    path('api/my-history/', views.api_my_history, name='api_penalty_my_history'),
]