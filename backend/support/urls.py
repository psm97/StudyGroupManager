from django.urls import path
from . import views

urlpatterns = [
    path('notice/', views.notice_view, name='notice'),
    path('resource_room/', views.resource_room_view, name='resource_room'),
    path('calendar/', views.calendar_view, name='calendar'),
    # REST API
    path('api/notices/', views.api_notices, name='api_notices'),
]
