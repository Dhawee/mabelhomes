import logging
import resend
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger("core")


def get_admin_recipients() -> list[str]:
    """
    Resolves all admin email recipients.
    Reads settings.ADMIN_EMAIL and settings.ADMIN_EMAILS (supports comma-separated list),
    plus any active staff users in the database.
    Returns a deduplicated, sorted list of valid email addresses.
    """
    recipients = set()

    configured_admin = getattr(settings, "ADMIN_EMAIL", "olajumoke@mabelhomes.org")
    configured_list = getattr(settings, "ADMIN_EMAILS", "")

    for raw in [configured_admin, configured_list]:
        if raw:
            for em in str(raw).split(","):
                em_clean = em.strip()
                if em_clean and "@" in em_clean:
                    recipients.add(em_clean)

    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        staff_emails = (
            User.objects.filter(is_active=True, is_staff=True)
            .exclude(email="")
            .values_list("email", flat=True)
        )
        for e in staff_emails:
            if e and e.strip() and "@" in e.strip():
                recipients.add(e.strip())
    except Exception as exc:
        logger.warning(f"Could not query staff users for admin emails: {exc}")

    return sorted(list(recipients))


def send_resend_email(to: list[str] | str, subject: str, html_body: str, text_body: str = "") -> bool:
    """
    Sends an email using the official Resend Python SDK.
    Logs every attempt, recipient, response, and exception clearly for Render logs.
    """
    api_key = getattr(settings, "RESEND_API_KEY", "")
    raw_from = getattr(settings, "FROM_EMAIL", "olajumoke@mabelhomes.org")
    from_email = raw_from if "<" in raw_from else f"Mabel Homes <{raw_from}>"

    recipients = [to] if isinstance(to, str) else list(to)
    recipients = [r.strip() for r in recipients if r and str(r).strip()]

    if not recipients:
        logger.warning("[RESEND EMAIL SKIPPED] No valid recipient addresses provided.")
        return False

    logger.info(f"[RESEND EMAIL ATTEMPT] To: {recipients} | From: {from_email} | Subject: {subject!r}")

    if not api_key:
        logger.warning(
            f"[RESEND SIMULATION MODE] RESEND_API_KEY environment variable is not configured. "
            f"Simulated email delivery to {recipients} for subject {subject!r} successfully logged."
        )
        return True

    try:
        resend.api_key = api_key
        params = {
            "from": from_email,
            "to": recipients,
            "subject": subject,
            "html": html_body,
        }
        if text_body:
            params["text"] = text_body

        response = resend.Emails.send(params)
        logger.info(f"[RESEND EMAIL SUCCESS] Delivered to {recipients} | Subject: {subject!r} | Resend Response: {response}")
        return True
    except Exception as exc:
        logger.error(
            f"[RESEND EMAIL FAILURE] Failed to deliver email to {recipients} | Subject: {subject!r} | Exception: {exc}",
            exc_info=True,
        )
        return False


# ============================================================================
# Admin Notification Email Functions
# ============================================================================

