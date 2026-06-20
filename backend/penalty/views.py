from django.shortcuts import render
from django.http import JsonResponse
from datetime import datetime

def penalty_management_view(request):
    return render(request,'penalty/penalty_management.html')


# ── REST API ──────────────────────────────────────────────────────────────────
def api_my_history(request):
    """GET /penalty/api/my-history/"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)

    from .models import Penalty

    penalties = Penalty.objects.filter(user=request.user).select_related('group').order_by('-created_at')
    total = sum(p.amount for p in penalties)
    paid = sum(p.amount for p in penalties if p.is_paid)
    unpaid = sum(p.amount for p in penalties if not p.is_paid)

    items = [
        {
            'date': p.created_at.strftime('%Y-%m-%d'),
            'group_name': p.group.name,
            'reason': p.reason,
            'amount': p.amount,
            'is_paid': p.is_paid,
        }
        for p in penalties[:30]
    ]

    return JsonResponse({'total': total, 'paid': paid, 'unpaid': unpaid, 'items': items})


