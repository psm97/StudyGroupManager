from django.shortcuts import render

# Create your views here.
def dashboard_view(request):
    return render(request, 'main/dashboard.html')

def admin_view(request):
    return render(request, 'main/admin_dashboard.html')