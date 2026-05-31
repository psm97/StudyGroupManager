from django.shortcuts import render
from datetime import datetime

def login_view(request):
    return render(request, 'login/login.html', {
        'current_year': datetime.now().year   # footer에 연도 전달
    })