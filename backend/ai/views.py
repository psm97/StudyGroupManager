from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json


def ai_attendance_analysis_view(request):
    return render(request, 'ai/ai_attendance_analysis.html')

def ai_monthly_report_view(request):
    return render(request, 'ai/ai_monthly_report.html')

def ai_planner_view(request):
    return render(request, 'ai/ai_planner.html')


# ── REST API ──────────────────────────────────────────────────────────────────
def _auth(request):
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    return None

def _is_leader(user_id, group_id):
    from groups.models import GroupMembership
    return GroupMembership.objects.filter(
        user_id=user_id, group_id=group_id, role='leader', is_active=True
    ).exists()

def _calc_rate(user_id, group_id):
    from attendance.models import AttendanceRecord, AttendanceSession
    sessions = AttendanceSession.objects.filter(group_id=group_id)
    total = sessions.count()
    if total == 0:
        return 0
    present = AttendanceRecord.objects.filter(
        session__in=sessions, user_id=user_id, status='present'
    ).count()
    return round(present / total * 100)


def api_attendance_analysis(request):
    """GET /api/ai/attendance-analysis/?group_id=X"""
    err = _auth(request)
    if err:
        return err

    group_id = request.GET.get('group_id')
    if not group_id:
        return JsonResponse({'error': 'group_id required'}, status=400)

    from .models import AttendanceRiskAnalysis
    from groups.models import GroupMembership

    is_leader = _is_leader(request.user.id, group_id)

    # personal risk
    personal_qs = AttendanceRiskAnalysis.objects.filter(
        group_id=group_id, user=request.user
    ).order_by('-analyzed_at')
    personal = personal_qs.first()
    personal_data = None
    if personal:
        personal_data = {
            'risk_score': personal.risk_score,
            'dropout_probability': personal.dropout_probability,
            'pattern_summary': personal.pattern_summary,
            'analyzed_at': personal.analyzed_at.strftime('%Y-%m-%d'),
        }

    result = {'is_leader': is_leader, 'personal': personal_data}

    if is_leader:
        # group-level: one record per member (latest)
        members_qs = GroupMembership.objects.filter(
            group_id=group_id, is_active=True
        ).select_related('user')

        member_risks = []
        for m in members_qs:
            latest = AttendanceRiskAnalysis.objects.filter(
                group_id=group_id, user=m.user
            ).order_by('-analyzed_at').first()
            rate = _calc_rate(m.user.id, group_id)
            member_risks.append({
                'user_id': m.user.id,
                'nickname': m.user.nickname or m.user.username,
                'role': m.role,
                'attendance_rate': rate,
                'risk_score': latest.risk_score if latest else None,
                'dropout_probability': latest.dropout_probability if latest else None,
                'pattern_summary': latest.pattern_summary if latest else '',
            })

        # group-level analysis record
        group_analysis = AttendanceRiskAnalysis.objects.filter(
            group_id=group_id, user__isnull=True
        ).order_by('-analyzed_at').first()

        # churn factors (high risk members)
        churn_factors = [
            m for m in member_risks
            if m['dropout_probability'] is not None and m['dropout_probability'] >= 0.6
        ]

        # risk log history (group-level records over time)
        risk_logs_qs = AttendanceRiskAnalysis.objects.filter(
            group_id=group_id, user__isnull=True
        ).order_by('analyzed_at')[:20]
        risk_logs = [
            {
                'date': r.analyzed_at.strftime('%Y-%m-%d'),
                'risk_score': r.risk_score,
                'dropout_probability': r.dropout_probability,
            }
            for r in risk_logs_qs
        ]

        result.update({
            'member_risks': member_risks,
            'churn_factors': churn_factors,
            'risk_logs': risk_logs,
            'group_analysis': {
                'risk_score': group_analysis.risk_score if group_analysis else None,
                'dropout_probability': group_analysis.dropout_probability if group_analysis else None,
                'pattern_summary': group_analysis.pattern_summary if group_analysis else '',
            } if group_analysis else None,
        })

    return JsonResponse(result)


