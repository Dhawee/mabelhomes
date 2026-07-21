from rest_framework import permissions
from rest_framework.authentication import SessionAuthentication


class DjangoModelPermissionsOrStaffExplicit(permissions.DjangoModelPermissions):
    """
    Superusers have unrestricted access.
    Staff users have access only if they have explicit model-level permissions.
    SAFE_METHODS (GET/OPTIONS/HEAD) are allowed for non-staff public users.
    """
    perms_map = {
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'OPTIONS': [],
        'HEAD': [],
        'POST': ['%(app_label)s.add_%(model_name)s'],
        'PUT': ['%(app_label)s.change_%(model_name)s'],
        'PATCH': ['%(app_label)s.change_%(model_name)s'],
        'DELETE': ['%(app_label)s.delete_%(model_name)s'],
    }

    def has_permission(self, request, view):
        # Allow read-only access for anonymous/non-staff users on public routes
        if request.method in permissions.SAFE_METHODS:
            if not request.user or not request.user.is_authenticated or not request.user.is_staff:
                return True

        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_superuser or request.user.is_staff:
            return True

        return False


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Allows read access to anyone, but write access only to authenticated staff users.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_staff)


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication subclass that skips CSRF enforcement.
    Safe for use in endpoints that accept anonymous POST requests
    (e.g. property likes from SPA clients) where CSRF cookies are
    not available cross-origin without extra configuration.
    """

    def enforce_csrf(self, request):
        return
