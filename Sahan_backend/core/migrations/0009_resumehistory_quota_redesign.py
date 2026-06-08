"""
Migration: quota redesign

Changes to ResumeHistory:
  - Add error_message  (audit trail of why a generation failed)
  - Add idempotency_key (client-supplied UUID to de-duplicate rapid clicks)
  - Add completed_at   (timestamp of successful completion)
  - Rename status choice 'pending' → 'processing' (data migration)
  - Add composite index (user, status, created_at) for fast quota queries
  - Add composite index (user, idempotency_key) for fast de-dup look-ups

Changes to UserSubscription:
  - Remove resume_this_month  (was never correctly maintained; quota is now
                               derived directly from the resumes table)
  - Remove last_reset_date    (not needed; month boundary is computed at query time)
  - Add created_at / updated_at
  - Change is_active default: False → True  (free plan is always active)
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_userprofile_certifications'),
    ]

    operations = [
        # ── ResumeHistory: new audit / idempotency fields ─────────────────────
        migrations.AddField(
            model_name='resumehistory',
            name='error_message',
            field=models.TextField(blank=True, default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='resumehistory',
            name='idempotency_key',
            field=models.CharField(blank=True, db_index=True, default='', max_length=64),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='resumehistory',
            name='completed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),

        # ── ResumeHistory: rename STATUS_CHOICES 'pending' → 'processing' ─────
        # Django stores choices as plain varchar; renaming the choice label
        # requires a data migration to update existing rows.
        migrations.AlterField(
            model_name='resumehistory',
            name='status',
            field=models.CharField(
                choices=[
                    ('processing', 'Processing'),
                    ('completed', 'Completed'),
                    ('failed', 'Failed'),
                ],
                default='processing',
                max_length=20,
            ),
        ),
        migrations.RunSQL(
            sql="UPDATE core_resumehistory SET status = 'processing' WHERE status = 'pending';",
            reverse_sql="UPDATE core_resumehistory SET status = 'pending' WHERE status = 'processing';",
        ),

        # ── ResumeHistory: composite indexes for quota and idempotency queries ─
        migrations.AddIndex(
            model_name='resumehistory',
            index=models.Index(
                fields=['user', 'status', 'created_at'],
                name='resume_user_status_date_idx',
            ),
        ),
        migrations.AddIndex(
            model_name='resumehistory',
            index=models.Index(
                fields=['user', 'idempotency_key'],
                name='resume_user_idem_idx',
            ),
        ),

        # ── UserSubscription: remove stale counter fields ─────────────────────
        migrations.RemoveField(
            model_name='usersubscription',
            name='resume_this_month',
        ),
        migrations.RemoveField(
            model_name='usersubscription',
            name='last_reset_date',
        ),

        # ── UserSubscription: add timestamps + fix is_active default ──────────
        migrations.AddField(
            model_name='usersubscription',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='usersubscription',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        migrations.AlterField(
            model_name='usersubscription',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]
