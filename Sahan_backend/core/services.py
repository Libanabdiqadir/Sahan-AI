import json
import uuid
from datetime import timedelta

import google.generativeai as genai
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from .models import Document, ResumeHistory, UserProfile, UserSubscription

# ─── Plan quotas ──────────────────────────────────────────────────────────────
PLAN_LIMITS = {
    'free':  2,
    'Pro':   50,
    'elite': 9999,
}

# A PROCESSING record older than this is considered stale (server crash, timeout, etc.)
# and is excluded from the in-flight count so it doesn't permanently block the user.
STALE_PROCESSING_MINUTES = 15

genai.configure(api_key=settings.GEMINI_API_KEY)


# ─── Internal quota helper ────────────────────────────────────────────────────

def _count_quota_used(user, now):
    """
    Returns the number of resumes that count against this month's quota:
      - All 'completed' resumes created this calendar month
      - 'processing' resumes created this month that are NOT stale
        (stale = started more than STALE_PROCESSING_MINUTES ago, implying a
        crashed server or client disconnect — they will eventually be cleaned up)

    'failed' resumes are intentionally excluded: a failed attempt must never
    consume quota.
    """
    stale_cutoff = now - timedelta(minutes=STALE_PROCESSING_MINUTES)
    return (
        ResumeHistory.objects
        .filter(
            user=user,
            created_at__year=now.year,
            created_at__month=now.month,
        )
        .filter(
            Q(status='completed') |
            Q(status='processing', created_at__gte=stale_cutoff)
        )
        .count()
    )


# ─── Public: atomic slot reservation ─────────────────────────────────────────

@transaction.atomic
def reserve_generation_slot(user, job_title, company_name, job_description, idempotency_key=''):
    """
    Atomically checks quota and reserves a generation slot by creating a
    PROCESSING record.  Uses SELECT FOR UPDATE on UserSubscription to
    serialize concurrent requests from the same user — preventing race
    conditions where two simultaneous clicks both pass the quota check.

    Returns: (ResumeHistory, is_new: bool)
      - is_new=False  →  an idempotent duplicate was detected; return the
                         existing record without running AI again.
      - is_new=True   →  new slot reserved; caller must run AI generation.

    Raises: PermissionDenied with code='limit_reached' if quota is exceeded.

    IMPORTANT: This function does NOT run AI generation.  The caller must
    call ResumeService.tailor_resume(resume) afterwards.  If that call fails,
    the record is marked 'failed', which releases the quota slot.
    """
    # ── Idempotency guard: protect against rapid double-clicks ────────────────
    # If the client sent the same idempotency_key within the last 10 minutes,
    # return the already-in-progress or completed record without creating a
    # duplicate or consuming quota again.
    if idempotency_key:
        recent_cutoff = timezone.now() - timedelta(minutes=10)
        existing = (
            ResumeHistory.objects
            .filter(user=user, idempotency_key=idempotency_key, created_at__gte=recent_cutoff)
            .first()
        )
        if existing:
            return existing, False

    # ── Lock the user's subscription row for the duration of this transaction ─
    # Any other concurrent request for the same user will block here until
    # this transaction commits, ensuring the quota check + slot creation are
    # atomic together.
    try:
        subscription = UserSubscription.objects.select_for_update().get(user=user)
    except UserSubscription.DoesNotExist:
        # Signal should always create this; fall back gracefully.
        subscription = UserSubscription.objects.create(user=user, plan='free')
        subscription = UserSubscription.objects.select_for_update().get(pk=subscription.pk)

    now = timezone.now()
    plan = subscription.plan
    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])
    used = _count_quota_used(user, now)

    if used >= limit:
        raise PermissionDenied(detail={
            'error': (
                f"You have used all {limit} resume{'s' if limit != 1 else ''} "
                f"allowed on the {plan} plan this month."
            ),
            'code':  'limit_reached',
            'plan':  plan,
            'limit': limit,
            'used':  used,
        })

    # ── Reserve the slot: create the PROCESSING record inside the transaction ─
    # This record is now visible to any subsequent concurrent request's quota
    # count (because it will be committed before the lock is released).
    resume = ResumeHistory.objects.create(
        user=user,
        job_title=job_title,
        company_name=company_name,
        job_description=job_description,
        status='processing',
        idempotency_key=idempotency_key or '',
    )
    return resume, True


# ─── Public: subscription status ─────────────────────────────────────────────

def get_subscription_status(user):
    """
    Returns a dict summarising the user's current subscription and quota.
    Safe to call at any time; does not modify any state.
    """
    try:
        subscription = UserSubscription.objects.get(user=user)
        plan = subscription.plan
    except UserSubscription.DoesNotExist:
        plan = 'free'

    now = timezone.now()
    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])
    used = _count_quota_used(user, now)

    return {
        'plan':       plan,
        'limit':      limit,
        'used':       used,
        'remaining':  max(0, limit - used),
        'reset_date': f"{now.year}-{now.month + 1:02d}-01" if now.month < 12 else f"{now.year + 1}-01-01",
    }


