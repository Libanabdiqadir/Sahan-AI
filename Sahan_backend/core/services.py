import json
import uuid
from datetime import timedelta

import google.generativeai as genai
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from google.api_core.exceptions import ResourceExhausted
from rest_framework.exceptions import PermissionDenied

from .models import Document, ResumeHistory, UserProfile, UserSubscription

# ─── Plan quotas ──────────────────────────────────────────────────────────────
PLAN_LIMITS = {
    'free':  2,
    'Pro':   50,
    'elite': 9999,
}

BILLING_CYCLE_DAYS = 30

# A PROCESSING record older than this is considered stale (server crash, timeout, etc.)
# and is excluded from the in flight count so it doesn't permanently block the user.
STALE_PROCESSING_MINUTES = 15

genai.configure(api_key=settings.GEMINI_API_KEY)


# ─── Internal quota helpers ───────────────────────────────────────────────────

def _compute_cycle_start(subscription, now):
    """
    Returns the start datetime of the user's current 30-day billing cycle.

    Advances from the stored billing_cycle_start (or created_at for new rows)
    by BILLING_CYCLE_DAYS-day ticks until the window contains `now`.
    Pure computation — does NOT write to the database.
    """
    anchor = subscription.billing_cycle_start or subscription.created_at
    cycle_start = anchor
    while now >= cycle_start + timedelta(days=BILLING_CYCLE_DAYS):
        cycle_start = cycle_start + timedelta(days=BILLING_CYCLE_DAYS)
    return cycle_start


def _count_quota_used(user, now, cycle_start, plan='free'):
    """
    Returns the number of generations that count against the user's quota.

    Free plan  → counts ALL completed/processing records ever (lifetime, no reset).
    Pro/Elite  → counts only records within the current 30-day billing cycle.

    'failed' records are excluded — a failed attempt never consumes quota.
    'processing' records older than STALE_PROCESSING_MINUTES are excluded so a
    crashed worker never permanently blocks the user.
    """
    stale_cutoff = now - timedelta(minutes=STALE_PROCESSING_MINUTES)
    qs = ResumeHistory.objects.filter(user=user)
    if plan != 'free':
        qs = qs.filter(created_at__gte=cycle_start)
    return qs.filter(
        Q(status='completed') |
        Q(status='processing', created_at__gte=stale_cutoff)
    ).count()


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
    if idempotency_key:
        recent_cutoff = timezone.now() - timedelta(minutes=10)
        existing = (
            ResumeHistory.objects
            .filter(user=user, idempotency_key=idempotency_key, created_at__gte=recent_cutoff)
            .first()
        )
        if existing:
            return existing, False


    try:
        subscription = UserSubscription.objects.select_for_update().get(user=user)
    except UserSubscription.DoesNotExist:

        subscription = UserSubscription.objects.create(user=user, plan='free')
        subscription = UserSubscription.objects.select_for_update().get(pk=subscription.pk)

    now = timezone.now()
    plan = subscription.plan if subscription.is_active else 'free'
    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])

    # Compute the current billing cycle window and persist it if it advanced.
    # Runs inside the SELECT FOR UPDATE lock so it's race-safe.
    cycle_start = _compute_cycle_start(subscription, now)
    stored_anchor = subscription.billing_cycle_start or subscription.created_at
    if cycle_start != stored_anchor:
        subscription.billing_cycle_start = cycle_start
        subscription.save(update_fields=['billing_cycle_start', 'updated_at'])

    used = _count_quota_used(user, now, cycle_start, plan=plan)

    if used >= limit:
        period_label = 'ever' if plan == 'free' else 'this billing period'
        raise PermissionDenied(detail={
            'error': (
                f"You have used all {limit} generation{'s' if limit != 1 else ''} "
                f"allowed on the {plan} plan {period_label}."
            ),
            'code':  'limit_reached',
            'plan':  plan,
            'limit': limit,
            'used':  used,
        })

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
        plan = subscription.plan if subscription.is_active else 'free'
        cycle_start = _compute_cycle_start(subscription, timezone.now())
    except UserSubscription.DoesNotExist:
        plan = 'free'
        cycle_start = timezone.now()

    now = timezone.now()
    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])
    used = _count_quota_used(user, now, cycle_start, plan=plan)

    # Free plan quota is lifetime — it never resets, so reset_date is null.
    reset_date = None if plan == 'free' else (
        cycle_start + timedelta(days=BILLING_CYCLE_DAYS)
    ).strftime('%Y-%m-%d')

    return {
        'plan':       plan,
        'limit':      limit,
        'used':       used,
        'remaining':  max(0, limit - used),
        'reset_date': reset_date,
    }


# ─── Resume generation service ────────────────────────────────────────────────

