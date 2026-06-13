from django.shortcuts import render
from datetime import datetime

def notice_view(request):
    return render(request,'support/notice_board.html')

def resource_room_view(request):
    return render(request,'support/resource_room.html')

def calendar_view(request):
    return render(request, 'support/calendar.html')

