from django.apps import AppConfig

class AdminConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = "admin"
    label = 'sgadmin'   # django.contrib.admin 과 레이블 충돌 방지
    verbose_name = '관리자 패널'
