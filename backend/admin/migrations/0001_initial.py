from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Admin',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('username',   models.CharField(max_length=150, unique=True)),
                ('email',      models.CharField(blank=True, default='', max_length=254, unique=True)),
                ('password',   models.CharField(max_length=256)),
                ('is_active',  models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'admin',
                'app_label': 'sgadmin',
            },
        ),
    ]
