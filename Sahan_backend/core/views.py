import logging
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, parser_classes, permission_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
import requests as google_requests
from rest_framework.response import Response

from .models import Document, ResumeHistory, SiteVisit, UserProfile, UserSubscription
from .services import ResumeService, get_subscription_status, reserve_generation_slot
from .serializer import (
  AdminUserSerializer,
  UserSerializer,
  DocumentSerializer,
  UserProfileSerializer,
  ResumeHistorySerializer,
)

logger = logging.getLogger(__name__)

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import HRFlowable, SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from django.http import HttpResponse

from .pdf_templates import (
    harvard_classic,
    modern_professional,
    modern_minimalist,
    executive_navy,
    bold_chronological,
)

TEMPLATE_REGISTRY = {
    'harvard_classic':     harvard_classic,
    'modern_professional': modern_professional,
    'modern_minimalist':   modern_minimalist,
    'executive_navy':      executive_navy,
    'bold_chronological':  bold_chronological,
}


User = get_user_model()

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    @action(detail=False, methods=['GET', 'PATCH'])
    def me(self, request):
        profile, created = UserProfile.objects.get_or_create(user=request.user)
    
        if request.method == 'PATCH':
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # GET
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)


class ResumeHistoryViewSet(viewsets.ModelViewSet):
    serializer_class = ResumeHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ResumeHistory.objects.filter(user=self.request.user)

    @action(detail=False, methods=['POST'])
    def tailor(self, request):
        # ── Step 1: validate input BEFORE touching quota ──────────────────────
        job_description = request.data.get('job_description', '').strip()
        job_title       = request.data.get('job_title', '').strip()
        company_name    = request.data.get('company_name', '').strip()
        # Client should send a UUID per button-click to de-duplicate rapid submissions
        idempotency_key = request.data.get('idempotency_key', '').strip()[:64]

        if not job_description:
            return Response(
                {'error': 'Job description is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Step 2: atomically reserve a quota slot ───────────────────────────
        # SELECT FOR UPDATE on UserSubscription serialises concurrent requests.
        # Raises PermissionDenied (403) with code='limit_reached' if over quota.
        # Returns is_new=False if idempotency_key matches a recent in-flight request.
        resume, is_new = reserve_generation_slot(
            request.user, job_title, company_name, job_description, idempotency_key,
        )

        if not is_new:
            # Duplicate request — return the existing record without re-running AI
            serializer = self.get_serializer(resume)
            return Response(serializer.data)

        # ── Step 3: run AI generation ─────────────────────────────────────────
        # tailor_resume updates the reserved record in-place.
        # On any failure it sets status='failed', which does NOT count as quota.
        resume = ResumeService.tailor_resume(resume)

        serializer = self.get_serializer(resume)
        if resume.status == 'failed':
            return Response(
                {
                    'error': resume.error_message or 'Generation failed. Please try again.',
                    'resume': serializer.data,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(resume_history__user=self.request.user)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_status(request):
    """
    Returns the authenticated user's current plan, monthly quota, and usage.
    Frontend uses this to show the remaining-generations counter and gate the
    Generate button before the user even clicks it.
    """
    return Response(get_subscription_status(request.user))


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_profile_picture(request):
    user = request.user
    if 'profile_picture' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)
    
    user.profile_picture = request.FILES['profile_picture']
    user.save()

    pic_url = request.build_absolute_uri(user.profile_picture.url)

    try:
        profile = user.profile
        master = profile.master_data or {}
        master['profile_picture_url'] = pic_url
        profile.master_data = master
        profile.save()
    except Exception :
        pass
    
    return Response({'profile_picture': pic_url})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_cv_pdf(request):
    data = request.data
    profile = data.get('profile', {})
    tailored = data.get('tailored', {})
    template_name = data.get('template', 'harvard_classic')

    response = HttpResponse(content_type='application/pdf')
    filename = f"{profile.get('full_name', 'CV').replace(' ', '_')}_{template_name}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Access-Control-Expose-Headers'] = 'Content-Disposition'

    template_module = TEMPLATE_REGISTRY.get(template_name, harvard_classic)
    template_module.render_pdf(response, profile, tailored)

    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_cover_letter_pdf(request):
    data = request.data
    profile = data.get('profile', {})
    tailored = data.get('tailored', {})
    job_title = data.get('job_title', '')
    company_name = data.get('company_name', '')

    response = HttpResponse(content_type='application/pdf')
    filename = f"{profile.get('full_name', 'CoverLetter').replace(' ', '_')}_Cover_Letter.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Access-Control-Expose-Headers'] = 'Content-Disposition'

    doc = SimpleDocTemplate(
        response,
        pagesize=A4,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
    )

    name_style = ParagraphStyle('Name', fontName='Times-Bold', fontSize=16,
                                 alignment=TA_CENTER, spaceAfter=3)
    contact_style = ParagraphStyle('Contact', fontName='Times-Roman', fontSize=9,
                                    alignment=TA_CENTER, textColor=colors.HexColor('#4b5563'),
                                    spaceAfter=6)
    body_style = ParagraphStyle('Body', fontName='Times-Roman', fontSize=10.5,
                                 leading=16, spaceAfter=10)
    bold_style = ParagraphStyle('Bold', fontName='Times-Bold', fontSize=10.5, spaceAfter=4)

    story = []

    # Header
    full_name = profile.get('full_name', '')
    story.append(Paragraph(full_name.upper(), name_style))
    contact_parts = [x for x in [
        profile.get('contact_email'),
        profile.get('phone_number'),
        profile.get('location'),
        profile.get('linkedin_url'),
    ] if x]
    story.append(Paragraph('  ·  '.join(contact_parts), contact_style))
    story.append(HRFlowable(width='100%', thickness=1.2, color=colors.HexColor('#1a1a2e'), spaceAfter=16))

    # Date
    from datetime import date
    story.append(Paragraph(date.today().strftime('%B %d, %Y'), body_style))

    # Recipient
    story.append(Paragraph('<b>Hiring Manager</b>', bold_style))
    story.append(Paragraph(company_name, body_style))

    # Subject
    story.append(Paragraph(f'<b>Re: Application for {job_title}</b>', bold_style))
    story.append(Spacer(1, 6))

    # Body
    cover_letter = tailored.get('cover_letter', '')
    for para in cover_letter.split('\n\n'):
        if para.strip():
            story.append(Paragraph(para.strip(), body_style))

    # Sign off
    story.append(Spacer(1, 20))
    story.append(Paragraph('Sincerely,', body_style))
    story.append(Spacer(1, 24))
    story.append(Paragraph(f'<b>{full_name}</b>', bold_style))
    if profile.get('contact_email'):
        story.append(Paragraph(profile['contact_email'], body_style))
    if profile.get('phone_number'):
        story.append(Paragraph(profile['phone_number'], body_style))

    doc.build(story)
    return response


def _verify_google_token(access_token: str) -> dict | None:
    """Fetch user info from Google. Returns info dict or None on failure."""
    try:
        resp = google_requests.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=5,
        )
        resp.raise_for_status()
        info = resp.json()
        if info.get("email") and info.get("email_verified"):
            return info
    except Exception:
        pass
    return None


def _issue_jwt(user) -> dict:
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


@api_view(["POST"])
def google_auth_check(request):
    """
    Step 1 of the Google OAuth flow.
    - Existing account → returns JWT tokens immediately.
    - New account → returns {new_user: true, email} so the frontend can
      collect first_name / last_name / password before creating the account.
    """
    access_token = request.data.get("access_token")
    if not access_token:
        return Response({"error": "access_token is required"}, status=status.HTTP_400_BAD_REQUEST)

    info = _verify_google_token(access_token)
    if not info:
        return Response({"error": "Could not verify Google token"}, status=status.HTTP_400_BAD_REQUEST)

    email = info["email"]
    User = get_user_model()
    try:
        user = User.objects.get(email=email)
        return Response(_issue_jwt(user))
    except User.DoesNotExist:
        return Response({"new_user": True, "email": email})


@api_view(["POST"])
def google_register(request):
    """
    Step 2 — only called for brand-new Google users.
    Re-verifies the Google token (proves they own the email), then creates
    the account with the name and password they chose.
    """
    access_token = request.data.get("access_token")
    first_name   = request.data.get("first_name", "").strip()
    last_name    = request.data.get("last_name",  "").strip()
    password     = request.data.get("password",   "")

    if not all([access_token, first_name, last_name, password]):
        return Response({"error": "All fields are required"}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 8:
        return Response({"error": "Password must be at least 8 characters"}, status=status.HTTP_400_BAD_REQUEST)

    info = _verify_google_token(access_token)
    if not info:
        return Response(
            {"error": "Google session expired — please click 'Sign in with Google' again"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    email = info["email"]
    User = get_user_model()
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "An account with this email already exists. Please sign in."},
            status=status.HTTP_409_CONFLICT,
        )

    user = User.objects.create_user(
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )
    return Response(_issue_jwt(user), status=status.HTTP_201_CREATED)


# ─── Visit Tracking ───────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def track_visit(request):
    """
    Called by the frontend on app mount (once per authenticated session).
    Creates at most one SiteVisit record per user per calendar day, so
    calling it multiple times in a day is safely idempotent.
    """
    today = timezone.now().date()
    SiteVisit.objects.get_or_create(user=request.user, date=today)
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─── Analytics Dashboard ──────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_dashboard(request):
    """
    Staff-only analytics endpoint.
    Returns 404 (not 403) to non-staff so the endpoint is not discoverable.
    """
    if not request.user.is_staff:
        return Response(status=status.HTTP_404_NOT_FOUND)

    User = get_user_model()
    now  = timezone.now()
    today = now.date()

    # ── Date boundaries ───────────────────────────────────────────────────────
    yesterday      = today - timedelta(days=1)
    week_start     = today - timedelta(days=today.weekday())          # Monday
    last_week_end  = week_start - timedelta(days=1)
    last_week_start = last_week_end - timedelta(days=6)
    month_start    = today.replace(day=1)
    last_month_end = month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)
    year_start     = today.replace(month=1, day=1)

    # ── Traffic (unique authenticated visitors per period) ────────────────────
    def visit_count(start, end=None):
        qs = SiteVisit.objects.filter(date__gte=start)
        if end:
            qs = qs.filter(date__lte=end)
        return qs.count()

    traffic = {
        'today':      visit_count(today),
        'yesterday':  visit_count(yesterday, yesterday),
        'this_week':  visit_count(week_start, today),
        'last_week':  visit_count(last_week_start, last_week_end),
        'this_month': visit_count(month_start, today),
        'last_month': visit_count(last_month_start, last_month_end),
        'this_year':  visit_count(year_start, today),
    }

    # ── User stats ────────────────────────────────────────────────────────────
    online_cutoff = now - timedelta(minutes=30)
    users = {
        'total':  User.objects.count(),
        'online': User.objects.filter(last_login__gte=online_cutoff).count(),
        'free':   UserSubscription.objects.filter(plan='free').count(),
        'pro':    UserSubscription.objects.filter(plan='Pro').count(),
        'elite':  UserSubscription.objects.filter(plan='elite').count(),
    }

    # ── Pro users list ────────────────────────────────────────────────────────
    pro_users = list(
        User.objects
        .filter(subscriptions__plan='Pro')
        .order_by('-date_joined')
        .values('id', 'email', 'first_name', 'last_name', 'date_joined')
    )

    # ── Recent resume generations (last 20) ───────────────────────────────────
    from .models import ResumeHistory as RH
    recent = list(
        RH.objects
        .select_related('user')
        .order_by('-created_at')[:20]
        .values('user__email', 'job_title', 'company_name', 'status', 'created_at')
    )

    return Response({
        'traffic':    traffic,
        'users':      users,
        'pro_users':  pro_users,
        'recent_generations': recent,
    })


# ─── Admin User Management ViewSet ───────────────────────────────────────────

class AdminUserViewSet(viewsets.GenericViewSet):
    """
    Staff-only ViewSet for user management.
    All actions require IsAdminUser (is_staff=True).
    Every mutation is logged to the server terminal for auditability.

    Routes (all under /api/admin/users/):
      GET    /                           → list all users
      POST   /<pk>/toggle_ban/           → flip is_active
      DELETE /<pk>/delete/               → hard-delete the account
      PATCH  /<pk>/update_subscription/  → change plan
    """
    permission_classes = [IsAdminUser]
    serializer_class   = AdminUserSerializer

    def _base_queryset(self):
        """
        Single query that fetches users with subscription (select_related)
        and annotates the completed-resume count so the serializer never
        issues per-row queries.
        """
        User = get_user_model()
        return (
            User.objects
            .select_related('subscriptions')
            .annotate(completed_resume_count=Count(
                'resumes', filter=Q(resumes__status='completed')
            ))
            .order_by('-date_joined')
        )

    def list(self, request):
        serializer = self.get_serializer(self._base_queryset(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'], url_path='toggle_ban')
    def toggle_ban(self, request, pk=None):
        User = get_user_model()
        user = get_object_or_404(User, pk=pk)

        if user.is_superuser:
            return Response(
                {'error': 'Superuser accounts cannot be banned.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user == request.user:
            return Response(
                {'error': 'You cannot ban your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])

        action_word = 'BANNED' if not user.is_active else 'UNBANNED'
        logger.info('[ADMIN] %s %s user %s (id=%d)', request.user.email, action_word, user.email, user.id)

        # Re-fetch with annotation so serializer has resume_count without extra query
        user = self._base_queryset().get(pk=user.pk)
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=['DELETE'], url_path='delete')
    def delete_user(self, request, pk=None):
        User = get_user_model()
        user = get_object_or_404(User, pk=pk)

        if user.is_superuser:
            return Response(
                {'error': 'Superuser accounts cannot be deleted via this endpoint.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        if user == request.user:
            return Response(
                {'error': 'You cannot delete your own account.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email, user_id = user.email, user.id
        user.delete()
        logger.info('[ADMIN] %s DELETED user %s (id=%d)', request.user.email, email, user_id)

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['PATCH'], url_path='update_subscription')
    def update_subscription(self, request, pk=None):
        valid_plans = [c[0] for c in UserSubscription.PLAN_CHOICES]
        plan = request.data.get('plan', '').strip()

        if plan not in valid_plans:
            return Response(
                {'error': f"Invalid plan. Choose from: {', '.join(valid_plans)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        User = get_user_model()
        user = get_object_or_404(User, pk=pk)
        sub, _ = UserSubscription.objects.get_or_create(user=user, defaults={'plan': 'free'})

        old_plan = sub.plan
        sub.plan = plan
        sub.save(update_fields=['plan', 'updated_at'])

        logger.info(
            '[ADMIN] %s changed plan for %s: %s → %s',
            request.user.email, user.email, old_plan, plan,
        )

        user = self._base_queryset().get(pk=user.pk)
        return Response(self.get_serializer(user).data)

