from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import UserSubscription, UserProfile

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def create_user_subscription(sender, instance, created, **kwargs):
  if created:
    UserSubscription.objects.create(user=instance, plan='free')
    UserProfile.objects.create(user=instance)