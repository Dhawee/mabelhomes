import logging
import resend
from django.conf import settings

logger = logging.getLogger("core")


def send_resend_email(to: list[str] | str, subject: str, html_body: str, text_body: str = "") -> bool:
    """
    Sends an email using the official Resend Python SDK.
    Gracefully handles exceptions and logs delivery outcomes without crashing the caller.
    """
    api_key = getattr(settings, "RESEND_API_KEY", "")
    raw_from = getattr(settings, "FROM_EMAIL", "olajumoke@mabelhomes.org")
    from_email = raw_from if "<" in raw_from else f"Mabel Homes <{raw_from}>"

    recipients = [to] if isinstance(to, str) else list(to)
    recipients = [r for r in recipients if r and str(r).strip()]

    if not recipients:
        logger.warning("Resend email request skipped: No valid recipients provided.")
        return False

    if not api_key:
        logger.info(
            f"[RESEND SIMULATION] RESEND_API_KEY not configured. Email to {recipients} for subject {subject!r} logged."
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
        logger.info(f"Resend email delivered to {recipients}: {subject!r} (Response: {response})")
        return True
    except Exception as exc:
        logger.error(f"Resend email delivery failed for {recipients}: {exc}", exc_info=True)
        return False


def send_property_enquiry_notification(enquiry) -> bool:
    admin_email = getattr(settings, "ADMIN_EMAIL", "olajumoke@mabelhomes.org")
    subject = f"[Mabel Homes] New Property Enquiry: {enquiry.property_title}"
    text_body = (
        f"New Property Enquiry Received:\n\n"
        f"Property: {enquiry.property_title}\n"
        f"Name: {enquiry.name}\n"
        f"Email: {enquiry.email}\n"
        f"Phone: {enquiry.phone}\n"
        f"Message: {enquiry.message}\n"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #0f2044;">New Property Enquiry</h2>
      <p><strong>Property:</strong> {enquiry.property_title}</p>
      <p><strong>Customer Name:</strong> {enquiry.name}</p>
      <p><strong>Email:</strong> {enquiry.email}</p>
      <p><strong>Phone:</strong> {enquiry.phone}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #c9a84c;">{enquiry.message}</blockquote>
    </div>
    """
    return send_resend_email(to=admin_email, subject=subject, html_body=html_body, text_body=text_body)


def send_shortlet_enquiry_notification(enquiry) -> bool:
    admin_email = getattr(settings, "ADMIN_EMAIL", "olajumoke@mabelhomes.org")
    subject = f"[Mabel Homes Shortlets] New Shortlet Enquiry: {enquiry.property_title}"
    check_in = enquiry.check_in_date or "N/A"
    check_out = enquiry.check_out_date or "N/A"
    guests = enquiry.guests or "N/A"
    text_body = (
        f"New Shortlet Enquiry Received:\n\n"
        f"Apartment: {enquiry.property_title}\n"
        f"Customer Name: {enquiry.name}\n"
        f"Email: {enquiry.email}\n"
        f"Phone: {enquiry.phone}\n"
        f"Check-In: {check_in}\n"
        f"Check-Out: {check_out}\n"
        f"Guests: {guests}\n"
        f"Message: {enquiry.message}\n"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #0f2044;">New Shortlet Apartment Enquiry</h2>
      <p><strong>Apartment:</strong> {enquiry.property_title}</p>
      <p><strong>Customer Name:</strong> {enquiry.name}</p>
      <p><strong>Email:</strong> {enquiry.email}</p>
      <p><strong>Phone:</strong> {enquiry.phone}</p>
      <p><strong>Check-In:</strong> {check_in}</p>
      <p><strong>Check-Out:</strong> {check_out}</p>
      <p><strong>Guests:</strong> {guests}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #c9a84c;">{enquiry.message}</blockquote>
    </div>
    """
    return send_resend_email(to=admin_email, subject=subject, html_body=html_body, text_body=text_body)


def send_service_enquiry_notification(enquiry) -> bool:
    admin_email = getattr(settings, "ADMIN_EMAIL", "olajumoke@mabelhomes.org")
    subject = f"[Mabel Homes] New Service Enquiry: {enquiry.service_title}"
    text_body = (
        f"New Service Enquiry Received:\n\n"
        f"Service: {enquiry.service_title}\n"
        f"Name: {enquiry.name}\n"
        f"Email: {enquiry.email}\n"
        f"Phone: {enquiry.phone}\n"
        f"Message: {enquiry.message}\n"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #0f2044;">New Service Enquiry</h2>
      <p><strong>Service:</strong> {enquiry.service_title}</p>
      <p><strong>Customer Name:</strong> {enquiry.name}</p>
      <p><strong>Email:</strong> {enquiry.email}</p>
      <p><strong>Phone:</strong> {enquiry.phone}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #c9a84c;">{enquiry.message}</blockquote>
    </div>
    """
    return send_resend_email(to=admin_email, subject=subject, html_body=html_body, text_body=text_body)


def send_contact_notification(contact) -> bool:
    admin_email = getattr(settings, "ADMIN_EMAIL", "olajumoke@mabelhomes.org")
    subject = f"[Mabel Homes] New Contact Message: {contact.subject or 'General Enquiry'}"
    text_body = (
        f"New Contact Message Received:\n\n"
        f"Subject: {contact.subject or 'General Enquiry'}\n"
        f"Name: {contact.name}\n"
        f"Email: {contact.email}\n"
        f"Phone: {contact.phone}\n"
        f"Message: {contact.message}\n"
    )
    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #0f2044;">New Contact Form Submission</h2>
      <p><strong>Subject:</strong> {contact.subject or 'General Enquiry'}</p>
      <p><strong>Name:</strong> {contact.name}</p>
      <p><strong>Email:</strong> {contact.email}</p>
      <p><strong>Phone:</strong> {contact.phone}</p>
      <p><strong>Message:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #c9a84c;">{contact.message}</blockquote>
    </div>
    """
    return send_resend_email(to=admin_email, subject=subject, html_body=html_body, text_body=text_body)


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