def send_admin_event_notification(
    title: str,
    message: str,
    notification_type: str = "system",
    metadata: dict | None = None,
) -> bool:
    """
    Sends a formatted Admin Notification Email via Resend whenever an event occurs.
    Includes client details, submission date/time, and a direct link to the Admin Dashboard.
    """
    recipients = get_admin_recipients()
    if not recipients:
        logger.warning("[ADMIN EMAIL SKIPPED] No admin recipients resolved.")
        return False

    now_str = timezone.now().strftime("%B %d, %Y at %I:%M %p UTC")
    admin_base_url = getattr(settings, "ADMIN_DASHBOARD_URL", "https://admin.mabelhomes.org")

    if "shortlet" in notification_type.lower() or "shortlet" in title.lower():
        action_url = f"{admin_base_url}/admin/dashboard/shortlet-enquiries"
        action_label = "View Shortlet Enquiries"
    elif "property" in notification_type.lower() or "property" in title.lower():
        action_url = f"{admin_base_url}/admin/dashboard/property-enquiries"
        action_label = "View Property Enquiries"
    elif "service" in notification_type.lower() or "service" in title.lower():
        action_url = f"{admin_base_url}/admin/dashboard/service-enquiries"
        action_label = "View Service Enquiries"
    elif "contact" in notification_type.lower() or "contact" in title.lower():
        action_url = f"{admin_base_url}/admin/dashboard/contact-messages"
        action_label = "View Contact Messages"
    else:
        action_url = f"{admin_base_url}/admin/dashboard"
        action_label = "Open Admin Dashboard"

    meta = metadata or {}
    client_name = meta.get("name") or "N/A"
    client_email = meta.get("email") or "N/A"
    client_phone = meta.get("phone") or "N/A"
    details_title = meta.get("details") or meta.get("title") or "N/A"

    subject = f"[Mabel Homes Admin] {title}"

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }}
    .container {{ max-width: 620px; margin: 25px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0; }}
    .header {{ background: linear-gradient(135deg, #0f2044 0%, #1a3a6b 100%); padding: 25px 35px; }}
    .header h2 {{ color: #c9a84c; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px; }}
    .header p {{ color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 12px; }}
    .body {{ padding: 30px 35px; }}
    .meta-table {{ width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13.5px; }}
    .meta-table td {{ padding: 8px 12px; border-bottom: 1px solid #f0f0f0; }}
    .meta-table td.label {{ font-weight: 600; color: #0f2044; width: 140px; background: #fafafa; }}
    .message-box {{ background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 16px 20px; margin: 20px 0; font-size: 14px; line-height: 1.6; color: #333; white-space: pre-wrap; border-radius: 0 8px 8px 0; }}
    .btn-container {{ text-align: center; margin: 30px 0 10px; }}
    .btn {{ display: inline-block; background: #c9a84c; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 2px 6px rgba(201,168,76,0.3); }}
    .footer {{ background: #f8f8f8; padding: 18px 35px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #888; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Mabel Homes Admin Notification</h2>
      <p>Instant System Alert · {now_str}</p>
    </div>
    <div class="body">
      <h3 style="color: #0f2044; margin-top: 0; font-size: 17px;">{title}</h3>
      
      <table class="meta-table">
        <tr><td class="label">Date & Time:</td><td>{now_str}</td></tr>
        {'<tr><td class="label">Client Name:</td><td>' + str(client_name) + '</td></tr>' if client_name != 'N/A' else ''}
        {'<tr><td class="label">Client Email:</td><td>' + str(client_email) + '</td></tr>' if client_email != 'N/A' else ''}
        {'<tr><td class="label">Client Phone:</td><td>' + str(client_phone) + '</td></tr>' if client_phone != 'N/A' else ''}
        {'<tr><td class="label">Details:</td><td>' + str(details_title) + '</td></tr>' if details_title != 'N/A' else ''}
      </table>

      <div class="message-box">
        <strong>Details / Request:</strong><br>
        {message}
      </div>

      <div class="btn-container">
        <a href="{action_url}" class="btn">{action_label} &rarr;</a>
      </div>
    </div>
    <div class="footer">
      This is an automated notification from Mabel Homes Admin System.
    </div>
  </div>
</body>
</html>
"""
    return send_resend_email(to=recipients, subject=subject, html_body=html_body, text_body=message)


def send_property_enquiry_notification(enquiry) -> bool:
    """Sends email notification to administrators for a Property Enquiry."""
    recipients = get_admin_recipients()
    subject = f"[Mabel Homes Admin] New Property Enquiry: {enquiry.property_title}"
    now_str = enquiry.created_at.strftime("%B %d, %Y at %I:%M %p UTC") if hasattr(enquiry, "created_at") and enquiry.created_at else timezone.now().strftime("%B %d, %Y at %I:%M %p UTC")
    admin_base_url = getattr(settings, "ADMIN_DASHBOARD_URL", "https://admin.mabelhomes.org")
    action_url = f"{admin_base_url}/admin/dashboard/property-enquiries"

    text_body = (
        f"New Property Enquiry Received:\n\n"
        f"Date & Time: {now_str}\n"
        f"Property: {enquiry.property_title}\n"
        f"Customer Name: {enquiry.name}\n"
        f"Email: {enquiry.email}\n"
        f"Phone: {enquiry.phone}\n"
        f"Message: {enquiry.message}\n"
        f"Dashboard Link: {action_url}\n"
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
      <div style="background: #0f2044; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #c9a84c; margin: 0;">Mabel Homes Admin Alert</h2>
        <p style="color: #ffffff; opacity: 0.8; margin: 4px 0 0; font-size: 12px;">New Property Enquiry · {now_str}</p>
      </div>
      <div style="padding: 25px;">
        <h3 style="color: #0f2044; margin-top: 0;">Enquiry for: {enquiry.property_title}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 140px; background: #fafafa;">Date & Time:</td><td style="padding: 8px;">{now_str}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Name:</td><td style="padding: 8px;">{enquiry.name}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Email:</td><td style="padding: 8px;"><a href="mailto:{enquiry.email}">{enquiry.email}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Phone:</td><td style="padding: 8px;"><a href="tel:{enquiry.phone}">{enquiry.phone}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Property:</td><td style="padding: 8px;">{enquiry.property_title}</td></tr>
        </table>
        <div style="background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 15px; margin: 20px 0; font-size: 14px;">
          <strong>Message:</strong><br>
          <em style="display: block; margin-top: 6px;">"{enquiry.message}"</em>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="{action_url}" style="background: #c9a84c; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block;">View in Admin Dashboard &rarr;</a>
        </div>
      </div>
    </div>
    """
    return send_resend_email(to=recipients, subject=subject, html_body=html_body, text_body=text_body)


def send_shortlet_enquiry_notification(enquiry) -> bool:
    """Sends email notification to administrators for a Shortlet Enquiry."""
    recipients = get_admin_recipients()
    subject = f"[Mabel Homes Admin] New Shortlet Enquiry: {enquiry.property_title}"
    now_str = enquiry.created_at.strftime("%B %d, %Y at %I:%M %p UTC") if hasattr(enquiry, "created_at") and enquiry.created_at else timezone.now().strftime("%B %d, %Y at %I:%M %p UTC")
    admin_base_url = getattr(settings, "ADMIN_DASHBOARD_URL", "https://admin.mabelhomes.org")
    action_url = f"{admin_base_url}/admin/dashboard/shortlet-enquiries"
    check_in = enquiry.check_in_date or "N/A"
    check_out = enquiry.check_out_date or "N/A"
    guests = enquiry.guests or "N/A"

    text_body = (
        f"New Shortlet Enquiry Received:\n\n"
        f"Date & Time: {now_str}\n"
        f"Apartment: {enquiry.property_title}\n"
        f"Customer Name: {enquiry.name}\n"
        f"Email: {enquiry.email}\n"
        f"Phone: {enquiry.phone}\n"
        f"Check-In: {check_in}\n"
        f"Check-Out: {check_out}\n"
        f"Guests: {guests}\n"
        f"Message: {enquiry.message}\n"
        f"Dashboard Link: {action_url}\n"
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
      <div style="background: #0f2044; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #c9a84c; margin: 0;">Rosebowl Shortlets Admin Alert</h2>
        <p style="color: #ffffff; opacity: 0.8; margin: 4px 0 0; font-size: 12px;">New Shortlet Reservation Request · {now_str}</p>
      </div>
      <div style="padding: 25px;">
        <h3 style="color: #0f2044; margin-top: 0;">Apartment: {enquiry.property_title}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 140px; background: #fafafa;">Date & Time:</td><td style="padding: 8px;">{now_str}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Name:</td><td style="padding: 8px;">{enquiry.name}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Email:</td><td style="padding: 8px;"><a href="mailto:{enquiry.email}">{enquiry.email}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Phone:</td><td style="padding: 8px;"><a href="tel:{enquiry.phone}">{enquiry.phone}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Check-In:</td><td style="padding: 8px;">{check_in}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Check-Out:</td><td style="padding: 8px;">{check_out}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Guests:</td><td style="padding: 8px;">{guests}</td></tr>
        </table>
        <div style="background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 15px; margin: 20px 0; font-size: 14px;">
          <strong>Message:</strong><br>
          <em style="display: block; margin-top: 6px;">"{enquiry.message}"</em>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="{action_url}" style="background: #c9a84c; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block;">View Shortlet Enquiries &rarr;</a>
        </div>
      </div>
    </div>
    """
    return send_resend_email(to=recipients, subject=subject, html_body=html_body, text_body=text_body)


def send_service_enquiry_notification(enquiry) -> bool:
    """Sends email notification to administrators for a Service Enquiry."""
    recipients = get_admin_recipients()
    subject = f"[Mabel Homes Admin] New Service Enquiry: {enquiry.service_title}"
    now_str = enquiry.created_at.strftime("%B %d, %Y at %I:%M %p UTC") if hasattr(enquiry, "created_at") and enquiry.created_at else timezone.now().strftime("%B %d, %Y at %I:%M %p UTC")
    admin_base_url = getattr(settings, "ADMIN_DASHBOARD_URL", "https://admin.mabelhomes.org")
    action_url = f"{admin_base_url}/admin/dashboard/service-enquiries"

    text_body = (
        f"New Service Enquiry Received:\n\n"
        f"Date & Time: {now_str}\n"
        f"Service: {enquiry.service_title}\n"
        f"Customer Name: {enquiry.name}\n"
        f"Email: {enquiry.email}\n"
        f"Phone: {enquiry.phone}\n"
        f"Message: {enquiry.message}\n"
        f"Dashboard Link: {action_url}\n"
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
      <div style="background: #0f2044; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #c9a84c; margin: 0;">Mabel Homes Admin Alert</h2>
        <p style="color: #ffffff; opacity: 0.8; margin: 4px 0 0; font-size: 12px;">New Service Enquiry · {now_str}</p>
      </div>
      <div style="padding: 25px;">
        <h3 style="color: #0f2044; margin-top: 0;">Service Category: {enquiry.service_title}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 140px; background: #fafafa;">Date & Time:</td><td style="padding: 8px;">{now_str}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Name:</td><td style="padding: 8px;">{enquiry.name}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Email:</td><td style="padding: 8px;"><a href="mailto:{enquiry.email}">{enquiry.email}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Phone:</td><td style="padding: 8px;"><a href="tel:{enquiry.phone}">{enquiry.phone}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Service:</td><td style="padding: 8px;">{enquiry.service_title}</td></tr>
        </table>
        <div style="background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 15px; margin: 20px 0; font-size: 14px;">
          <strong>Message:</strong><br>
          <em style="display: block; margin-top: 6px;">"{enquiry.message}"</em>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="{action_url}" style="background: #c9a84c; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block;">View Service Enquiries &rarr;</a>
        </div>
      </div>
    </div>
    """
    return send_resend_email(to=recipients, subject=subject, html_body=html_body, text_body=text_body)


def send_contact_notification(contact) -> bool:
    """Sends email notification to administrators for a Contact Message."""
    recipients = get_admin_recipients()
    subject = f"[Mabel Homes Admin] New Contact Message: {contact.subject or 'General Enquiry'}"
    now_str = contact.created_at.strftime("%B %d, %Y at %I:%M %p UTC") if hasattr(contact, "created_at") and contact.created_at else timezone.now().strftime("%B %d, %Y at %I:%M %p UTC")
    admin_base_url = getattr(settings, "ADMIN_DASHBOARD_URL", "https://admin.mabelhomes.org")
    action_url = f"{admin_base_url}/admin/dashboard/contact-messages"

    text_body = (
        f"New Contact Message Received:\n\n"
        f"Date & Time: {now_str}\n"
        f"Subject: {contact.subject or 'General Enquiry'}\n"
        f"Name: {contact.name}\n"
        f"Email: {contact.email}\n"
        f"Phone: {contact.phone}\n"
        f"Message: {contact.message}\n"
        f"Dashboard Link: {action_url}\n"
    )

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
      <div style="background: #0f2044; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h2 style="color: #c9a84c; margin: 0;">Mabel Homes Admin Alert</h2>
        <p style="color: #ffffff; opacity: 0.8; margin: 4px 0 0; font-size: 12px;">New Contact Form Submission · {now_str}</p>
      </div>
      <div style="padding: 25px;">
        <h3 style="color: #0f2044; margin-top: 0;">Subject: {contact.subject or 'General Enquiry'}</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr><td style="padding: 8px; font-weight: bold; width: 140px; background: #fafafa;">Date & Time:</td><td style="padding: 8px;">{now_str}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Name:</td><td style="padding: 8px;">{contact.name}</td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Email:</td><td style="padding: 8px;"><a href="mailto:{contact.email}">{contact.email}</a></td></tr>
          <tr><td style="padding: 8px; font-weight: bold; background: #fafafa;">Client Phone:</td><td style="padding: 8px;"><a href="tel:{contact.phone}">{contact.phone}</a></td></tr>
        </table>
        <div style="background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 15px; margin: 20px 0; font-size: 14px;">
          <strong>Message:</strong><br>
          <em style="display: block; margin-top: 6px;">"{contact.message}"</em>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <a href="{action_url}" style="background: #c9a84c; color: #ffffff; text-decoration: none; padding: 12px 26px; border-radius: 8px; font-weight: bold; display: inline-block;">View Contact Messages &rarr;</a>
        </div>
      </div>
    </div>
    """
    return send_resend_email(to=recipients, subject=subject, html_body=html_body, text_body=text_body)


# ============================================================================
# Customer Confirmation Email Functions
# ============================================================================

def send_customer_property_enquiry_confirmation(enquiry) -> bool:
    """Sends confirmation email to customer after submitting a Property Enquiry."""
    if not enquiry.email:
        return False
    subject = f"Enquiry Received — {enquiry.property_title} | Mabel Homes"
    text_body = (
        f"Dear {enquiry.name},\n\n"
        f"Thank you for contacting Mabel Homes regarding '{enquiry.property_title}'.\n\n"
        f"We have received your enquiry and our advisory team is reviewing your request. "
        f"One of our dedicated consultants will reach out to you shortly.\n\n"
        f"Best regards,\n"
        f"Mabel Homes Team\n"
        f"https://www.mabelhomes.org\n"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
      <div style="background: #0f2044; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #c9a84c; margin: 0; font-size: 22px;">Mabel Homes</h1>
        <p style="color: #ffffff; opacity: 0.8; margin: 4px 0 0; font-size: 12px;">Luxury Real Estate & Investment</p>
      </div>
      <div style="padding: 25px 15px;">
        <h3 style="color: #0f2044; margin-top: 0;">Thank You for Reaching Out</h3>
        <p style="color: #444; line-height: 1.6;">Dear <strong>{enquiry.name}</strong>,</p>
        <p style="color: #444; line-height: 1.6;">
          Thank you for your interest in <strong>{enquiry.property_title}</strong>. We have successfully received your enquiry.
        </p>
        <div style="background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 15px; margin: 20px 0; font-size: 14px; color: #555;">
          <strong>Your Enquiry Message:</strong><br>
          <em style="display: block; margin-top: 8px;">"{enquiry.message}"</em>
        </div>
        <p style="color: #444; line-height: 1.6;">
          Our advisory team is reviewing your request and a representative will get in touch with you shortly.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #777;">
          <strong>Mabel Homes Advisory Team</strong><br>
          Website: <a href="https://www.mabelhomes.org" style="color: #c9a84c; text-decoration: none;">www.mabelhomes.org</a><br>
          Email: {getattr(settings, 'ADMIN_EMAIL', 'olajumoke@mabelhomes.org')}
        </div>
      </div>
    </div>
    """
    return send_resend_email(to=enquiry.email, subject=subject, html_body=html_body, text_body=text_body)


def send_customer_shortlet_enquiry_confirmation(enquiry) -> bool:
    """Sends confirmation email to customer after submitting a Shortlet Enquiry."""
    if not enquiry.email:
        return False
    subject = f"Shortlet Booking Request Received — {enquiry.property_title} | Mabel Homes"
    check_in = enquiry.check_in_date or "To be confirmed"
    check_out = enquiry.check_out_date or "To be confirmed"
    text_body = (
        f"Dear {enquiry.name},\n\n"
        f"Thank you for requesting a reservation for Rosebowl Shortlet: '{enquiry.property_title}'.\n\n"
        f"Check-In: {check_in}\nCheck-Out: {check_out}\n\n"
        f"We have received your booking request and our shortlet hospitality team is confirming availability. "
        f"We will contact you shortly to complete your booking.\n\n"
        f"Best regards,\n"
        f"Mabel Homes Shortlets Team\n"
        f"https://www.mabelhomes.org/shortlets\n"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
      <div style="background: #0f2044; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #c9a84c; margin: 0; font-size: 22px;">Rosebowl Shortlets</h1>
        <p style="color: #ffffff; opacity: 0.8; margin: 4px 0 0; font-size: 12px;">Mabel Homes Serviced Accommodations</p>
      </div>
      <div style="padding: 25px 15px;">
        <h3 style="color: #0f2044; margin-top: 0;">Reservation Request Received</h3>
        <p style="color: #444; line-height: 1.6;">Dear <strong>{enquiry.name}</strong>,</p>
        <p style="color: #444; line-height: 1.6;">
          Thank you for choosing Rosebowl Shortlets. We have received your booking enquiry for <strong>{enquiry.property_title}</strong>.
        </p>
        <div style="background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 15px; margin: 20px 0; font-size: 14px; color: #555;">
          <strong>Booking Request Summary:</strong><br>
          • <strong>Apartment:</strong> {enquiry.property_title}<br>
          • <strong>Check-In:</strong> {check_in}<br>
          • <strong>Check-Out:</strong> {check_out}<br>
          • <strong>Guests:</strong> {enquiry.guests or 'N/A'}
        </div>
        <p style="color: #444; line-height: 1.6;">
          Our hospitality manager is reviewing apartment availability and will contact you directly to confirm your stay.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #777;">
          <strong>Rosebowl Hospitality Team</strong><br>
          Website: <a href="https://www.mabelhomes.org/shortlets" style="color: #c9a84c; text-decoration: none;">www.mabelhomes.org/shortlets</a><br>
          Email: {getattr(settings, 'ADMIN_EMAIL', 'olajumoke@mabelhomes.org')}
        </div>
      </div>
    </div>
    """
    return send_resend_email(to=enquiry.email, subject=subject, html_body=html_body, text_body=text_body)


def send_customer_service_enquiry_confirmation(enquiry) -> bool:
    """Sends confirmation email to customer after submitting a Service Enquiry."""
    if not enquiry.email:
        return False
    subject = f"Service Request Received — {enquiry.service_title} | Mabel Homes"
    text_body = (
        f"Dear {enquiry.name},\n\n"
        f"Thank you for contacting Mabel Homes regarding our '{enquiry.service_title}' service.\n\n"
        f"We have received your enquiry and our service team is reviewing your requirements. "
        f"We will reach out to you shortly.\n\n"
        f"Best regards,\n"
        f"Mabel Homes Team\n"
        f"https://www.mabelhomes.org/services\n"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
      <div style="background: #0f2044; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #c9a84c; margin: 0; font-size: 22px;">Mabel Homes Services</h1>
        <p style="color: #ffffff; opacity: 0.8; margin: 4px 0 0; font-size: 12px;">Real Estate & Consultancy</p>
      </div>
      <div style="padding: 25px 15px;">
        <h3 style="color: #0f2044; margin-top: 0;">Service Request Received</h3>
        <p style="color: #444; line-height: 1.6;">Dear <strong>{enquiry.name}</strong>,</p>
        <p style="color: #444; line-height: 1.6;">
          Thank you for requesting information regarding <strong>{enquiry.service_title}</strong>.
        </p>
        <div style="background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 15px; margin: 20px 0; font-size: 14px; color: #555;">
          <strong>Your Request Details:</strong><br>
          <em style="display: block; margin-top: 8px;">"{enquiry.message}"</em>
        </div>
        <p style="color: #444; line-height: 1.6;">
          Our specialist team is reviewing your details and will get in touch with you shortly.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #777;">
          <strong>Mabel Homes Consultancy Team</strong><br>
          Website: <a href="https://www.mabelhomes.org/services" style="color: #c9a84c; text-decoration: none;">www.mabelhomes.org/services</a><br>
          Email: {getattr(settings, 'ADMIN_EMAIL', 'olajumoke@mabelhomes.org')}
        </div>
      </div>
    </div>
    """
    return send_resend_email(to=enquiry.email, subject=subject, html_body=html_body, text_body=text_body)


def send_customer_contact_confirmation(contact) -> bool:
    """Sends confirmation email to customer after submitting a Contact Message."""
    if not contact.email:
        return False
    subject = f"Message Received — Mabel Homes"
    text_body = (
        f"Dear {contact.name},\n\n"
        f"Thank you for contacting Mabel Homes.\n\n"
        f"We have received your message and our team will get back to you shortly.\n\n"
        f"Best regards,\n"
        f"Mabel Homes Team\n"
        f"https://www.mabelhomes.org\n"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e0e0e0; border-radius: 12px; background: #ffffff;">
      <div style="background: #0f2044; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #c9a84c; margin: 0; font-size: 22px;">Mabel Homes</h1>
        <p style="color: #ffffff; opacity: 0.8; margin: 4px 0 0; font-size: 12px;">Premium Real Estate & Property Advisory</p>
      </div>
      <div style="padding: 25px 15px;">
        <h3 style="color: #0f2044; margin-top: 0;">Thank You for Contacting Us</h3>
        <p style="color: #444; line-height: 1.6;">Dear <strong>{contact.name}</strong>,</p>
        <p style="color: #444; line-height: 1.6;">
          Thank you for reaching out to Mabel Homes. We have received your message:
        </p>
        <div style="background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 15px; margin: 20px 0; font-size: 14px; color: #555;">
          <strong>Subject:</strong> {contact.subject or 'General Enquiry'}<br><br>
          <em>"{contact.message}"</em>
        </div>
        <p style="color: #444; line-height: 1.6;">
          A member of our team will review your inquiry and respond to you as soon as possible.
        </p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 13px; color: #777;">
          <strong>Mabel Homes Support Team</strong><br>
          Website: <a href="https://www.mabelhomes.org" style="color: #c9a84c; text-decoration: none;">www.mabelhomes.org</a><br>
          Email: {getattr(settings, 'ADMIN_EMAIL', 'olajumoke@mabelhomes.org')}
        </div>
      </div>
    </div>
    """
    return send_resend_email(to=contact.email, subject=subject, html_body=html_body, text_body=text_body)


def send_reply_email(
    recipient_email: str,
    subject: str,
    reply_message: str,
    sender_name: str = "Mabel Homes Team",
) -> bool:
    """
    Sends a formatted reply email to an enquiry submitter using Resend.
    """
    text_body = (
        f"Dear Valued Client,\n\n"
        f"{reply_message}\n\n"
        f"—\n{sender_name}\nMabel Homes\n"
        f"Email: {getattr(settings, 'ADMIN_EMAIL', 'olajumoke@mabelhomes.org')}\n"
    )

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; background: #f5f5f5; }}
    .container {{ max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
    .header {{ background: linear-gradient(135deg, #0f2044 0%, #1a3a6b 100%); padding: 30px 40px; }}
    .header h1 {{ color: #c9a84c; margin: 0; font-size: 24px; letter-spacing: 1px; }}
    .header p {{ color: rgba(255,255,255,0.7); margin: 5px 0 0; font-size: 13px; }}
    .body {{ padding: 35px 40px; }}
    .greeting {{ font-size: 16px; color: #333; margin-bottom: 20px; }}
    .message {{ background: #f8f9fa; border-left: 4px solid #c9a84c; padding: 20px 25px; border-radius: 0 8px 8px 0; font-size: 15px; line-height: 1.7; color: #444; white-space: pre-wrap; }}
    .footer {{ background: #f8f8f8; padding: 20px 40px; border-top: 1px solid #eee; }}
    .footer p {{ color: #888; font-size: 12px; margin: 0; }}
    .signature {{ margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; }}
    .signature strong {{ color: #0f2044; font-size: 15px; }}
    .signature span {{ color: #c9a84c; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Mabel Homes</h1>
      <p>Premium Real Estate · Lagos, Nigeria</p>
    </div>
    <div class="body">
      <p class="greeting">Dear Valued Client,</p>
      <div class="message">{reply_message}</div>
      <div class="signature">
        <strong>{sender_name}</strong><br>
        <span>Mabel Homes Team</span><br>
        <small style="color:#888;">{getattr(settings, 'ADMIN_EMAIL', 'olajumoke@mabelhomes.org')}</small>
      </div>
    </div>
    <div class="footer">
      <p>This message was sent in response to your enquiry with Mabel Homes.</p>
    </div>
  </div>
</body>
</html>
"""
    return send_resend_email(
        to=recipient_email,
        subject=subject,
        html_body=html_body,
        text_body=text_body,
    )
