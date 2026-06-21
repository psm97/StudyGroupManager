from django.db import migrations


def remove_default_admin(apps, schema_editor):
    Admin = apps.get_model('sgadmin', 'Admin')
    Admin.objects.filter(username='admin', email='admin@studygroupmanager.com').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('sgadmin', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(remove_default_admin, migrations.RunPython.noop),
    ]
