from django.conf import settings
from django.db import models

from groups.models import StudyGroup


class AttendanceSession(models.Model):
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200, blank=True)
    session_date = models.DateField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_sessions',
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance_attendancesession'

    def __str__(self):
        return f"{self.group.name} - {self.session_date}"


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', '출석'),
        ('absent', '결석'),
        ('late', '지각'),
    ]

    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='records')
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendance_records',
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='absent')
    checked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'attendance_attendancerecord'
        unique_together = ('session', 'user')
