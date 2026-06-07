from django.shortcuts import render
from datetime import datetime

def group_list_view(request):
    return render(request,'groups/group_list.html')

def group_detail_view(request):
    return render(request,'groups/group_detail.html')