class ResumeService:

    @staticmethod
    def tailor_resume(resume: ResumeHistory, generation_mode: str = 'both') -> ResumeHistory:
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
        PRIMARY_MODEL  = 'models/gemini-2.5-flash'
        FALLBACK_MODEL = 'models/gemini-2.0-flash'

        try:
            profile = UserProfile.objects.get(user=resume.user)
            master_data = profile.get_master_data()

            if generation_mode == 'cv_only':
                cover_letter_instruction = "'cover_letter': An empty string \"\"."
                mode_note = "IMPORTANT: This request is for a CV only. Do NOT write a cover letter. Set 'cover_letter' to an empty string."
            elif generation_mode == 'cover_letter_only':
                cover_letter_instruction = "'cover_letter': A beautifully written, highly compelling, human-sounding cover letter (excluding any formal closures or signatures)."
                mode_note = "IMPORTANT: Generate ONLY the cover letter. Do NOT populate any resume fields. Set 'summary' to an empty string, and set 'tech_skills', 'soft_skills', 'experience', 'projects', 'education', 'certifications', and 'languages' to empty arrays."
            else:
                cover_letter_instruction = "'cover_letter': A beautifully written, highly compelling, human-sounding cover letter (excluding any formal closures or signatures)."
                mode_note = ""

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
                Output MUST be a single valid JSON object. Every key listed below is a TOP-LEVEL key on the root object. Do NOT nest any of these inside another key.

                "summary": A concise, professional summary tailored to the job (max 3 sentences).

                "tech_skills": A list of strings — relevant technical/hard skills matching the job.

                "soft_skills": A list of strings — relevant interpersonal/soft skills.

                "experience": A list of work-history objects. Each object has EXACTLY these sub-keys:
                    "role": Targeted job title.
                    "company": Company name.
                    "duration": Date range.
                    "responsibilities": A list of 3–4 clean, high-impact achievement sentences (no leading dashes or bullet characters).

                "projects": CRITICAL — scan every project in the Master Data 'projects' array. Include ALL projects whose tech stack, domain, or purpose overlaps with the Job Description. Do NOT skip projects simply because experience entries already fill the resume. Each object has EXACTLY these sub-keys:
                    "name": The name of the project.
                    "role_title": Role on the project (e.g., "Lead Creator", "Solo Developer").
                    "description": A single polished, impact-driven action statement explaining what was built and its relevance (no leading dashes or bullet characters).
                    "link": The repository or live URL (omit this key if not present).
                    "dates": Month/Year or duration (omit this key if not present).

                "education": A list of education objects. Each object has EXACTLY these sub-keys:
                    "degree": Degree/course of study.
                    "university": Institution name.
                    "graduation_year": Year of graduation.

                "certifications": A list of certification objects (draw from Master Data certifications). Each object has EXACTLY these sub-keys:
                    "name": Title of the certificate.
                    "issuer": Issuing organization.
                    "issue_date": Date received.
                    "credential_id": Credential ID (omit this key entirely if not present).

                "languages": A top-level list of language strings (e.g. ["English", "Somali"]). This is NOT a sub-key of certifications.

                {cover_letter_instruction}
                {mode_note}
            """

            gen_cfg = {"response_mime_type": "application/json"}
            try:
                response = genai.GenerativeModel(model_name=PRIMARY_MODEL).generate_content(
                    prompt, generation_config=gen_cfg,
                )
            except ResourceExhausted:
                # Primary model's free tier daily quota exhausted; try the fallback
                # model which has a much higher free-tier limit (1 500 RPD vs 20 RPD).
                response = genai.GenerativeModel(model_name=FALLBACK_MODEL).generate_content(
                    prompt, generation_config=gen_cfg,
                )

            cleaned_text = response.text.strip().removeprefix('```json').removesuffix('```')
            data = json.loads(cleaned_text)

            # Enforce generation_mode: override whatever the AI produced
            if generation_mode == 'cv_only':
                data['cover_letter'] = ''
            elif generation_mode == 'cover_letter_only':
                data['summary'] = ''
                data['tech_skills'] = []
                data['soft_skills'] = []
                data['experience'] = []
                data['projects'] = []
                data['education'] = []
                data['certifications'] = []
                data['languages'] = []

            resume.tailored_data = data
            resume.status = 'completed'
            resume.completed_at = timezone.now()
            resume.save(update_fields=['tailored_data', 'status', 'completed_at'])

        except ObjectDoesNotExist:
            resume.status = 'failed'
            resume.error_message = (
                'Profile not found. Please complete your profile before generating a resume.'
            )
            resume.save(update_fields=['status', 'error_message'])

        except ResourceExhausted:
            resume.status = 'failed'
            resume.error_message = (
                'AI generation quota reached. Please try again tomorrow.'
            )
            resume.save(update_fields=['status', 'error_message'])

        except Exception as e:
            resume.status = 'failed'
            resume.error_message = str(e)[:500]
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
