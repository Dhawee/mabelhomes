import logging

from django.contrib.auth import get_user_model
from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from core.models import (AdminNotification, ContactMessage, PropertyEnquiry,
                         ServiceEnquiry, Property, UserProfile, PropertyImage, PropertyVideo, PropertyLike)
from core.services.notification_service import notify_admin
from core.services.audit_service import log_action

logger = logging.getLogger("core")
User = get_user_model()


# ---------------------------------------------------------------------------
# Enquiry Receivers
# ---------------------------------------------------------------------------

@receiver(post_save, sender=PropertyEnquiry)
def handle_property_enquiry_saved(sender, instance, created, **kwargs):
    """
    Triggers when a new PropertyEnquiry record is created.
    Constructs and dispatches email and dashboard alerts.
    """
    if not created:
        return

    title = f"New Property Enquiry: {instance.property_title}"
    message = (
        f"A new enquiry has been submitted for a property.\n\n"
        f"Property: {instance.property_title}\n"
        f"Name: {instance.name}\n"
        f"Email: {instance.email}\n"
        f"Phone: {instance.phone}\n\n"
        f"Message:\n{instance.message}\n"
    )
    notify_admin(
        title=title,
        message=message,
        notification_type=AdminNotification.NOTIFICATION_PROPERTY_ENQUIRY,
    )


@receiver(post_save, sender=ServiceEnquiry)
def handle_service_enquiry_saved(sender, instance, created, **kwargs):
    """
    Triggers when a new ServiceEnquiry record is created.
    Constructs and dispatches email and dashboard alerts.
    """
    if not created:
        return

    title = f"New Service Enquiry: {instance.service_title}"
    message = (
        f"A new enquiry has been submitted for a service category.\n\n"
        f"Service: {instance.service_title}\n"
        f"Name: {instance.name}\n"
        f"Email: {instance.email}\n"
        f"Phone: {instance.phone}\n\n"
        f"Message:\n{instance.message}\n"
    )
    notify_admin(
        title=title,
        message=message,
        notification_type=AdminNotification.NOTIFICATION_SERVICE_ENQUIRY,
    )


@receiver(post_save, sender=ContactMessage)
def handle_contact_message_saved(sender, instance, created, **kwargs):
    """
    Triggers when a new ContactMessage record is created.
    Constructs and dispatches email and dashboard alerts.
    """
    if not created:
        return

    subject_info = f" — Subject: {instance.subject}" if instance.subject else ""
    title = f"New Contact Message from {instance.name}{subject_info}"
    message = (
        f"A new contact message has been received.\n\n"
        f"Name: {instance.name}\n"
        f"Email: {instance.email}\n"
        f"Phone: {instance.phone}\n"
        f"Subject: {instance.subject or '(none)'}\n\n"
        f"Message:\n{instance.message}\n"
    )
    notify_admin(
        title=title,
        message=message,
        notification_type=AdminNotification.NOTIFICATION_CONTACT,
    )


# ---------------------------------------------------------------------------
# User Profile Receiver
# ---------------------------------------------------------------------------

@receiver(post_save, sender=User)
def handle_user_profile_create(sender, instance, created, **kwargs):
    """Auto-creates UserProfile for new users."""
    if created:
        UserProfile.objects.get_or_create(user=instance)


# ---------------------------------------------------------------------------
# Auth Signals (Audit Logging)
# ---------------------------------------------------------------------------

@receiver(user_logged_in)
def handle_user_logged_in(sender, request, user, **kwargs):
    log_action(user, "login", "User", user.pk, f"User {user.username} logged in successfully.", request)


@receiver(user_logged_out)
def handle_user_logged_out(sender, request, user, **kwargs):
    if user:
        log_action(user, "logout", "User", user.pk, f"User {user.username} logged out.", request)


@receiver(user_login_failed)
def handle_user_login_failed(sender, credentials, request, **kwargs):
    username = credentials.get("username", "Unknown")
    log_action(None, "other", "User", "", f"Failed login attempt for username: {username}", request)


# ---------------------------------------------------------------------------
# Property Signals (Life-cycle Alerts)
# ---------------------------------------------------------------------------

@receiver(pre_save, sender=Property)
def handle_property_pre_save(sender, instance, **kwargs):
    """Caches old property state to detect visibility and status transitions."""
    if instance.id:
        try:
            instance._old_instance = Property.objects.get(id=instance.id)
        except Property.DoesNotExist:
            instance._old_instance = None
    else:
        instance._old_instance = None


