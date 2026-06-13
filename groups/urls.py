from django.urls import path
from . import views

urlpatterns = [
    path('group_list/', views.group_list_view, name='group_list'),
    path('group_detail/', views.group_detail_view, name='group_detail'),
    path('group_home/', views.group_home_view, name='group_home'),
    path('<int:group_id>/home/', views.group_home_view, name='group_home_detail'),

]