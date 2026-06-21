from django.contrib.auth.hashers import make_password, check_password as django_check_password
from django.db import models


class Admin(models.Model):
    username   = models.CharField(max_length=150, unique=True)
    email      = models.CharField(max_length=254, unique=True, blank=True, default='')
    password   = models.CharField(max_length=256)
    is_active  = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'admin'
        app_label = 'sgadmin'

    def check_password(self, raw_password: str) -> bool:
        return django_check_password(raw_password, self.password)

    @staticmethod
    def hash_password(raw_password: str) -> str:
        return make_password(raw_password)
