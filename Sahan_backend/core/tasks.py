from __future__ import annotations
import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    name='core.tasks.generate_resume',
    max_retries=2,
    default_retry_delay=10,
    acks_late=True,           
    # Limit Gemini API calls to 30 per minute across all workers.
    # This prevents ResourceExhausted errors under burst traffic and protects
    # against queue runaway when many users submit simultaneously.
    # Raise this value once you upgrade to a paid Gemini API tier with higher RPM.
    rate_limit='30/m',
)
def generate_resume(self, resume_id: int, generation_mode: str = 'both') -> None:
    """
    Background task: runs Gemini AI generation for a PROCESSING ResumeHistory
    record that was created synchronously by reserve_generation_slot().

    Retries up to 2 times on unexpected errors before marking the record failed.
    Designed to be idempotent: if status is no longer 'processing' the task exits
    immediately without side-effects.
    """
    from .models import ResumeHistory
    from .services import ResumeService

    try:
        resume = ResumeHistory.objects.get(pk=resume_id)
    except ResumeHistory.DoesNotExist:
        logger.warning('generate_resume: record %s not found, skipping', resume_id)
        return

    if resume.status != 'processing':
        logger.info(
            'generate_resume: record %s already status=%s, skipping',
            resume_id, resume.status,
        )
        return

    try:
        ResumeService.tailor_resume(resume, generation_mode=generation_mode)
        logger.info(
            'generate_resume: record %s finished with status=%s',
            resume_id, resume.status,
        )
    except Exception as exc:
        logger.exception('generate_resume: unexpected error on record %s', resume_id)
        try:
            raise self.retry(exc=exc)
        except self.MaxRetriesExceededError:
            resume.refresh_from_db()
            if resume.status == 'processing':
                resume.status = 'failed'
                resume.error_message = f'Worker error after retries: {exc!s}'[:500]
                resume.save(update_fields=['status', 'error_message'])
