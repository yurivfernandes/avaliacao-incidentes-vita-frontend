from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('access', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='phone',
            field=models.CharField(blank=True, max_length=15),
        ),
        migrations.AddField(
            model_name='user',
            name='company_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='user',
            name='cpf',
            field=models.CharField(blank=True, max_length=11, unique=True),
        ),
        migrations.AddField(
            model_name='user',
            name='cep',
            field=models.CharField(blank=True, max_length=8),
        ),
    ]
