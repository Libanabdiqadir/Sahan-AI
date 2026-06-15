from django.apps import AppConfig
from django.contrib.auth import get_user_model
import os

class CoreConfig(AppConfig):
    name = 'core'
    default_auto_field = 'django.db.models.BigAutoField'

    def ready(self):

        try: 
            import core.signals
        except ImportError:
            pass

        admin_username = os.environ.get('DJANGO_SUPERUSER_USERNAME')
        admin_email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        admin_password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')


        if admin_username and admin_password:
            User = get_user_model() 
            if not User.objects.filter(is_superuser=True).exists():
                print("Creating initial superuser securely from environment variables...")
                User.objects.create_superuser(
                    username=admin_username,
                    email=admin_email,
                    password=admin_password
                )
