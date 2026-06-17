from django.shortcuts import render
from datetime import datetime

def penalty_management_view(request):
    return render(request,'penalty/penalty_management.html')


