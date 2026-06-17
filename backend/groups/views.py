from django.shortcuts import render
from datetime import datetime

def group_list_view(request):
    return render(request, 'groups/group_list.html')

def group_detail_view(request):
    return render(request, 'groups/group_detail.html')

def group_home_view(request, group_id=1):
    context = {
        'group_id': group_id,
        'user_role': 'leader',  # TODO: DB 연동 후 실제 역할로 교체
    }
    return render(request, 'groups/group_home.html', context)

