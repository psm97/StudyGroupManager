from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),     # 로그인
    path('signup/', views.signup_view, name='signup'),    # 회원가입
    path('profile/', views.profile_view, name='profile'),   # 프로필 조회
    path('logout/', views.logout_view, name='logout'),      # 로그아웃
    path('profile/?tab=settings/', views.profile_settings_view, name='profile_settings'), # 프로필 설정
]