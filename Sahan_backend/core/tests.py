from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from .models import ResumeHistory, UserSubscription
from .services import reserve_generation_slot, get_subscription_status
from django.contrib.auth import get_user_model

User = get_user_model()


def _make_pro_user(email="test@example.com", days_ago=0):
    """Create a Pro user whose subscription started `days_ago` days ago."""
    user = User.objects.create_user(email=email, password="testpass123")
    # Signal may not fire in test runner if AppConfig.ready() isn't wired up,
    # so use get_or_create to guarantee the row exists.
    sub, _ = UserSubscription.objects.get_or_create(user=user)
    sub.plan = 'Pro'
    sub.billing_cycle_start = timezone.now() - timedelta(days=days_ago)
    sub.save()
    return user, sub


def _backfill_completions(user, count, created_at):
    """Create `count` completed ResumeHistory records with a fixed created_at."""
    for i in range(count):
        ResumeHistory.objects.create(
            user=user,
            job_title=f"Engineer {i}",
            company_name="Acme",
            job_description="...",
            status="completed",
            idempotency_key=f"key-{i}",
        )
    # Force the created_at timestamp (auto_now_add prevents normal assignment).
    ResumeHistory.objects.filter(user=user).update(created_at=created_at)


class BillingCycleResetTest(TestCase):
    """
    Case A: User has 20 completed generations inside the PREVIOUS 30-day window.
    On Day 31 (a new billing cycle has started) the counter must reset to 0,
    and a new generation request must succeed.
    """

    def test_case_a_counter_resets_on_day_31(self):
        now = timezone.now()
        # Subscription started 31 days ago → the cycle rolled over yesterday.
        user, _ = _make_pro_user(email="case_a@example.com", days_ago=31)

        # 20 completions stamped 31 days ago (previous cycle).
        old_timestamp = now - timedelta(days=31)
        _backfill_completions(user, 20, created_at=old_timestamp)

        # Quota check: the new cycle started 1 day ago, so those 20 old records
        # should be OUTSIDE the current window.
        status = get_subscription_status(user)
        self.assertEqual(
            status['used'], 0,
            "Previous-cycle generations must not count after the 30-day reset."
        )
        self.assertEqual(status['remaining'], 50)

        # A new generation request must succeed (not raise PermissionDenied).
        resume, is_new = reserve_generation_slot(
            user,
            job_title="Software Engineer",
            company_name="Acme",
            job_description="Build things.",
            idempotency_key="case-a-new",
        )
        self.assertTrue(is_new)
        self.assertEqual(resume.status, "processing")


class BillingCycleLimitTest(TestCase):
    """
    Case B: User hits 50 generations on Day 15 of their current cycle.
    Any further request must be blocked until the 30-day window passes.
    """

    def test_case_b_blocked_at_50_within_cycle(self):
        now = timezone.now()
        # Subscription started 15 days ago — still inside the first cycle.
        user, _ = _make_pro_user(email="case_b@example.com", days_ago=15)

        # 50 completions stamped 14 days ago (within the current cycle).
        recent_timestamp = now - timedelta(days=14)
        _backfill_completions(user, 50, created_at=recent_timestamp)

        # Confirm quota is fully consumed.
        status = get_subscription_status(user)
        self.assertEqual(status['used'], 50)
        self.assertEqual(status['remaining'], 0)

        # A new generation request must raise PermissionDenied with code='limit_reached'.
        with self.assertRaises(PermissionDenied) as ctx:
            reserve_generation_slot(
                user,
                job_title="Product Manager",
                company_name="Stripe",
                job_description="Lead product.",
                idempotency_key="case-b-blocked",
            )

        detail = ctx.exception.detail
        # DRF wraps PermissionDenied detail values as ErrorDetail strings.
        self.assertEqual(str(detail['code']), 'limit_reached')
        self.assertEqual(int(detail['limit']), 50)
        self.assertEqual(int(detail['used']), 50)
        self.assertEqual(str(detail['plan']), 'Pro')
