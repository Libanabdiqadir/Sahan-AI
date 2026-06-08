from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
  UserViewSet,
  UserProfileViewSet,
  ResumeHistoryViewSet,
  DocumentViewSet,
  AdminUserViewSet,
  upload_profile_picture,
  generate_cv_pdf,
  generate_cover_letter_pdf,
  google_auth_check,
  google_register,
  subscription_status,
  track_visit,
  analytics_dashboard,
)

router = DefaultRouter()
router.register(r'users',       UserViewSet,        basename='user')
router.register(r'profiles',    UserProfileViewSet, basename='userprofile')
router.register(r'resumes',     ResumeHistoryViewSet, basename='resumehistory')
router.register(r'documents',   DocumentViewSet,    basename='document')
router.register(r'admin/users', AdminUserViewSet,   basename='admin-user')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('upload-picture/', upload_profile_picture),

    path('generate-cv-pdf/', generate_cv_pdf),
    path('generate-cover-letter-pdf/', generate_cover_letter_pdf),

    path('accounts/', include('allauth.urls')),
    path('auth/google/check/',    google_auth_check, name='google_auth_check'),
    path('auth/google/register/', google_register,   name='google_register'),

    path('subscription/status/', subscription_status, name='subscription_status'),

    path('analytics/track/',     track_visit,          name='analytics_track'),
    path('analytics/',           analytics_dashboard,  name='analytics_dashboard'),
]