from django.shortcuts import render
from datetime import datetime

def ai_attendance_analysis_view(request):
    return render(request,'ai/ai_attendance_analysis.html')

def ai_monthly_report_view(request):
    return render(request,'ai/ai_monthly_report.html')

def ai_planner_view(request):
    return render(request,'ai/ai_planner.html')
