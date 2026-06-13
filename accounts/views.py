from django.shortcuts import render, redirect
from django.contrib.auth import logout as auth_logout
from datetime import datetime

def login_view(request):
    return render(request, 'accounts/login.html', {
        'current_year': datetime.now().year
    })

def profile_view(request):
    return render(request, 'accounts/profile.html')

def signup_view(request):
    return render(request, 'accounts/signup.html')

def logout_view(request):
    auth_logout(request)
    return redirect('login')