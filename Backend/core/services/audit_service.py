import logging
from core.models import AuditLog

logger = logging.getLogger("core")

def log_action(user, action, model_name="", object_id="", description="", request=None):
    """
    Creates an AuditLog entry for administrative tracking.
    Extracts IP address and User Agent if request object is provided.
    """
    ip_address = None
    user_agent = ""

    if request:
        # Resolve client IP
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip_address = x_forwarded_for.split(",")[0].strip()
        else:
            ip_address = request.META.get("REMOTE_ADDR")

        # Resolve User Agent
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

    try:
        log_entry = AuditLog.objects.create(
            user=user if user and user.is_authenticated else None,
            action=action,
            model_name=model_name,
            object_id=str(object_id) if object_id else "",
            description=description,
            ip_address=ip_address,
            user_agent=user_agent,
        )
        logger.debug(f"Audit log saved: {description}")
        return log_entry
    except Exception as exc:
        logger.error(f"Failed to save AuditLog entry: {exc}", exc_info=True)
        return None
