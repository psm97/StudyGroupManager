from django.shortcuts import render
from datetime import datetime

def attendance_check_view(request):
    return render(request,'attendance/attendance_check.html')

def attendance_stats_view(request):
    return render(request,'attendance/attendance_stats.html')


