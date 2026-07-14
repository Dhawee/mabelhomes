import logging
from datetime import timedelta

from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.utils import timezone

from core.models import (ContactMessage, EnquiryReply, Property,
                         PropertyEnquiry, ServiceEnquiry, ServiceType)
from core.services.notification_service import send_reply_email

logger = logging.getLogger("core")


# ---------------------------------------------------------------------------
# Common Validation
# ---------------------------------------------------------------------------

def validate_enquiry_payload(name, email, phone, message, min_message_length=5):
    """Validates common enquiry fields shared across all enquiry types."""
    if not name or len(name.strip()) < 2:
        raise ValidationError("Name must be at least 2 characters long.")

    if not email:
        raise ValidationError("Email address is required.")
    try:
        validate_email(email)
    except ValidationError:
        raise ValidationError("Enter a valid email address.")

    if not phone or len(phone.strip()) < 7:
        raise ValidationError("Enter a valid phone number (minimum 7 characters).")

    if not message or len(message.strip()) < min_message_length:
        raise ValidationError(
            f"Message must be at least {min_message_length} characters long."
        )


# ---------------------------------------------------------------------------
# Property Enquiries
# ---------------------------------------------------------------------------

@transaction.atomic
def create_property_enquiry(property_id, name, email, phone, message):
    """
    Validates and creates a property enquiry atomically.
    Includes duplicate spam prevention checks.
    """
    validate_enquiry_payload(name, email, phone, message)

    try:
        prop = Property.objects.get(id=property_id, is_visible=True, is_deleted=False)
    except Property.DoesNotExist:
        raise ValidationError(
            "The requested property does not exist or is unavailable."
        )

    # Duplicate prevention: Check if same email has sent same message for this property in last 5 minutes
    five_minutes_ago = timezone.now() - timedelta(minutes=5)
    duplicate = PropertyEnquiry.objects.filter(
        property=prop,
        email=email.strip(),
        message=message.strip(),
        created_at__gte=five_minutes_ago,
        is_deleted=False,
    ).exists()

    if duplicate:
        raise ValidationError(
            "You have already submitted this enquiry recently. Please wait a few minutes."
        )

    enquiry = PropertyEnquiry.objects.create(
        property=prop,
        property_title=prop.title,
        name=name.strip(),
        email=email.strip(),
        phone=phone.strip(),
        message=message.strip(),
    )

    logger.info(
        f"PropertyEnquiry #{enquiry.id} created: {name!r} enquiring about {prop.title!r}"
    )
    return enquiry


# ---------------------------------------------------------------------------
# Service Enquiries
# ---------------------------------------------------------------------------

@transaction.atomic
def create_service_enquiry(service_slug_or_id, name, email, phone, message):
    """
    Validates and creates a service category enquiry atomically.
    Includes duplicate spam prevention checks.
    """
    validate_enquiry_payload(name, email, phone, message)

    # Resolve ServiceType (accepts slug or id)
    try:
        if isinstance(service_slug_or_id, int) or str(service_slug_or_id).isdigit():
            service_type = ServiceType.objects.get(
                id=int(service_slug_or_id), is_deleted=False
            )
        else:
            service_type = ServiceType.objects.get(
                slug=service_slug_or_id, is_deleted=False
            )
    except ServiceType.DoesNotExist:
        raise ValidationError("The selected service type is invalid or unavailable.")

    # Duplicate prevention
    five_minutes_ago = timezone.now() - timedelta(minutes=5)
    duplicate = ServiceEnquiry.objects.filter(
        service_type=service_type,
        email=email.strip(),
        message=message.strip(),
        created_at__gte=five_minutes_ago,
        is_deleted=False,
    ).exists()

    if duplicate:
        raise ValidationError(
            "You have already submitted this enquiry recently. Please wait a few minutes."
        )

    enquiry = ServiceEnquiry.objects.create(
        service_type=service_type,
        service_title=service_type.title,
        name=name.strip(),
        email=email.strip(),
        phone=phone.strip(),
        message=message.strip(),
    )

    logger.info(
        f"ServiceEnquiry #{enquiry.id} created: {name!r} for service {service_type.title!r}"
    )
    return enquiry


# ---------------------------------------------------------------------------
# Contact Messages
# ---------------------------------------------------------------------------

@transaction.atomic
def create_contact_message(name, email, phone, message, subject=""):
    """
    Validates and creates a general contact message.
    Includes duplicate spam prevention.
    """
    validate_enquiry_payload(name, email, phone, message)

    five_minutes_ago = timezone.now() - timedelta(minutes=5)
    duplicate = ContactMessage.objects.filter(
        email=email.strip(),
        message=message.strip(),
        created_at__gte=five_minutes_ago,
        is_deleted=False,
    ).exists()

    if duplicate:
        raise ValidationError(
            "You have already submitted this message recently. Please wait a few minutes."
        )

    contact = ContactMessage.objects.create(
        name=name.strip(),
        email=email.strip(),
        phone=phone.strip(),
        subject=subject.strip() if subject else "",
        message=message.strip(),
    )

    logger.info(f"ContactMessage #{contact.id} created from {name!r} <{email}>")
    return contact


# ---------------------------------------------------------------------------
# Enquiry Reply Service
# ---------------------------------------------------------------------------

@transaction.atomic
def send_enquiry_reply(
    enquiry_instance,
    subject: str,
    message: str,
    sender_user=None,
) -> EnquiryReply:
    """
    Sends a reply email to an enquiry submitter and records the reply in the database.

    Works with PropertyEnquiry, ServiceEnquiry, and ContactMessage.

    Args:
        enquiry_instance: Any AbstractEnquiry subclass instance.
        subject: Email subject line.
        message: Reply message body.
        sender_user: The admin User who sent the reply (optional).

    Returns:
        EnquiryReply: The created reply record.

    Raises:
        ValueError: If the enquiry instance type is unrecognized.
    """
    recipient_email = enquiry_instance.email
    sender_name = (
        sender_user.get_full_name() or sender_user.username
        if sender_user
        else "Mabel Homes Team"
    )

    # Send the email
    delivered = send_reply_email(
        recipient_email=recipient_email,
        subject=subject,
        reply_message=message,
        sender_name=sender_name,
    )

    # Get the ContentType for the generic FK
    content_type = ContentType.objects.get_for_model(enquiry_instance)

    # Record the reply
    reply = EnquiryReply.objects.create(
        content_type=content_type,
        object_id=enquiry_instance.pk,
        sender=sender_user,
        recipient_email=recipient_email,
        subject=subject,
        message=message,
        email_delivered=delivered,
    )

    # Mark enquiry as replied
    type(enquiry_instance).objects.filter(pk=enquiry_instance.pk).update(
        replied=True,
        status="Responded",
    )

    if delivered:
        logger.info(
            f"Reply #{reply.id} sent to {recipient_email} for "
            f"{type(enquiry_instance).__name__} #{enquiry_instance.pk}"
        )
    else:
        logger.warning(
            f"Reply #{reply.id} recorded but email delivery FAILED for "
            f"{recipient_email} ({type(enquiry_instance).__name__} #{enquiry_instance.pk})"
        )

    return reply