def api_monthly_report(request):
    """GET /ai/monthly-report/?group_id=X"""
    err = _auth(request)
    if err:
        return err

    group_id = request.GET.get('group_id')
    if not group_id:
        return JsonResponse({'error': 'group_id required'}, status=400)

    from .models import MonthlyReport
    from attendance.models import AttendanceRecord, AttendanceSession
    from groups.models import StudyGroup

    try:
        group_name = StudyGroup.objects.get(id=group_id).name
    except StudyGroup.DoesNotExist:
        return JsonResponse({'error': 'Group not found'}, status=404)

    is_leader = _is_leader(request.user.id, group_id)

    # personal reports
    personal_reports_qs = MonthlyReport.objects.filter(
        group_id=group_id, user=request.user
    ).order_by('-report_year', '-report_month')[:12]

    def _report_dict(r):
        return {
            'id': r.id,
            'report_year': r.report_year,
            'report_month': r.report_month,
            'content': r.content,
            'generated_at': r.generated_at.strftime('%Y-%m-%d'),
        }

    personal_reports = [_report_dict(r) for r in personal_reports_qs]

    # personal attendance stats for this group
    sessions = AttendanceSession.objects.filter(group_id=group_id)
    total = sessions.count()
    present = AttendanceRecord.objects.filter(
        session__in=sessions, user=request.user, status='present'
    ).count()
    late = AttendanceRecord.objects.filter(
        session__in=sessions, user=request.user, status='late'
    ).count()
    rate = round(present / total * 100) if total else 0

    result = {
        'is_leader': is_leader,
        'group_name': group_name,
        'personal_reports': personal_reports,
        'attendance_stats': {
            'total': total,
            'present': present,
            'late': late,
            'rate': rate,
        },
    }

    if is_leader:
        group_reports_qs = MonthlyReport.objects.filter(
            group_id=group_id, user__isnull=True
        ).order_by('-report_year', '-report_month')[:12]
        result['group_reports'] = [_report_dict(r) for r in group_reports_qs]

    return JsonResponse(result)


def api_monthly_report_detail(request, report_id):
    """GET /ai/monthly-report/<id>/"""
    err = _auth(request)
    if err:
        return err

    from .models import MonthlyReport

    try:
        report = MonthlyReport.objects.get(id=report_id)
    except MonthlyReport.DoesNotExist:
        return JsonResponse({'error': 'Not found'}, status=404)

    is_leader = _is_leader(request.user.id, report.group_id)
    if report.user and report.user != request.user and not is_leader:
        return JsonResponse({'error': 'Forbidden'}, status=403)
    if not report.user and not is_leader:
        return JsonResponse({'error': 'Forbidden'}, status=403)

    return JsonResponse({
        'id': report.id,
        'group_id': report.group_id,
        'report_year': report.report_year,
        'report_month': report.report_month,
        'content': report.content,
        'generated_at': report.generated_at.strftime('%Y-%m-%d'),
        'is_group_report': report.user is None,
    })


def api_planner_init(request):
    """GET /api/ai/planner/init/?group_id=X"""
    err = _auth(request)
    if err:
        return err

    group_id = request.GET.get('group_id')
    if not group_id:
        return JsonResponse({'error': 'group_id required'}, status=400)

    from .models import StudyGoal, WeeklyProgress, PlannerChatHistory

    is_leader = _is_leader(request.user.id, group_id)

    # personal goal
    personal_goal = StudyGoal.objects.filter(
        group_id=group_id, user=request.user
    ).order_by('-created_at').first()

    def _goal_dict(g):
        progresses = WeeklyProgress.objects.filter(goal=g).order_by('year', 'week_number')
        return {
            'id': g.id,
            'title': g.title,
            'description': g.description,
            'target_date': g.target_date.strftime('%Y-%m-%d'),
            'achievement_probability': g.achievement_probability,
            'ai_suggestions': g.ai_suggestions,
            'weekly_progress': [
                {
                    'year': p.year,
                    'week_number': p.week_number,
                    'performance_score': p.performance_score,
                    'summary': p.summary,
                }
                for p in progresses
            ],
        }

    # chat history (last 50 messages)
    chat_qs = PlannerChatHistory.objects.filter(
        group_id=group_id, user=request.user
    ).order_by('sent_at')[:50]
    chat_history = [
        {'role': c.role, 'message': c.message, 'sent_at': c.sent_at.strftime('%Y-%m-%d %H:%M')}
        for c in chat_qs
    ]

    from django.utils import timezone as tz
    import datetime

    def _goal_to_flat(g):
        if not g:
            return {}
        today = tz.now().date()
        days_rem = (g.target_date - today).days if g.target_date else 0
        suggestions = [s.strip() for s in g.ai_suggestions.split('\n') if s.strip()]
        progresses = WeeklyProgress.objects.filter(goal=g).order_by('year', 'week_number')
        progress_rate = 0
        if progresses.exists():
            progress_rate = round(progresses.last().performance_score * 100)
        return {
            'achievement_prob': round(g.achievement_probability * 100),
            'progress_rate': progress_rate,
            'expected_date': g.target_date.strftime('%Y.%m.%d') if g.target_date else '—',
            'days_remaining': days_rem,
            'ai_suggestions': suggestions,
            'title': g.title,
            'description': g.description,
        }

    personal_flat = _goal_to_flat(personal_goal)

    result = {
        'is_leader': is_leader,
        'chat_history': chat_history,
        **personal_flat,
    }

    if is_leader:
        group_goal = StudyGoal.objects.filter(
            group_id=group_id, user__isnull=True
        ).order_by('-created_at').first()
        group_flat = _goal_to_flat(group_goal)
        result['group_achievement_prob'] = group_flat.get('achievement_prob', 0)
        result['group_progress_rate'] = group_flat.get('progress_rate', 0)
        result['group_expected_date'] = group_flat.get('expected_date', '—')
        result['group_days_remaining'] = group_flat.get('days_remaining', 0)
        result['group_ai_suggestions'] = group_flat.get('ai_suggestions', [])

    return JsonResponse(result)


