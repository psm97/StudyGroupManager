from django.urls import path
from . import views

urlpatterns = [
    path('login/',            views.login_view,           name='login'),
    path('signup/',           views.signup_view,           name='signup'),
    path('logout/',           views.logout_view,           name='logout'),
    path('profile/',          views.profile_view,          name='profile'),
    path('profile/settings/', views.profile_settings_view, name='profile_settings'),
    path('nickname/',         views.nickname_view,         name='nickname'),
    path('nickname/check/',   views.nickname_check_view,   name='nickname_check'),
]