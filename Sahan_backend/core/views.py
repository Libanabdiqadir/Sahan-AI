import logging
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from django.db.models import Count, Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action, api_view, parser_classes, permission_classes, throttle_classes
from rest_framework.exceptions import PermissionDenied as DRFPermissionDenied
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken
import requests as google_requests
from rest_framework.response import Response


class AuthRateThrottle(AnonRateThrottle):
    """
    Tight per-IP throttle applied to login, register, and Google OAuth endpoints.
    Rate is configured via DEFAULT_THROTTLE_RATES['auth'] in settings.py.
    """
    scope = 'auth'

from .models import Document, ResumeHistory, SiteVisit, UserProfile, UserSubscription
from .services import get_subscription_status, reserve_generation_slot
from .tasks import generate_resume
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

class UserProfileViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
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

class UserViewSet(
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    """Exposes only GET /users/{pk}/ and PATCH /users/{pk}/. No list, no delete."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)


class ResumeHistoryViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """List, retrieve, and delete resumes. Creation is only via the tailor action."""
    serializer_class = ResumeHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            ResumeHistory.objects
            .filter(user=self.request.user)
            .select_related('user')
            .prefetch_related('documents')
            .order_by('-created_at')
        )

    @action(detail=False, methods=['POST'])
    def tailor(self, request):
        # ── Step 1: validate input BEFORE touching quota ──────────────────────
        job_description = request.data.get('job_description', '').strip()
        job_title       = request.data.get('job_title', '').strip()
        company_name    = request.data.get('company_name', '').strip()
        # Client should send a UUID per button-click to de-duplicate rapid submissions
        idempotency_key  = request.data.get('idempotency_key', '').strip()[:64]
        generation_mode  = request.data.get('generation_mode', 'both')
        if generation_mode not in ('cv_only', 'cover_letter_only', 'both'):
            generation_mode = 'both'

        if not job_description:
            return Response(
                {'error': 'Job description is required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Step 2: atomically reserve a quota slot ───────────────────────────
        # SELECT FOR UPDATE on UserSubscription serialises concurrent requests.
        # Raises PermissionDenied (403) with code='limit_reached' if over quota.
        # Returns is_new=False if idempotency_key matches a recent in-flight request.
        try:
            resume, is_new = reserve_generation_slot(
                request.user, job_title, company_name, job_description, idempotency_key,
            )
        except DRFPermissionDenied as exc:
            # Re-emit as a clean Response so integer fields (limit, used) are
            # never coerced to strings by DRF's ErrorDetail machinery.
            detail = exc.detail if isinstance(exc.detail, dict) else {}
            return Response(
                {
                    'error': str(detail.get('error', 'Monthly generation limit reached.')),
                    'code':  'limit_reached',
                    'plan':  str(detail.get('plan', 'free')),
                    'limit': int(detail.get('limit', 2)),
                    'used':  int(detail.get('used',  0)),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not is_new:
            # Duplicate request — return the existing record without re-running AI
            return Response(self.get_serializer(resume).data)

        # ── Step 3: dispatch AI generation ────────────────────────────────────
        # Async path (production): Celery worker picks up the task; Django returns
        # 202 immediately so the thread is never blocked by the 5-30 s Gemini call.
        # Frontend polls GET /resumes/{id}/ until status leaves 'processing'.
        #
        # Sync path (dev / Redis-down): CELERY_TASK_ALWAYS_EAGER=True makes
        # .delay() run the task inline.  If Redis is unreachable in production we
        # catch the connection error and run the task synchronously as a fallback.
        try:
            generate_resume.delay(resume.id, generation_mode=generation_mode)
        except Exception:
            logger.warning(
                'Celery/Redis unavailable — running generate_resume synchronously '
                'for resume %s', resume.id,
            )
            from .services import ResumeService
            try:
                ResumeService.tailor_resume(resume, generation_mode=generation_mode)
            except Exception as exc:
                resume.refresh_from_db()
                if resume.status == 'processing':
                    resume.status = 'failed'
                    resume.error_message = f'Generation failed: {exc!s}'[:500]
                    resume.save(update_fields=['status', 'error_message'])
            resume.refresh_from_db()
            return Response(self.get_serializer(resume).data)

        # When CELERY_TASK_ALWAYS_EAGER=True (dev), the task already ran
        # synchronously inside .delay() above — refresh so the serializer
        # reflects the actual final status, then still return 202 so the
        # frontend exercises its normal polling path (resolves on first poll).
        resume.refresh_from_db()
        return Response(
            self.get_serializer(resume).data,
            status=status.HTTP_202_ACCEPTED,
        )

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Document.objects.filter(resume_history__user=self.request.user)

    def perform_create(self, serializer):
        resume_history = serializer.validated_data.get('resume_history')
        if resume_history and resume_history.user_id != self.request.user.pk:
            raise DRFPermissionDenied('You may only attach documents to your own resumes.')
        serializer.save()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def subscription_status(request):
    """
    Returns the authenticated user's current plan, monthly quota, and usage.
    Frontend uses this to show the remaining-generations counter and gate the
    Generate button before the user even clicks it.
    """
    return Response(get_subscription_status(request.user))


_ALLOWED_IMAGE_TYPES = frozenset({'image/jpeg', 'image/png', 'image/webp', 'image/gif'})
_MAX_PICTURE_BYTES   = 5 * 1024 * 1024   # 5 MB


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_profile_picture(request):
    user = request.user
    if 'profile_picture' not in request.FILES:
        return Response({'error': 'No file provided'}, status=400)

    file = request.FILES['profile_picture']

    # ── File-size guard ────────────────────────────────────────────────────────
    if file.size > _MAX_PICTURE_BYTES:
        return Response(
            {'error': 'Profile picture must be smaller than 5 MB.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ── MIME-type guard (header claim) ────────────────────────────────────────
    if file.content_type not in _ALLOWED_IMAGE_TYPES:
        return Response(
            {'error': 'Only JPEG, PNG, WebP, and GIF images are accepted.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # ── Magic-byte guard (Pillow verification) ────────────────────────────────
    # Confirms the bytes on disk match a real image regardless of the
    # Content-Type header the client claims.
    try:
        from PIL import Image
        img = Image.open(file)
        img.verify()          # raises on corrupt / spoofed files
        file.seek(0)          # reset cursor after verify() consumes the stream
    except Exception:
        return Response(
            {'error': 'Invalid or corrupt image file.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.profile_picture = file
    user.save()

    pic_url = request.build_absolute_uri(user.profile_picture.url)

    try:
        profile = user.profile
        master = profile.master_data or {}
        master['profile_picture_url'] = pic_url
        profile.master_data = master
        profile.save()
    except Exception:
        pass

    return Response({'profile_picture': pic_url})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_cv_pdf(request):
    # P3: fetch the authoritative profile from the DB so an attacker cannot
    # inject another user's personal details by crafting the request body.
    try:
        user_profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found. Please complete your profile first.'}, status=404)

    profile = {
        'full_name':     user_profile.full_name,
        'contact_email': user_profile.contact_email or '',
        'phone_number':  user_profile.phone_number or '',
        'location':      user_profile.location or '',
        'linkedin_url':  user_profile.linkedin_url or '',
    }

    tailored      = request.data.get('tailored', {})
    template_name = request.data.get('template', 'harvard_classic')

    response = HttpResponse(content_type='application/pdf')
    filename = f"{profile['full_name'].replace(' ', '_') or 'CV'}_{template_name}.pdf"
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response['Access-Control-Expose-Headers'] = 'Content-Disposition'

    template_module = TEMPLATE_REGISTRY.get(template_name, harvard_classic)
    template_module.render_pdf(response, profile, tailored)

    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_cover_letter_pdf(request):
    # P3: same DB-sourced profile validation as generate_cv_pdf.
    try:
        user_profile = UserProfile.objects.get(user=request.user)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Profile not found. Please complete your profile first.'}, status=404)

    profile = {
        'full_name':     user_profile.full_name,
        'contact_email': user_profile.contact_email or '',
        'phone_number':  user_profile.phone_number or '',
        'location':      user_profile.location or '',
        'linkedin_url':  user_profile.linkedin_url or '',
    }

    tailored     = request.data.get('tailored', {})
    job_title    = request.data.get('job_title', '')
    company_name = request.data.get('company_name', '')

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
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
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
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def google_register(request):
    """
    Step 2 — only called for brand-new Google users.
    Re-verifies the Google token (proves they own the email), then creates
    the account with the name and password they chose.

    Uses get_or_create instead of exists()+create() to eliminate the TOCTOU
    race condition where two concurrent requests for the same email could both
    pass the exists() check and then race to create the user, causing one to
    receive a 500 IntegrityError.
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

    try:
        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
    except IntegrityError:
        # Concurrent request already created this account (or it pre-existed).
        return Response(
            {"error": "An account with this email already exists. Please sign in."},
            status=status.HTTP_409_CONFLICT,
        )

    return Response(_issue_jwt(user), status=status.HTTP_201_CREATED)


# ─── Stripe Webhook ───────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def stripe_webhook(request):
    """
    Receives and verifies Stripe webhook events.

    Handled events:
      customer.subscription.deleted → set is_active=False, plan='free'
      invoice.payment_failed        → set is_active=False (plan stays until
                                      Stripe retries and eventually deletes)

    Security: Stripe's signature header is verified before any DB write.
    Returning 200 quickly is important — Stripe retries on any non-2xx.
    """
    import stripe
    from django.conf import settings as django_settings

    payload    = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, django_settings.STRIPE_WEBHOOK_SECRET,
        )
    except ValueError:
        # Invalid JSON payload
        return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError:
        # Forged or replayed request
        return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

    event_type = event['type']
    obj        = event['data']['object']
    customer_id = obj.get('customer')

    if event_type in ('customer.subscription.deleted', 'invoice.payment_failed'):
        if not customer_id:
            logger.warning('[STRIPE] %s received with no customer id — skipping', event_type)
            return Response({'status': 'skipped'})

        try:
            sub = UserSubscription.objects.get(stripe_customer_id=customer_id)
        except UserSubscription.DoesNotExist:
            logger.warning('[STRIPE] No UserSubscription for customer %s', customer_id)
            return Response({'status': 'unknown_customer'})

        if event_type == 'customer.subscription.deleted':
            sub.is_active = False
            sub.plan = 'free'
            sub.save(update_fields=['is_active', 'plan', 'updated_at'])
            logger.info('[STRIPE] subscription.deleted — customer %s downgraded to free', customer_id)

        elif event_type == 'invoice.payment_failed':
            sub.is_active = False
            sub.save(update_fields=['is_active', 'updated_at'])
            logger.info('[STRIPE] invoice.payment_failed — customer %s marked inactive', customer_id)

    return Response({'status': 'ok'})


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
        # Non-superuser staff cannot act on other staff members.
        if user.is_staff and not request.user.is_superuser:
            return Response(
                {'error': 'Only superusers can ban other staff accounts.'},
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
        # Non-superuser staff cannot delete other staff members.
        if user.is_staff and not request.user.is_superuser:
            return Response(
                {'error': 'Only superusers can delete other staff accounts.'},
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