_STUDY_PLANNER_SYSTEM_PROMPT = """당신은 스터디 그룹 관리 플랫폼 "StudyGroupManager"의 전문 AI 스터디 플래너 어시스턴트입니다.
사용자가 효율적으로 학습 목표를 달성하고, 스터디 그룹을 성공적으로 운영할 수 있도록 돕는 전문 학습 코치입니다.

[역할 및 전문 분야]
- 개인 및 그룹 스터디 목표 설정과 달성 전략 수립
- 출석률 분석 및 지속적인 참여 유지 방안 제안
- 주차별·월별 학습 계획 수립 및 일정 관리
- 스터디 그룹 리더를 위한 팀 운영 전략 (멤버 동기 부여, 참여율 향상)
- 학습 슬럼프 극복과 집중력 향상 방법
- 벌금 및 패널티 제도 운영 조언
- 스터디 자료 관리 및 공유 방법 제안

[상담 원칙]
1. 사용자의 현재 출석률, 학습 목표, 남은 기간을 파악하고 맞춤형 조언을 제공하세요.
2. 구체적이고 실행 가능한 학습 계획을 단계별로 제시하세요.
3. 출석이 낮거나 목표 달성이 어려울 때 비판하지 말고, 원인을 공감하며 개선 방향을 안내하세요.
4. 스터디 그룹의 특성(인원, 목표 과목, 일정, 분야)을 고려한 현실적인 조언을 하세요.
5. 사용자가 지치거나 불안해할 때는 먼저 공감하고 긍정적인 동기 부여 메시지를 전달하세요.
6. 리더와 멤버에게 각자의 역할에 맞는 맞춤형 조언을 제공하세요.
7. 수치(출석률, 달성 확률 등)를 언급할 때 구체적인 개선 목표와 함께 제시하세요.

[응답 형식]
- 답변은 간결하고 명확하게 제공하세요. (불필요한 서론 생략)
- 학습 계획이나 전략 제시 시 번호나 글머리 기호를 사용해 구조화하세요.
- 중요한 포인트는 강조하여 한눈에 파악할 수 있도록 하세요.
- 항상 한국어로 답변하세요.
- 친근하고 격려하는 어투를 사용하세요.
- 답변 마지막에는 다음 행동 제안이나 후속 질문을 1가지 덧붙여 대화를 이어가세요."""


def _get_google_api_key():
    import os
    return os.environ.get('GOOGLE_API_KEY', '')


@csrf_exempt
def api_planner_chat(request):
    """POST /api/ai/planner/chat/"""
    err = _auth(request)
    if err:
        return err

    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    group_id = body.get('group_id')
    message = body.get('message', '').strip()
    if not group_id or not message:
        return JsonResponse({'error': 'group_id and message required'}, status=400)

    from .models import PlannerChatHistory

    # Fetch previous history before saving new message
    history_qs = list(
        PlannerChatHistory.objects.filter(
            group_id=group_id, user=request.user
        ).order_by('sent_at')
    )

    # Build Gemini-format history (last 20 messages, must start with 'user')
    gemini_history = [
        {'role': 'user' if h.role == 'user' else 'model', 'parts': [h.message]}
        for h in history_qs[-20:]
    ]
    # Gemini requires history to start with a user turn
    while gemini_history and gemini_history[0]['role'] == 'model':
        gemini_history.pop(0)

    # Save user message to DB
    PlannerChatHistory.objects.create(
        group_id=group_id,
        user=request.user,
        role='user',
        message=message,
    )

    # Call Gemini API
    api_key = _get_google_api_key()
    if not api_key:
        ai_reply = "AI 서비스 키가 설정되지 않았습니다. 관리자에게 문의해 주세요."
    else:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(
                model_name='gemini-2.5-flash',
                system_instruction=_STUDY_PLANNER_SYSTEM_PROMPT,
            )
            chat_session = model.start_chat(history=gemini_history)
            response = chat_session.send_message(message)
            ai_reply = response.text
        except Exception as e:
            ai_reply = f"AI 응답 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. ({str(e)})"

    # Save AI response to DB
    ai_record = PlannerChatHistory.objects.create(
        group_id=group_id,
        user=request.user,
        role='ai',
        message=ai_reply,
    )

    return JsonResponse({
        'role': 'ai',
        'message': ai_reply,
        'sent_at': ai_record.sent_at.strftime('%Y-%m-%d %H:%M'),
    })
