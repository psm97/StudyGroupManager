import hashlib
from django.db import migrations


def insert_default_admin(apps, schema_editor):
    Admin = apps.get_model('sgadmin', 'Admin')
    hashed = hashlib.sha256('1234'.encode()).hexdigest()
    Admin.objects.update_or_create(
        username='admin',
        defaults={
            'email':    'admin@studygroupmanager.com',
            'password': hashed,
            'is_active': True,
        },
    )


class Migration(migrations.Migration):

    dependencies = [
        ('sgadmin', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(insert_default_admin, migrations.RunPython.noop),
    ]
