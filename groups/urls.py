from django.urls import path
from . import views

urlpatterns = [
    path('group_list/', views.group_list_view, name='group_list'),     # 그룹 목록
    path('group_detail/', views.group_detail_view, name='group_detail'),    # 그룹 상세
]