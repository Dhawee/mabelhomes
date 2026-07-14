from django import template

from core.models import AdminNotification

register = template.Library()


@register.simple_tag
def get_unread_notifications_count():
    """
    Returns the count of unread AdminNotification records
    to display as a badge in the admin site header.
    """
    try:
        return AdminNotification.objects.filter(read=False).count()
    except Exception:
        return 0
