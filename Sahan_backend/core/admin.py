from django.contrib import admin
from .models import User, UserProfile, ResumeHistory, UserSubscription

# Register your models here.

admin.site.register(User)
admin.site.register(UserProfile)
admin.site.register(UserSubscription)

@admin.register(ResumeHistory)
class ResumeHistoryAdmin(admin.ModelAdmin):
  list_display = ('company_name', 'job_title', 'status', 'created_at')
  list_filter = ('status', 'created_at')
  search_fields = ('company_name', 'job_title')