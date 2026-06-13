from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.conf import settings

class CustomUserManager(BaseUserManager):

  def create_user(self, email, password=None, **extra_fields):
    if not email:
      raise ValueError('Email is required')
    email = self.normalize_email(email)
    user = self.model(email=email, **extra_fields)
    user.set_password(password)
    user.save(using=self._db)
    return user
  
  def create_superuser(self, email, password=None, **extra_fields):
    extra_fields.setdefault('is_staff', True)
    extra_fields.setdefault('is_superuser', True)
    return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
  
  username = None
  email = models.EmailField(unique=True)

  objects = CustomUserManager()

  USERNAME_FIELD = 'email'
  REQUIRED_FIELDS = []

  profile_picture = models.ImageField(
    upload_to='profile_pics/%Y/%m/',
    null=True,
    blank=True,
  )

  groups = models.ManyToManyField(
        'auth.Group',
        related_name='custom_user_groups', 
        blank=True
    )

  user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_permissions',
        blank=True
    )

  def __str__(self):
    return self.email

class UserProfile(models.Model):

  user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
  full_name = models.CharField(max_length=255)
  contact_email = models.EmailField(max_length=255, blank=True, null=True)
  linkedin_url = models.URLField(max_length=500, blank=True, null=True)

  phone_number = models.CharField(max_length=20, blank=True)
  location = models.CharField(max_length=255, blank=True)

  education_history = models.JSONField(default=list, blank=True)
  work_experience = models.JSONField(default=list, blank=True)
  projects = models.JSONField(default=list, blank=True)
  certifications = models.JSONField(default=list, blank=True)

  languages = models.JSONField(default=list, blank=True)

  master_data = models.JSONField(default=dict, help_text="Structure career data: skills, education, experience")

  def get_master_data(self):
    return {
      'full_name': self.full_name,
      'email': self.contact_email,
      'linkedin_url': self.linkedin_url,
      'location': self.location,
      'education': self.education_history,
      'experience': self.work_experience,
      'projects': self.projects,
      'certifications': self.certifications,
      'languages': self.languages,
      'phone_number': self.phone_number,
      'skills': self.master_data.get('tech_skills', []),
      'soft_skills': self.master_data.get('soft_skills', [])
    }

  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return f"Profile for {self.user.email}"

class ResumeHistory(models.Model):

  STATUS_CHOICES = [
    ('processing', 'Processing'),   # AI generation in flight
    ('completed', 'Completed'),     # successfully generated and saved
    ('failed', 'Failed'),           # any failure does NOT count against quota
  ]

  user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='resumes')
  company_name = models.CharField(max_length=255, blank=True)
  job_title = models.CharField(max_length=255)
  job_description = models.TextField(help_text="The job description the resume was tailored for.")

  tailored_data = models.JSONField(default=dict)
  cover_letter_text = models.TextField(blank=True)

  status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')

  error_message = models.TextField(blank=True)
  completed_at = models.DateTimeField(null=True, blank=True)

  idempotency_key = models.CharField(max_length=64, blank=True, db_index=True)

  created_at = models.DateTimeField(auto_now_add=True)

  class Meta:
    ordering = ['-created_at']
    verbose_name_plural = 'Resume Histories'
    indexes = [

      models.Index(fields=['user', 'status', 'created_at'], name='resume_user_status_date_idx'),

      models.Index(fields=['user', 'idempotency_key'], name='resume_user_idem_idx'),
    ]

class SiteVisit(models.Model):
  """One record per authenticated user per calendar day. Used for traffic analytics."""
  user = models.ForeignKey(
    settings.AUTH_USER_MODEL,
    on_delete=models.CASCADE,
    related_name='visits',
  )
  date = models.DateField(db_index=True)

  class Meta:
    unique_together = [('user', 'date')]

  def __str__(self):
    return f"{self.user.email} — {self.date}"


class Document (models.Model):
  resume_history = models.ForeignKey(ResumeHistory, on_delete=models.CASCADE, related_name='documents')
  pdf_file = models.FileField(upload_to='generated_resumes/%Y/%m/%d/')
  template_name = models.CharField(max_length=100, default='modern_minimalist')

  def __str__(self):
    return f"{self.template_name} PDF for {self.resume_history.job_title}"
  

class UserSubscription(models.Model):
  PLAN_CHOICES = [
    ('free', 'Free'),
    ('Pro', 'Pro (Monthly)'),
    ('elite', 'Elite (Yearly)'),
  ]

  user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscriptions')
  stripe_customer_id = models.CharField(max_length=255, blank=True, null=True)
  stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True)
  plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default='free')

  is_active = models.BooleanField(default=True)

  billing_cycle_start = models.DateTimeField(null=True, blank=True)

  created_at = models.DateTimeField(auto_now_add=True)
  updated_at = models.DateTimeField(auto_now=True)

  def __str__(self):
    return f"{self.user.email} - {self.plan}"