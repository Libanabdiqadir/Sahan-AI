from rest_framework import serializers
from djoser.serializers import (
    UserCreateSerializer as BaseUserCreateSerializer,
    UserCreatePasswordRetypeSerializer as BasePasswordRetypeSerializer,
)
from .models import User, ResumeHistory, UserProfile, Document

# Well-known disposable / throwaway email providers.
# Extend this list or swap in a package (e.g. disposable-email-domains) as needed.
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
    fields = ['id', 'email', 'profile_picture', 'first_name', 'last_name']


class UserCreateSerializer(BasePasswordRetypeSerializer):
  # Extend BasePasswordRetypeSerializer (not the plain base) so that djoser's
  # password-match validation and re_password field are included.
  # re_password is intentionally omitted from Meta.fields — the parent adds it
  # dynamically in __init__, and listing it here would cause DRF to search for
  # a model field named re_password and raise ImproperlyConfigured.
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
    model= ResumeHistory
    fields = [
      'id', 'user', 'user_details', 'company_name', 'job_title', 
      'tailored_data', 'cover_letter_text', 'job_description', 
      'status', 'created_at', 'documents'
    ]
