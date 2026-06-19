from django.conf import settings
from django.db import models

from groups.models import StudyGroup


class AttendanceRiskAnalysis(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='risk_analyses')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='risk_analyses',
        null=True,
        blank=True,  # NULL = 그룹 전체 분석 (리더 전용), NOT NULL = 개인 분석
    )
    risk_score = models.FloatField()            # 결석 위험도 0.0~1.0
    dropout_probability = models.FloatField()   # 탈퇴 예측 지표 0.0~1.0
    pattern_summary = models.TextField()        # 출석 패턴 분석 내용
    analyzed_at = models.DateTimeField(auto_now_add=True)  # 누적 저장으로 이력 추적

    class Meta:
        db_table = 'ai_attendanceriskanalysis'


class MonthlyReport(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='monthly_reports')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='monthly_reports',
        null=True,
        blank=True,  # NULL = 그룹 보고서 (리더 전용), NOT NULL = 개인 보고서
    )
    report_year = models.IntegerField()
    report_month = models.IntegerField()  # 1~12
    content = models.TextField()          # AI 생성 보고서
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_monthlyreport'
        unique_together = ('group', 'user', 'report_year', 'report_month')


class StudyGoal(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='goals')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='goals',
        null=True,
        blank=True,  # NULL = 그룹 목표 (리더 전용), NOT NULL = 개인 목표
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_date = models.DateField()
    achievement_probability = models.FloatField()  # AI 예측 달성 확률 0.0~1.0
    ai_suggestions = models.TextField()            # AI 개선방안
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'ai_studygoal'


class WeeklyProgress(models.Model):
    goal = models.ForeignKey(StudyGoal, on_delete=models.CASCADE, related_name='weekly_progresses')
    year = models.IntegerField()
    week_number = models.IntegerField()       # 1~53
    performance_score = models.FloatField()   # 주차별 성과 점수 0.0~1.0
    summary = models.TextField(blank=True)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_weeklyprogress'
        unique_together = ('goal', 'year', 'week_number')


class PlannerChatHistory(models.Model):
    ROLE_CHOICES = [('user', '사용자'), ('ai', 'AI')]

    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='chat_histories')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chat_histories',
    )  # 챗봇은 항상 개인 단위
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ai_plannerchathistory'
