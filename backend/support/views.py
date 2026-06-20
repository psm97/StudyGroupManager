from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


def notice_view(request):
    return render(request, 'support/notice_board.html')

def resource_room_view(request):
    return render(request, 'support/resource_room.html')

def calendar_view(request):
    return render(request, 'support/calendar.html')


# ── REST API ──────────────────────────────────────────────────────────────────
def _auth(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    return None


def api_notices(request):
    """GET /support/api/notices/?group_id=X"""
    err = _auth(request)
    if err:
        return err

    from .models import Notice
    from groups.models import GroupMembership

    group_id = request.GET.get('group_id')

    if group_id:
        # group notices + global notices
        qs = Notice.objects.filter(
            group_id=group_id
        ).select_related('author').order_by('-is_pinned', '-created_at')
    else:
        # global notices only
        qs = Notice.objects.filter(
            group__isnull=True
        ).select_related('author').order_by('-is_pinned', '-created_at')

    items = [
        {
            'id': n.id,
            'title': n.title,
            'content': n.content,
            'author': n.author.nickname or n.author.username,
            'group_id': n.group_id,
            'is_pinned': n.is_pinned,
            'created_at': n.created_at.strftime('%Y-%m-%d'),
        }
        for n in qs[:50]
    ]
    return JsonResponse({'items': items})


def api_calendar_events(request):
    """GET /calendar/api/events/?group_id=X&year=YYYY&month=MM"""
    err = _auth(request)
    if err:
        return err

    from .models import CalendarEvent

    group_id = request.GET.get('group_id')
    year = request.GET.get('year')
    month = request.GET.get('month')

    qs = CalendarEvent.objects.select_related('created_by')
    if group_id:
        qs = qs.filter(group_id=group_id)
    if year and month:
        qs = qs.filter(event_date__year=int(year), event_date__month=int(month))

    items = [
        {
            'id': e.id,
            'title': e.title,
            'description': e.description,
            'event_date': e.event_date.strftime('%Y-%m-%d'),
            'group_id': e.group_id,
            'created_by': e.created_by.nickname or e.created_by.username,
        }
        for e in qs.order_by('event_date')[:100]
    ]
    return JsonResponse({'items': items})


@csrf_exempt
def api_calendar_event_create(request):
    """POST /calendar/api/events/create/"""
    err = _auth(request)
    if err:
        return err

    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    from .models import CalendarEvent
    from groups.models import GroupMembership

    group_id = body.get('group_id')
    title = body.get('title', '').strip()
    event_date = body.get('event_date')

    if not group_id or not title or not event_date:
        return JsonResponse({'error': 'group_id, title, event_date required'}, status=400)

    is_member = GroupMembership.objects.filter(
        user=request.user, group_id=group_id, is_active=True
    ).exists()
    if not is_member:
        return JsonResponse({'error': 'Forbidden'}, status=403)

    event = CalendarEvent.objects.create(
        group_id=group_id,
        title=title,
        description=body.get('description', ''),
        event_date=event_date,
        created_by=request.user,
    )
    return JsonResponse({
        'id': event.id,
        'title': event.title,
        'event_date': event.event_date.strftime('%Y-%m-%d'),
    })


@csrf_exempt
def api_calendar_event_delete(request, event_id):
    """DELETE /calendar/api/events/<id>/delete/"""
    err = _auth(request)
    if err:
        return err

    from .models import CalendarEvent
    from groups.models import GroupMembership

    try:
        event = CalendarEvent.objects.get(id=event_id)
    except CalendarEvent.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    is_leader = GroupMembership.objects.filter(
        user=request.user, group_id=event.group_id, role='leader', is_active=True
    ).exists()
    if event.created_by != request.user and not is_leader:
        return JsonResponse({'error': 'Forbidden'}, status=403)

    event.delete()
    return JsonResponse({'ok': True})
