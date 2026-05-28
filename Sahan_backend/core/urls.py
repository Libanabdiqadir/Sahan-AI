from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
  UserViewSet,
  UserProfileViewSet,
  ResumeHistoryViewSet,
  DocumentViewSet,
  upload_profile_picture,
  generate_cv_pdf, 
  generate_cover_letter_pdf
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', UserProfileViewSet, basename='userprofile')
router.register(r'resumes', ResumeHistoryViewSet, basename='resumehistory')
router.register(r'documents', DocumentViewSet, basename='document')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('upload-picture/', upload_profile_picture),

    path('generate-cv-pdf/', generate_cv_pdf),
    path('generate-cover-letter-pdf/', generate_cover_letter_pdf),
]