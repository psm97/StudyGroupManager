from django.shortcuts import render
from datetime import datetime

def login_view(request):
    return render(request, 'accounts/login.html', {
        'current_year': datetime.now().year   # footer에 연도 전달
    })

def profile_view(request):
    return render(request,'accounts/profile.html')

def signup_view(request):
    return render(request,'accounts/signup.html')