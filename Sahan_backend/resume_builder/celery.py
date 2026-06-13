import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'resume_builder.settings')

app = Celery('resume_builder')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