@receiver(post_save, sender=Property)
def handle_property_post_save(sender, instance, created, **kwargs):
    """Broadcasts changes in visibility, publication status, or soft deletions."""
    if created:
        title = f"New Property Created: {instance.title}"
        message = (
            f"A new property has been created.\n\n"
            f"Title: {instance.title}\n"
            f"Status: {instance.status}\n"
            f"Visible: {instance.is_visible}"
        )
        notify_admin(title, message, "property")
        return

    old = getattr(instance, "_old_instance", None)
    if not old:
        return

    # 1. Visibility transition
    if old.is_visible != instance.is_visible:
        if instance.is_visible:
            title = f"Property Published: {instance.title}"
            message = f"Property '{instance.title}' has been published and is now visible on the website."
        else:
            title = f"Property Hidden: {instance.title}"
            message = f"Property '{instance.title}' has been hidden from the public website."
        notify_admin(title, message, "property")

    # 2. Soft-delete transition
    if old.is_deleted != instance.is_deleted:
        if instance.is_deleted:
            title = f"Property Soft-Deleted: {instance.title}"
            message = f"Property '{instance.title}' has been soft-deleted."
        else:
            title = f"Property Restored: {instance.title}"
            message = f"Soft-deleted property '{instance.title}' has been restored."
        notify_admin(title, message, "property")


@receiver(post_delete, sender=Property)
def handle_property_post_delete(sender, instance, **kwargs):
    """Broadcasts permanent deletion of property."""
    title = f"Property Permanently Deleted: {instance.title}"
    message = f"Property '{instance.title}' has been permanently deleted from the database."
    notify_admin(title, message, "property")


# ---------------------------------------------------------------------------
# Property Media Receivers (Primary Asset Enforcement)
# ---------------------------------------------------------------------------

@receiver(pre_save, sender=PropertyImage)
def handle_property_image_pre_save(sender, instance, **kwargs):
    """Ensures only one image is marked as primary/cover for a property."""
    if instance.is_primary:
        PropertyImage.objects.filter(property=instance.property).exclude(id=instance.id).update(is_primary=False)


@receiver(pre_save, sender=PropertyVideo)
def handle_property_video_pre_save(sender, instance, **kwargs):
    """Ensures only one video is marked as primary for a property."""
    if instance.is_primary:
        PropertyVideo.objects.filter(property=instance.property).exclude(id=instance.id).update(is_primary=False)


# ---------------------------------------------------------------------------
# Property Likes Sync Signals
# ---------------------------------------------------------------------------

@receiver(post_save, sender=PropertyLike)
def handle_property_like_saved(sender, instance, created, **kwargs):
    """Recalculates property likes_count on new likes to prevent DB drift."""
    if created:
        prop = instance.property
        prop.likes_count = PropertyLike.objects.filter(property=prop).count()
        prop.save(update_fields=["likes_count"])


@receiver(post_delete, sender=PropertyLike)
def handle_property_like_deleted(sender, instance, **kwargs):
    """Recalculates property likes_count when a like is removed to prevent DB drift."""
    prop = instance.property
    prop.likes_count = PropertyLike.objects.filter(property=prop).count()
    prop.save(update_fields=["likes_count"])


# ---------------------------------------------------------------------------
# File Deletion Signals (Supabase Storage Cleanup)
# ---------------------------------------------------------------------------

@receiver(post_delete, sender=PropertyImage)
def handle_property_image_deleted(sender, instance, **kwargs):
    """Deletes uploaded media files from Supabase/local storage when DB record is deleted."""
    if instance.image_upload:
        try:
            instance.image_upload.delete(save=False)
        except Exception as e:
            logger.warning(f"Failed to delete original image file from storage: {e}")
            
    if instance.image_optimized:
        try:
            instance.image_optimized.delete(save=False)
        except Exception as e:
            logger.warning(f"Failed to delete optimized image file from storage: {e}")
            
    if instance.image_thumbnail:
        try:
            instance.image_thumbnail.delete(save=False)
        except Exception as e:
            logger.warning(f"Failed to delete thumbnail image file from storage: {e}")


@receiver(post_delete, sender=PropertyVideo)
def handle_property_video_deleted(sender, instance, **kwargs):
    """Deletes uploaded video file from Supabase/local storage when DB record is deleted."""
    if instance.video_upload:
        try:
            instance.video_upload.delete(save=False)
        except Exception as e:
            logger.warning(f"Failed to delete video file from storage: {e}")

