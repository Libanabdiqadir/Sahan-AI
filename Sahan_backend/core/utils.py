import logging
from django.conf import settings

logger = logging.getLogger(__name__)


def _send_resend_email(to_email: str, subject: str, html: str) -> bool:
    """
    Low-level helper: sends one transactional email via Resend.
    Returns True on success, False on any failure (error is logged).
    """
    import resend
    resend.api_key = settings.RESEND_API_KEY
    try:
        resend.Emails.send({
            "from":    settings.RESEND_FROM_EMAIL,
            "to":      [to_email],
            "subject": subject,
            "html":    html,
        })
        logger.info("Email '%s' sent to %s", subject, to_email)
        return True
    except Exception:
        logger.exception("Resend failed to send '%s' to %s", subject, to_email)
        return False


def send_verification_email(to_email: str, verification_link: str) -> bool:
    html = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 560px; margin: 40px auto; color: #1a1a2e;">
    <h2 style="margin-bottom: 8px;">Welcome to Sahan AI</h2>
    <p style="color: #4b5563; margin-bottom: 24px;">
        Click the button below to verify your email address and activate your account.
        This link expires in 24 hours.
    </p>
    <a href="{verification_link}"
       style="display: inline-block; background: #1a1a2e; color: #ffffff;
              text-decoration: none; padding: 12px 28px; border-radius: 6px;
              font-weight: bold; font-size: 15px;">
        Verify Email
    </a>
    <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="{verification_link}" style="color: #4b5563;">{verification_link}</a>
    </p>
    <p style="font-size: 12px; color: #9ca3af;">
        If you didn't create a Sahan AI account, you can safely ignore this email.
    </p>
</body>
</html>"""
    return _send_resend_email(to_email, "Verify your Sahan AI account", html)


def send_password_reset_email(to_email: str, reset_link: str) -> bool:
    html = f"""<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; max-width: 560px; margin: 40px auto; color: #1a1a2e;">
    <h2 style="margin-bottom: 8px;">Reset your password</h2>
    <p style="color: #4b5563; margin-bottom: 24px;">
        We received a request to reset your Sahan AI password.
        Click the button below to choose a new one. This link expires in 1 hour.
    </p>
    <a href="{reset_link}"
       style="display: inline-block; background: #1a1a2e; color: #ffffff;
              text-decoration: none; padding: 12px 28px; border-radius: 6px;
              font-weight: bold; font-size: 15px;">
        Reset Password
    </a>
    <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="{reset_link}" style="color: #4b5563;">{reset_link}</a>
    </p>
    <p style="font-size: 12px; color: #9ca3af;">
        If you didn't request a password reset, you can safely ignore this email.
    </p>
</body>
</html>"""
    return _send_resend_email(to_email, "Reset your Sahan AI password", html)
