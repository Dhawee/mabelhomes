import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives, send_mail

from core.models import AdminNotification

logger = logging.getLogger("core")


def _get_email_backend_info():
    """Returns a human-readable description of the active email backend."""
    backend = settings.EMAIL_BACKEND
    reason = getattr(settings, "EMAIL_BACKEND_REASON", "")
    is_console = getattr(settings, "EMAIL_BACKEND_IS_CONSOLE", False)

    if is_console:
        return f"CONSOLE (emails printed to terminal) — Reason: {reason}"
    elif "smtp" in backend.lower():
        return f"SMTP ({settings.EMAIL_HOST}:{settings.EMAIL_PORT})"
    else:
        return backend


def notify_admin(
    title: str,
    message: str,
    notification_type: str = "system",
    metadata: dict | None = None,
    send_email: bool = True,
) -> AdminNotification | None:
    """
    1. Persists in-app AdminNotification record to database (never lost).
    2. Sends formatted Admin Email Notification via Resend to configured admin recipients if send_email=True.
    """
    notif = None
    try:
        notif = AdminNotification.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
        )
        logger.info(f"[ADMIN NOTIFICATION DB SAVED] AdminNotification #{notif.id} [{notification_type}]: {title!r}")
    except Exception as exc:
        logger.error(f"CRITICAL: Failed to save AdminNotification to database: {exc}", exc_info=True)

    if send_email:
        try:
            from core.services.email_service import send_admin_event_notification
            send_admin_event_notification(
                title=title,
                message=message,
                notification_type=notification_type,
                metadata=metadata,
            )
        except Exception as exc:
            logger.error(f"[ADMIN EMAIL EVENT ERROR] Failed to send admin email notification for {title!r}: {exc}", exc_info=True)

    return notif


def send_html_email(
    subject: str,
    text_body: str,
    html_body: str,
    recipient_email: str,
    from_email: str | None = None,
) -> bool:
    """
    Sends an email with both plain text and HTML alternatives.

    Returns True if delivered successfully, False on failure.
    """
    from_email = from_email or settings.DEFAULT_FROM_EMAIL
    backend_info = _get_email_backend_info()

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=from_email,
            to=[recipient_email],
        )
        email.attach_alternative(html_body, "text/html")
        email.send(fail_silently=False)

        logger.info(
            f"HTML email sent to {recipient_email} via {backend_info}: {subject!r}"
        )
        return True
    except Exception as exc:
        logger.error(
            f"Failed to send HTML email to {recipient_email} via {backend_info}: {exc}",
            exc_info=True,
        )
        return False


def send_reply_email(
    recipient_email: str,
    subject: str,
    reply_message: str,
    sender_name: str = "Mabel Homes Team",
) -> bool:
    """
    Sends a formatted reply email to an enquiry submitter.

    Returns True if delivered successfully, False on failure.
    """
    text_body = (
        f"Dear Valued Client,\n\n"
        f"{reply_message}\n\n"
        f"—\n{sender_name}\nMabel Homes\n"
        f"Email: {settings.ADMIN_EMAIL}\n"
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
        <small style="color:#888;">{settings.ADMIN_EMAIL}</small>
      </div>
    </div>
    <div class="footer">
      <p>This message was sent in response to your enquiry with Mabel Homes. Please do not reply directly to this email if you did not initiate contact.</p>
    </div>
  </div>
</body>
</html>
"""
    return send_html_email(
        subject=subject,
        text_body=text_body,
        html_body=html_body,
        recipient_email=recipient_email,
    )


def send_operational_notification(user, title: str, message: str) -> None:
    """
    Sends an operational notification (e.g. upload failure, task failure)
    only to the administrator performing the action.
    """
    # 1. Persist the in-app notification
    try:
        AdminNotification.objects.create(
            title=title,
            message=message,
            notification_type="system",
        )
        logger.debug(f"Operational AdminNotification saved: {title!r}")
    except Exception as exc:
        logger.error(f"Failed to save operational AdminNotification: {exc}", exc_info=True)

    # 2. Email the active administrator via Resend
    if user and user.is_authenticated and user.email:
        try:
            from core.services.email_service import send_resend_email
            subject = f"[Mabel Homes Admin] [OPERATIONAL] {title}"
            html_body = f"<div style='font-family:sans-serif;'><h2>[OPERATIONAL ALERT] {title}</h2><p>{message}</p></div>"
            send_resend_email(to=user.email, subject=subject, html_body=html_body, text_body=message)
            logger.info(f"Operational email sent successfully to {user.email} for: {title!r}")
        except Exception as exc:
            logger.error(f"Failed to send operational email to {user.email}: {exc}", exc_info=True)
