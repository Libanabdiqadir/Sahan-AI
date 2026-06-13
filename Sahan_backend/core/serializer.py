from rest_framework import serializers
from djoser.serializers import (
    UserCreateSerializer as BaseUserCreateSerializer,
    UserCreatePasswordRetypeSerializer as BasePasswordRetypeSerializer,
)
from .models import User, ResumeHistory, UserProfile, Document, UserSubscription

_DISPOSABLE_DOMAINS = frozenset({
    "mailinator.com", "guerrillamail.com", "guerrillamail.net", "guerrillamail.org",
    "guerrillamail.biz", "guerrillamail.de", "guerrillamail.info",
    "throwaway.email", "temp-mail.org", "tempmail.com", "tempmail.net",
    "yopmail.com", "yopmail.fr", "sharklasers.com", "guerrillamailblock.com",
    "grr.la", "spam4.me", "trashmail.com", "trashmail.me", "trashmail.net",
    "trashmail.io", "trashmail.at", "trashmail.xyz", "dispostable.com",
    "mailnesia.com", "mailnull.com", "spamgourmet.com", "spamgourmet.net",
    "maildrop.cc", "harakirimail.com", "mailexpire.com", "fakeinbox.com",
    "getnada.com", "nada.email", "mailsac.com",
    "10minutemail.com", "10minutemail.net", "10minutemail.org",
    "10minutemail.de", "10minutemail.be", "10minutemail.co.uk",
    "10minutemail.pl", "10minutemail.us", "10minutemail.pro",
    "20minutemail.com", "20minutemail.it",
    "tempinbox.com", "temporaryemail.net", "tempr.email",
    "discard.email", "crap.one", "spamfree24.org", "spamfree24.de",
    "getonemail.com", "getonemail.net", "throwme.com", "throwam.com",
    "discardmail.com", "discardmail.de", "spamhereplease.com",
    "mailnew.com", "jetable.fr.nf", "cool.fr.nf", "nospam.ze.tc",
    "nomail.xl.cx", "mega.zik.dj", "speed.1s.fr",
    "courriel.fr.nf", "moncourrier.fr.nf", "monemail.fr.nf", "monmail.fr.nf",
    "filzmail.com", "mailtemp.info", "tempinbox.net", "spamgourmet.org",
    "mailscrap.com", "spamfree24.info", "spamfree24.net", "spamfree24.com",
    "spamfree.eu", "spam.la", "spam.su", "spamboy.com",
    "binkmail.com", "bobmail.info", "dayrep.com", "einrot.com",
    "fleckens.hu", "gustr.com", "jourrapide.com", "objectmail.com",
    "obobbo.com", "rhyta.com", "sogetthis.com", "spamgourmet.info",
    "superrito.com", "teleworm.us", "trbvm.com", "wegwerfmail.de",
    "wegwerfmail.net", "wegwerfmail.org",
})

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['id', 'email', 'profile_picture', 'first_name', 'last_name', 'is_staff']
    read_only_fields = ['is_staff']


class AdminUserSerializer(serializers.ModelSerializer):
  """
  Read-only representation of a user for the staff admin dashboard.
  Includes the subscription plan and completed-resume count.
  Works whether the queryset carries a 'completed_resume_count' annotation
  (fast, used for list) or not (falls back to a single query, used for
  individual-record responses after toggle_ban / update_subscription).
  """
  plan         = serializers.SerializerMethodField()
  resume_count = serializers.SerializerMethodField()

  class Meta:
    model  = User
    fields = [
      'id', 'email', 'first_name', 'last_name',
      'is_active', 'is_staff', 'date_joined',
      'plan', 'resume_count',
    ]
    read_only_fields = fields

  def get_plan(self, obj):
    try:
      return obj.subscriptions.plan
    except (UserSubscription.DoesNotExist, AttributeError):
      return 'free'

  def get_resume_count(self, obj):
    if hasattr(obj, 'completed_resume_count'):
      return obj.completed_resume_count
    return obj.resumes.filter(status='completed').count()


class UserCreateSerializer(BasePasswordRetypeSerializer):

  class Meta(BaseUserCreateSerializer.Meta):
    model = User
    fields = ['id', 'email', 'password', 'first_name', 'last_name']

  def validate_email(self, value: str) -> str:
    domain = value.split("@")[-1].lower()
    if domain in _DISPOSABLE_DOMAINS:
      raise serializers.ValidationError(
        "Disposable email addresses are not permitted. Please use a permanent email."
      )
    return value
  
  def create(self, validated_data):
    first_name = validated_data.pop('first_name', '')
    last_name = validated_data.pop('last_name', '')

    user = super().create(validated_data)

    user.first_name = first_name
    user.last_name = last_name
    user.save()

    return user 

class DocumentSerializer(serializers.ModelSerializer):
  job_title = serializers.CharField(source='resume_history.job_title', read_only=True)
  company_name = serializers.CharField(source='resume_history.company_name', read_only=True)

  class Meta:
    model = Document
    fields = ['id', 'resume_history', 'pdf_file', 'template_name', 'job_title', 'company_name']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'full_name', 'linkedin_url', 'contact_email',
            'phone_number', 'location', 'education_history',
            'work_experience', 'projects','certifications', 'languages', 'master_data',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ResumeHistorySerializer(serializers.ModelSerializer):
  documents = DocumentSerializer(many=True, read_only=True)
  user_details = UserSerializer(source='user', read_only=True)
  class Meta:
    model = ResumeHistory
    fields = [
      'id', 'user', 'user_details', 'company_name', 'job_title',
      'tailored_data', 'cover_letter_text', 'job_description',
      'status', 'error_message', 'created_at', 'documents',
    ]
    read_only_fields = ['id', 'user', 'user_details', 'status', 'error_message', 'created_at', 'documents']
