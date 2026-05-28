from rest_framework import serializers
from .models import User, ResumeHistory, UserProfile, Document

class UserSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['id', 'email', 'profile_picture', 'first_name', 'last_name']

class DocumentSerializer(serializers.ModelSerializer):
  class Meta:
    model = Document
    fields = ['id', 'pdf_file', 'template_name']

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'full_name', 'linkedin_url', 'contact_email',
            'phone_number', 'location', 'education_history',
            'work_experience', 'languages', 'master_data',
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
