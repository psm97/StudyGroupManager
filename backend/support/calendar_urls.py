from django.urls import path
from . import views

urlpatterns = [
    path('api/events/', views.api_calendar_events, name='api_calendar_events'),
    path('api/events/create/', views.api_calendar_event_create, name='api_calendar_event_create'),
    path('api/events/<int:event_id>/delete/', views.api_calendar_event_delete, name='api_calendar_event_delete'),
]
