from django.shortcuts import render
from django.http import JsonResponse
from django.db import models as django_models


def dashboard_view(request):
    return render(request, 'main/dashboard.html')


# ── REST API ──────────────────────────────────────────────────────────────────
def api_stats(request):
    """GET /api/dashboard/stats/"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    from groups.models import GroupMembership
    from attendance.models import AttendanceRecord
    from penalty.models import Penalty
    from django.utils import timezone

    today = timezone.now().date()
    month_start = today.replace(day=1)

    groups_count = GroupMembership.objects.filter(user=request.user, is_active=True).count()

    records = AttendanceRecord.objects.filter(
        user=request.user,
        session__session_date__gte=month_start,
    )
    present = records.filter(status='present').count()
    total_att = records.count()
    rate = round(present / total_att * 100) if total_att else 0

    unpaid = Penalty.objects.filter(
        user=request.user, is_paid=False
    ).aggregate(s=django_models.Sum('amount'))['s'] or 0

    return JsonResponse({
        'groups': groups_count,
        'attendance': f'{total_att}회' if total_att else '—',
        'penalty': f'₩{unpaid:,}' if unpaid else '₩0',
        'rate': f'{rate}%',
    })

