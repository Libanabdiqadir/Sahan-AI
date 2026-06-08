from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from .models import Document, ResumeHistory, SiteVisit, User, UserProfile, UserSubscription


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _plan_badge(plan):
    colours = {'free': '#64748b', 'Pro': '#2563eb', 'elite': '#7c3aed'}
    colour = colours.get(plan, '#64748b')
    return format_html(
        '<span style="background:{};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">{}</span>',
        colour, plan.upper(),
    )


# ─── User Admin ───────────────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    # What you see in the list view
    list_display  = ('email', 'full_name', 'subscription_plan', 'is_active', 'is_staff', 'date_joined')
    list_filter   = ('is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name')
    ordering      = ('-date_joined',)

    # Override the default username-based fieldsets for our email-only model
    fieldsets = (
        (None,           {'fields': ('email', 'password')}),
        (_('Personal'),  {'fields': ('first_name', 'last_name', 'profile_picture')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Dates'),     {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

    # ── Custom list columns ───────────────────────────────────────────────────
    @admin.display(description='Name')
    def full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip() or '—'

    @admin.display(description='Plan')
    def subscription_plan(self, obj):
        try:
            return _plan_badge(obj.subscriptions.plan)
        except UserSubscription.DoesNotExist:
            return '—'

    # ── Custom actions ────────────────────────────────────────────────────────
    actions = ['ban_users', 'unban_users', 'delete_accounts']

    @admin.action(description='Ban selected users (deactivate account)')
    def ban_users(self, request, queryset):
        # Never accidentally ban yourself or other superusers
        safe_qs = queryset.exclude(is_superuser=True)
        count = safe_qs.update(is_active=False)
        self.message_user(request, f'{count} user(s) banned.')

    @admin.action(description='Unban selected users (re-activate account)')
    def unban_users(self, request, queryset):
        count = queryset.update(is_active=True)
        self.message_user(request, f'{count} user(s) re-activated.')

    @admin.action(description='Delete selected accounts (permanent)')
    def delete_accounts(self, request, queryset):
        safe_qs = queryset.exclude(is_superuser=True)
        count, _ = safe_qs.delete()
        self.message_user(request, f'{count} account(s) permanently deleted.')


# ─── Subscription Admin ───────────────────────────────────────────────────────

@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    """
    The primary tool for manual ZAAD/eDahab subscription management.
    Search by name or email → find the row → edit plan inline.
    """
    list_display  = ('user_email', 'user_name', 'plan_badge', 'plan', 'is_active', 'created_at')
    list_editable = ('plan', 'is_active')          # edit plan + status right in the list
    list_filter   = ('plan', 'is_active')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    ordering      = ('-created_at',)
    autocomplete_fields = ('user',)                # fast user look-up on the detail form

    @admin.display(description='Email', ordering='user__email')
    def user_email(self, obj):
        return obj.user.email

    @admin.display(description='Name')
    def user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or '—'

    @admin.display(description='Plan')
    def plan_badge(self, obj):
        return _plan_badge(obj.plan)


# ─── UserProfile Admin ────────────────────────────────────────────────────────

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ('user_email', 'full_name', 'location', 'updated_at')
    search_fields = ('user__email', 'full_name')
    ordering      = ('-updated_at',)

    @admin.display(description='Email', ordering='user__email')
    def user_email(self, obj):
        return obj.user.email


# ─── Resume History Admin ─────────────────────────────────────────────────────

@admin.register(ResumeHistory)
class ResumeHistoryAdmin(admin.ModelAdmin):
    list_display  = ('user_email', 'job_title', 'company_name', 'status_badge', 'created_at')
    list_filter   = ('status', 'created_at')
    search_fields = ('user__email', 'company_name', 'job_title')
    ordering      = ('-created_at',)
    readonly_fields = ('error_message', 'completed_at', 'idempotency_key')

    @admin.display(description='User', ordering='user__email')
    def user_email(self, obj):
        return obj.user.email

    @admin.display(description='Status')
    def status_badge(self, obj):
        colours = {'processing': '#d97706', 'completed': '#16a34a', 'failed': '#dc2626'}
        colour = colours.get(obj.status, '#64748b')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">{}</span>',
            colour, obj.status.upper(),
        )


# ─── Document Admin ───────────────────────────────────────────────────────────

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display  = ('resume_user', 'resume_job', 'template_name')
    search_fields = ('resume_history__user__email', 'resume_history__job_title')

    @admin.display(description='User')
    def resume_user(self, obj):
        return obj.resume_history.user.email

    @admin.display(description='Job')
    def resume_job(self, obj):
        return obj.resume_history.job_title


# ─── SiteVisit Admin ─────────────────────────────────────────────────────────

@admin.register(SiteVisit)
class SiteVisitAdmin(admin.ModelAdmin):
    list_display  = ('user_email', 'date')
    list_filter   = ('date',)
    search_fields = ('user__email',)
    ordering      = ('-date',)
    date_hierarchy = 'date'

    @admin.display(description='User', ordering='user__email')
    def user_email(self, obj):
        return obj.user.email
