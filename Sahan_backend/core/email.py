import logging
from djoser.email import (
    ActivationEmail as _DjoserActivationEmail,
    PasswordResetEmail as _DjoserPasswordResetEmail,
)
from .utils import send_verification_email, send_password_reset_email

logger = logging.getLogger(__name__)


class ActivationEmail(_DjoserActivationEmail):
    """
    Sends the account-activation email via Resend instead of Django's
    email backend.

    Overrides send() so Django's email machinery (console / SMTP) is
    bypassed entirely.  get_context_data() is inherited from Djoser and
    builds the uid, token, and activation URL automatically from the
    ACTIVATION_URL / EMAIL_FRONTEND_DOMAIN / EMAIL_FRONTEND_PROTOCOL
    settings already configured in settings.py.

    Failure policy: if Resend is unavailable, we log a CRITICAL alert but
    do NOT raise — raising here would cause djoser's registration view to
    return a 500 to the user even though their account was already created.
    The user can request a new activation link via /auth/users/resend_activation/.
    """

    def send(self, to, fail_silently=False, **kwargs):
        context  = self.get_context_data()
        protocol = context.get('protocol', 'http')
        domain   = context.get('domain', '')
        rel_url  = context.get('url', '')
        full_url = f"{protocol}://{domain}/{rel_url}"

        sent = send_verification_email(to[0], full_url)
        if not sent:
            logger.critical(
                "Activation email delivery FAILED for %s. "
                "Check RESEND_API_KEY and the Resend dashboard. "
                "User can resend via /auth/users/resend_activation/.",
                to[0],
            )


class PasswordResetEmail(_DjoserPasswordResetEmail):
    """
    Sends the password-reset email via Resend instead of Django's email backend.

    Same failure policy as ActivationEmail — logs CRITICAL but does not raise,
    so the reset request returns a clean 204 to the user regardless of delivery
    status (Djoser intentionally doesn't reveal whether the email was sent to
    prevent user-enumeration attacks).
    """

    def send(self, to, fail_silently=False, **kwargs):
        context  = self.get_context_data()
        protocol = context.get('protocol', 'http')
        domain   = context.get('domain', '')
        rel_url  = context.get('url', '')
        full_url = f"{protocol}://{domain}/{rel_url}"

        sent = send_password_reset_email(to[0], full_url)
        if not sent:
            logger.critical(
                "Password-reset email delivery FAILED for %s. "
                "Check RESEND_API_KEY and the Resend dashboard.",
                to[0],
            )
