from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_sitevisit'),
    ]

    operations = [
        migrations.AddField(
            model_name='usersubscription',
            name='billing_cycle_start',
            field=models.DateTimeField(
                blank=True,
                null=True,
                help_text='Start of the current 30-day billing cycle. Null falls back to created_at.',
            ),
        ),
    ]