# ─── Resume generation service ────────────────────────────────────────────────

class ResumeService:

    @staticmethod
    def tailor_resume(resume: ResumeHistory) -> ResumeHistory:
        """
        Runs AI generation for an already-created PROCESSING resume record.

        Key design rules:
          - Takes an existing ResumeHistory object (created by reserve_generation_slot).
          - Updates that record in-place (status + tailored_data or error_message).
          - NEVER creates new ResumeHistory records.
          - On any failure, sets status='failed' and records the error.
            A 'failed' record does NOT count against quota, so the user can retry.
          - Always returns the resume object (caller checks resume.status).
        """
        model = genai.GenerativeModel(model_name='models/gemini-2.5-flash')

        try:
            profile = UserProfile.objects.get(user=resume.user)
            master_data = profile.get_master_data()

            prompt = f"""
                You are an elite, professional resume writer. Your goal is to write highly convincing, human-written resumes that completely avoid generic AI phrasing, buzzwords, or structural tells.

                Analyze the provided Master Data and tailor it to match the target Job Description precisely.

                Master Data: {master_data}
                Job Description: {resume.job_description}

                === RULES AND CONSTRAINTS ===

                Never Hallucinate: Do not invent, assume, or extrapolate facts, metrics, or technologies not present in the Master Data.

                No Placeholders: Never output placeholders such as [Company Name], [Job Board], [Insert Here], or brackets. If information is missing, omit it naturally.

                Writing Style (Write Like a Human):
                - Write clear, punchy, professional business sentences.
                - Banned words: Do NOT use "spearheaded", "leveraged", "fostered", "ensured", "testament", "showcased", "demonstrated", "passion", "thrilled", "excited", "delighted". Use simple, strong action verbs (e.g., "built", "designed", "optimized", "managed", "increased", "wrote", "led").
                - NO HYPHENS OR BULLET SYMBOLS IN STRINGS: Never start descriptions, responsibilities, or highlights with dashes ("-"), bullet points ("•"), asterisks, or any list symbols. Return them as raw, clean text sentences. The frontend and PDF renderers will handle list formatting.

                Cover Letter Closing Constraint: The cover letter MUST NOT contain closing salutations or signatures like "Sincerely", "Best regards", "Kind regards", or any name/placeholder at the end. Stop writing exactly at the final paragraph.

                === OUTPUT JSON STRUCTURE ===
                Output MUST be a valid, parseable JSON object with these EXACT keys:

                'summary': A concise, professional summary tailored to the job (max 3 sentences).

                'tech_skills': A list of relevant technical/hard skills matching the job.

                'soft_skills': A list of relevant interpersonal/soft skills.

                'experience': A list of objects, each representing work history:
                'role': Targeted job title.
                'company': Company name.
                'duration': Date range.
                'responsibilities': A list of 3-4 clean, high-impact achievement sentences (no leading dashes or bullet characters).

                'projects': A list of objects representing personal or professional projects (draw from the Master Data projects if present):
                'name': The name of the project.
                'role_title': Role on the project (e.g., "Lead Creator", "Solo Developer").
                'description': A single polished, impact-driven action statement explaining what was built and its relevance (no leading dashes or bullet characters).
                'link': The repository or live URL (omit if not present).
                'dates': Month/Year or duration (omit if not present).

                'education': A list of objects:
                'degree': Degree/course of study.
                'university': Institution name.
                'graduation_year': Year of graduation.

                'certifications': A list of objects (draw from the Master Data certifications if present):
                'name': Title of the certificate.
                'issuer': Issuing organization.
                'issue_date': Date received.
                'credential_id': ID if present (omit key entirely if not present).
                'languages': A list of languages spoken.

                'cover_letter': A beautifully written, highly compelling, human-sounding cover letter (excluding any formal closures or signatures).
            """

            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"},
            )

            cleaned_text = response.text.strip().removeprefix('```json').removesuffix('```')
            data = json.loads(cleaned_text)

            resume.tailored_data = data
            resume.status = 'completed'
            resume.completed_at = timezone.now()
            resume.save(update_fields=['tailored_data', 'status', 'completed_at'])

        except ObjectDoesNotExist:
            resume.status = 'failed'
            resume.error_message = (
                'Profile not found. Please complete your profile in Settings before generating a resume.'
            )
            resume.save(update_fields=['status', 'error_message'])

        except Exception as e:
            resume.status = 'failed'
            resume.error_message = str(e)
            resume.save(update_fields=['status', 'error_message'])

        return resume

    @staticmethod
    def generate_resume_pdf(resume_history_id, template_name='modern_minimalist'):
        try:
            resume = ResumeHistory.objects.get(id=resume_history_id, status='completed')
            return Document.objects.create(
                resume_history=resume,
                template_name=template_name,
            )
        except ResumeHistory.DoesNotExist:
            return None
