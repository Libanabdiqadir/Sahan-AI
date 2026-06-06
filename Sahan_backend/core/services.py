import json
import google.generativeai as genai
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from .models import ResumeHistory, Document, UserProfile

# ─── Subscription limits (change these numbers to adjust caps) ────────────────
PLAN_LIMITS = {
    'free':  2,    # resumes per calendar month
    'Pro':   50,
    'elite': 9999, # effectively unlimited
}

def check_subscription_limit(user) -> None:
    """
    Count the user's resumes created in the current calendar month and raise
    PermissionDenied with code='limit_reached' if the plan cap is met.
    Raises nothing if the user is within their allowance.
    """
    now = timezone.now()
    count = ResumeHistory.objects.filter(
        user=user,
        created_at__year=now.year,
        created_at__month=now.month,
    ).count()

    subscription = getattr(user, 'subscriptions', None)
    plan = subscription.plan if subscription else 'free'
    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS['free'])

    if count >= limit:
        raise PermissionDenied(detail={
            'error': f"You have used all {limit} resume{'s' if limit != 1 else ''} "
                     f"allowed on the {plan} plan this month.",
            'code':  'limit_reached',
            'plan':  plan,
            'limit': limit,
            'count': count,
        })

genai.configure(api_key=settings.GEMINI_API_KEY)


class ResumeService:
    @staticmethod
    def tailor_resume(user, job_description, job_title='', company_name=''):
        model = genai.GenerativeModel(
            model_name='models/gemini-2.5-flash'
            )
        
        try:
            profile = UserProfile.objects.get(user=user)
            master_data = profile.get_master_data()
            
            prompt = f"""
                You are an elite, professional resume writer. Your goal is to write highly convincing, human-written resumes that completely avoid generic AI phrasing, buzzwords, or structural tells.

                Analyze the provided Master Data and tailor it to match the target Job Description precisely.

                Master Data: {master_data}
                Job Description: {job_description}

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
                generation_config={
                    "response_mime_type": "application/json",
                }
            )
            
            cleaned_text = response.text.strip().removeprefix('```json').removesuffix('```')
            data = json.loads(cleaned_text)

            return ResumeHistory.objects.create(
                user=user,
                job_title=job_title,
                company_name=company_name,
                job_description=job_description,
                tailored_data=data,
                status='completed',
            )

        except ObjectDoesNotExist:
            return ResumeHistory.objects.create(
                user=user,
                job_title=job_title,
                company_name=company_name,
                job_description=job_description,
                status='failed',
                tailored_data={"error": "UserProfile missing. Please update your profile in settings."},
            )
        except Exception as e:
            return ResumeHistory.objects.create(
                user=user,
                job_title=job_title,
                company_name=company_name,
                job_description=job_description,
                status='failed',
                tailored_data={"error": str(e)},
            )

    @staticmethod
    def generate_resume_pdf(resume_history_id, template_name='modern_minimalist'):
        try:
            resume = ResumeHistory.objects.get(id=resume_history_id)
            return Document.objects.create(
                resume_history=resume,
                template_name=template_name
            )
        except ResumeHistory.DoesNotExist:
            return None