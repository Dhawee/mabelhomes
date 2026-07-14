from django.urls import include, path
from rest_framework.routers import DefaultRouter

from core.views import (AdminNotificationViewSet, AuditLogViewSet,
                        ContactMessageViewSet, DashboardStatsView,
                        MediaAssetViewSet, PropertyEnquiryViewSet,
                        PropertyTypeViewSet, PropertyVideoViewSet,
                        PropertyViewSet, ServiceEnquiryViewSet,
                        ServiceTypeViewSet, UserViewSet, GroupViewSet,
                        PermissionViewSet, PropertyImageViewSet, MetadataView)

# Initialize router
router = DefaultRouter()
router.register(r"property-types", PropertyTypeViewSet, basename="property-type")
router.register(r"services", ServiceTypeViewSet, basename="service")
router.register(r"properties", PropertyViewSet, basename="property")
router.register(r"property-images", PropertyImageViewSet, basename="property-image")
router.register(r"property-videos", PropertyVideoViewSet, basename="property-video")
router.register(
    r"property-enquiries", PropertyEnquiryViewSet, basename="property-enquiry"
)
router.register(r"service-enquiries", ServiceEnquiryViewSet, basename="service-enquiry")
router.register(r"contact-messages", ContactMessageViewSet, basename="contact-message")
router.register(r"notifications", AdminNotificationViewSet, basename="notification")
router.register(r"media", MediaAssetViewSet, basename="media-asset")
router.register(r"audit-log", AuditLogViewSet, basename="audit-log")
router.register(r"users", UserViewSet, basename="user")
router.register(r"groups", GroupViewSet, basename="group")
router.register(r"permissions", PermissionViewSet, basename="permission")

urlpatterns = [
    path("", include(router.urls)),
    path("metadata/", MetadataView.as_view(), name="metadata"),
    path("dashboard/stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
]
