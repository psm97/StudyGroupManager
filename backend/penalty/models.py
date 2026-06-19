from django.conf import settings
from django.db import models

from groups.models import StudyGroup


class Penalty(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='penalties',
    )
    group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='penalties')
    reason = models.TextField()
    amount = models.PositiveIntegerField(default=0)
    is_paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'penalty_penalty'
