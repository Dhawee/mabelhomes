import logging
import mimetypes
import os

from django.contrib.auth.models import User, Group, Permission
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q, Sum
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import JSONParser, FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework.views import APIView

from core.models import (AdminNotification, AuditLog, ContactMessage,
                         MediaAsset, Property, PropertyEnquiry, PropertyLike,
                         PropertyType, PropertyVideo, ServiceEnquiry,
                         ServiceType, PropertyImage, UserProfile)
from core.permissions import CsrfExemptSessionAuthentication, IsAdminUserOrReadOnly, DjangoModelPermissionsOrStaffExplicit
from core.serializers import (AdminNotificationSerializer,
                              AuditLogSerializer, ContactMessageSerializer,
                              DashboardStatsSerializer, EnquiryReplySerializer,
                              MediaAssetSerializer, PropertyEnquirySerializer,
                              PropertySerializer, PropertyListSerializer,
                              PropertyTypeSerializer, PropertyVideoSerializer,
                              ServiceEnquirySerializer, ServiceTypeSerializer,
                              UserSerializer, GroupSerializer, PermissionSerializer,
                              PropertyImageSerializer)
from core.services.enquiry_service import (create_contact_message,
                                           create_property_enquiry,
                                           create_service_enquiry,
                                           send_enquiry_reply)
from core.services.property_service import (get_like_status,
                                            get_similar_properties,
                                            toggle_like_property)
from core.services.search_service import search_and_filter_properties
from core.services.audit_service import log_action

logger = logging.getLogger("core")


# ---------------------------------------------------------------------------
# Property Types
# ---------------------------------------------------------------------------

class PropertyTypeViewSet(viewsets.ModelViewSet):
    queryset = PropertyType.objects.filter(is_deleted=False).order_by("name")
    serializer_class = PropertyTypeSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]
    pagination_class = None  # Small list, no pagination needed


# ---------------------------------------------------------------------------
# Service Types
# ---------------------------------------------------------------------------

class ServiceTypeViewSet(viewsets.ModelViewSet):
    queryset = ServiceType.objects.filter(is_deleted=False).order_by("title")
    serializer_class = ServiceTypeSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]
    pagination_class = None  # Small list, no pagination needed


# ---------------------------------------------------------------------------
# Properties
# ---------------------------------------------------------------------------

class PropertyViewSet(viewsets.ModelViewSet):
    serializer_class = PropertySerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "list":
            return PropertyListSerializer
        return PropertySerializer

    def get_queryset(self):
        # Read query parameters
        search_query = self.request.query_params.get("search")
        city = self.request.query_params.get("location")
        type_slug = self.request.query_params.get("type")
        status_param = self.request.query_params.get("status")

        price_min = self.request.query_params.get("price_min")
        price_max = self.request.query_params.get("price_max")
        bedrooms = self.request.query_params.get("bedrooms")

        featured = self.request.query_params.get("featured")
        luxury = self.request.query_params.get("luxury")

        is_staff = self.request.user.is_authenticated and self.request.user.is_staff
        is_visible_param = self.request.query_params.get("is_visible")
        is_visible_val = None
        if is_visible_param is not None:
            is_visible_val = is_visible_param.lower() in ("true", "1", "yes")

        # Convert parameters to appropriate types
        try:
            if price_min:
                price_min = int(float(price_min))
            if price_max:
                price_max = int(float(price_max))
            if bedrooms:
                bedrooms = int(float(bedrooms))
        except ValueError:
            pass  # Fallback to None if malformed int passed

        if featured is not None:
            featured = featured.lower() in ("true", "1", "yes")
        if luxury is not None:
            luxury = luxury.lower() in ("true", "1", "yes")

        show_deleted_param = self.request.query_params.get("show_deleted")
        show_deleted_val = False
        if show_deleted_param is not None:
            show_deleted_val = show_deleted_param.lower() in ("true", "1", "yes")

        return search_and_filter_properties(
            search_query=search_query,
            city=city,
            type_slug=type_slug,
            status=status_param,
            price_min=price_min,
            price_max=price_max,
            bedrooms=bedrooms,
            featured=featured,
            luxury=luxury,
            include_hidden=is_staff,
            is_visible=is_visible_val,
            show_deleted=show_deleted_val,
            prefetch_videos=(self.action != "list"),
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Property creation validation errors: {serializer.errors}")
            print("Property creation validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            logger.error(f"Property update validation errors: {serializer.errors}")
            print("Property update validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_create(self, serializer):
        instance = serializer.save()
        log_action(
            user=self.request.user,
            action="create",
            model_name="Property",
            object_id=instance.pk,
            description=f"Created property '{instance.title}'",
            request=self.request
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        log_action(
            user=self.request.user,
            action="update",
            model_name="Property",
            object_id=instance.pk,
            description=f"Updated property '{instance.title}'",
            request=self.request
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])
        log_action(
            user=self.request.user,
            action="delete",
            model_name="Property",
            object_id=instance.pk,
            description=f"Soft-deleted property '{instance.title}'",
            request=self.request
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def restore(self, request, slug=None):
        instance = self.get_object()
        instance.is_deleted = False
        instance.save(update_fields=["is_deleted"])
        log_action(
            user=request.user,
            action="update",
            model_name="Property",
            object_id=instance.pk,
            description=f"Restored soft-deleted property '{instance.title}'",
            request=request
        )
        return Response({"status": "success", "message": "Property restored."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def archive(self, request, slug=None):
        instance = self.get_object()
        instance.status = "Archived"
        instance.save(update_fields=["status"])
        log_action(
            user=request.user,
            action="update",
            model_name="Property",
            object_id=instance.pk,
            description=f"Archived property '{instance.title}'",
            request=request
        )
        return Response({"status": "success", "message": "Property archived."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAdminUser])
    def duplicate(self, request, slug=None):
        original = self.get_object()
        new_title = f"{original.title} (Copy)"
        
        base_slug = slugify(new_title)
        new_slug = base_slug
        counter = 1
        while Property.objects.filter(slug=new_slug).exists():
            new_slug = f"{base_slug}-{counter}"
            counter += 1

        duplicate_prop = Property.objects.create(
            title=new_title,
            slug=new_slug,
            location=original.location,
            city=original.city,
            state=original.state,
            country=original.country,
            price=original.price,
            previous_price=original.previous_price,
            current_price=original.current_price,
            bedrooms=original.bedrooms,
            bathrooms=original.bathrooms,
            sqft=original.sqft,
            status="Draft",
            property_type=original.property_type,
            featured=False,
            luxury=original.luxury,
            description=original.description,
            building_approval=original.building_approval,
            survey=original.survey,
            document_title=original.document_title,
            features=original.features,
            amenities=original.amenities,
            year_built=original.year_built,
            parking=original.parking,
            video_tour=original.video_tour,
            latitude=original.latitude,
            longitude=original.longitude,
            seo_title=original.seo_title,
            seo_description=original.seo_description,
            seo_keywords=original.seo_keywords,
            is_visible=False,
            is_deleted=False,
        )

        for img in original.images.all():
            PropertyImage.objects.create(
                property=duplicate_prop,
                image_upload=img.image_upload,
                image_optimized=img.image_optimized,
                image_thumbnail=img.image_thumbnail,
                image_url=img.image_url,
                order=img.order,
                is_primary=img.is_primary,
            )

        for vid in original.videos.all():
            PropertyVideo.objects.create(
                property=duplicate_prop,
                video_upload=vid.video_upload,
                video_url=vid.video_url,
                video_type=vid.video_type,
                title=vid.title,
                order=vid.order,
                is_primary=vid.is_primary,
            )

        log_action(
            user=request.user,
            action="create",
            model_name="Property",
            object_id=duplicate_prop.pk,
            description=f"Duplicated property '{original.title}' as '{duplicate_prop.title}'",
            request=request
        )

        serializer = self.get_serializer(duplicate_prop)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["delete"], permission_classes=[permissions.IsAdminUser])
    def permanent_delete(self, request, slug=None):
        instance = self.get_object()
        title = instance.title
        pk = instance.pk
        instance.delete()
        log_action(
            user=request.user,
            action="delete",
            model_name="Property",
            object_id=pk,
            description=f"Permanently deleted property '{title}'",
            request=request
        )
        return Response({"status": "success", "message": "Property permanently deleted."}, status=status.HTTP_204_NO_CONTENT)

    @action(
        detail=True,
        methods=["post"],
        throttle_classes=[AnonRateThrottle, UserRateThrottle],
        authentication_classes=[CsrfExemptSessionAuthentication],
        permission_classes=[permissions.AllowAny],
    )
    def like(self, request, slug=None):
        obj = self.get_object()
        
        # Check X-Visitor-ID header first, then body parameter (for maximum client compatibility)
        session_key = request.headers.get("X-Visitor-ID") or request.data.get("visitor_id")
        if not session_key:
            if not request.session.session_key:
                request.session.create()
            session_key = request.session.session_key

        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            ip = x_forwarded_for.split(",")[0].strip()
        else:
            ip = request.META.get("REMOTE_ADDR")

        result = toggle_like_property(obj.id, session_key=session_key, ip_address=ip)
        return Response(result, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["get"],
        authentication_classes=[CsrfExemptSessionAuthentication],
        permission_classes=[permissions.AllowAny],
    )
    def like_status(self, request, slug=None):
        obj = self.get_object()
        
        # Check X-Visitor-ID header first, then query parameter (for maximum client compatibility)
        session_key = request.headers.get("X-Visitor-ID") or request.query_params.get("visitor_id")
        if not session_key:
            if not request.session.session_key:
                request.session.create()
            session_key = request.session.session_key

        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        ip = (
            x_forwarded_for.split(",")[0].strip()
            if x_forwarded_for
            else request.META.get("REMOTE_ADDR")
        )

        result = get_like_status(obj.id, session_key=session_key, ip_address=ip)
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def similar(self, request, slug=None):
        obj = self.get_object()
        similar_props = get_similar_properties(obj, limit=3)
        serializer = self.get_serializer(similar_props, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny])
    def log_missing_image(self, request, slug=None):
        obj = self.get_object()
        image_url = request.data.get("image_url", "Unknown URL")
        image_id = request.data.get("image_id", "Unknown ID")

        title = f"Missing Property Image on: {obj.title}"
        message = (
            f"A visitor's browser reported a missing image file for property:\n"
            f"Property: {obj.title} (Slug: {obj.slug})\n"
            f"Image ID: {image_id}\n"
            f"Image URL: {image_url}\n\n"
            f"Please verify this file in Supabase Storage and re-upload if needed."
        )

        # Check if an active unread notification already exists for this property and image_id to prevent duplicates
        exists = AdminNotification.objects.filter(
            notification_type=AdminNotification.NOTIFICATION_SYSTEM,
            title=title,
            read=False,
            message__contains=f"Image ID: {image_id}"
        ).exists()

        if not exists:
            from core.services.notification_service import notify_admin
            notify_admin(
                title=title,
                message=message,
                notification_type=AdminNotification.NOTIFICATION_SYSTEM,
            )
            logger.warning(f"Reported missing image for property '{obj.title}': ID={image_id}, URL={image_url}")
        else:
            logger.info(f"Duplicate missing image report skipped for property '{obj.title}', ID={image_id}")

        return Response({"status": "logged"}, status=status.HTTP_200_OK)

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAdminUser],
    )
    def toggle_visibility(self, request, slug=None):
        obj = self.get_object()
        obj.is_visible = not obj.is_visible
        obj.save(update_fields=["is_visible"])
        log_action(
            user=request.user,
            action="update",
            model_name="Property",
            object_id=obj.pk,
            description=f"Toggled property visibility for '{obj.title}' to {obj.is_visible}",
            request=request
        )
        return Response(
            {"is_visible": obj.is_visible, "message": f"Property {'shown' if obj.is_visible else 'hidden'}."},
            status=status.HTTP_200_OK,
        )

    @action(
        detail=True,
        methods=["post"],
        permission_classes=[permissions.IsAdminUser],
    )
    def toggle_featured(self, request, slug=None):
        obj = self.get_object()
        obj.featured = not obj.featured
        obj.save(update_fields=["featured"])
        log_action(
            user=request.user,
            action="update",
            model_name="Property",
            object_id=obj.pk,
            description=f"Toggled property featured for '{obj.title}' to {obj.featured}",
            request=request
        )
        return Response(
            {"featured": obj.featured, "message": f"Property {'featured' if obj.featured else 'unfeatured'}."},
            status=status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Property Videos
# ---------------------------------------------------------------------------

class PropertyVideoViewSet(viewsets.ModelViewSet):
    serializer_class = PropertyVideoSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        return PropertyVideo.objects.all().order_by("order", "created_at")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Property video creation validation errors: {serializer.errors}")
            print("Property video creation validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def perform_destroy(self, instance):
        title = instance.property.title
        pk = instance.pk
        instance.delete()
        log_action(
            user=self.request.user,
            action="delete",
            model_name="PropertyVideo",
            object_id=pk,
            description=f"Removed video from property '{title}'",
            request=self.request
        )

    @action(detail=True, methods=["post"])
    def set_primary(self, request, pk=None):
        instance = self.get_object()
        instance.is_primary = True
        instance.save()
        return Response({"status": "primary video set", "is_primary": True}, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Property Enquiries
# ---------------------------------------------------------------------------

class PropertyEnquiryViewSet(viewsets.ModelViewSet):
    queryset = PropertyEnquiry.objects.filter(is_deleted=False).order_by("-created_at")
    serializer_class = PropertyEnquirySerializer

    def get_permissions(self):
        if self.action in ["create", "client_reply"]:
            return [permissions.AllowAny()]
        return [DjangoModelPermissionsOrStaffExplicit()]

    def create(self, request, *args, **kwargs):
        property_id = request.data.get("property")
        name = request.data.get("name")
        email = request.data.get("email")
        phone = request.data.get("phone")
        message = request.data.get("message", "")

        try:
            enquiry = create_property_enquiry(
                property_id=property_id,
                name=name,
                email=email,
                phone=phone,
                message=message,
            )
            serializer = self.get_serializer(enquiry)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            error_message = e.messages[0] if hasattr(e, "messages") else str(e)
            return Response(
                {"error": error_message}, status=status.HTTP_400_BAD_REQUEST
            )

    def perform_update(self, serializer):
        instance = serializer.instance
        status_val = self.request.data.get("status")
        replied_val = self.request.data.get("replied")

        update_fields = []
        if status_val in ["Pending", "Responded", "Closed"]:
            instance.status = status_val
            update_fields.append("status")
            if status_val == "Responded":
                instance.responded_at = timezone.now()
                instance.responded_by = self.request.user
                update_fields.extend(["responded_at", "responded_by"])

        if replied_val is not None:
            instance.replied = replied_val in [True, "true", "True", 1]
            update_fields.append("replied")

        serializer.save()
        if update_fields:
            instance.save(update_fields=update_fields)

        log_action(
            user=self.request.user,
            action="update",
            model_name="PropertyEnquiry",
            object_id=instance.pk,
            description=f"Updated property enquiry #{instance.pk} status to '{instance.status}'",
            request=self.request
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])
        log_action(
            user=self.request.user,
            action="delete",
            model_name="PropertyEnquiry",
            object_id=instance.pk,
            description=f"Soft-deleted property enquiry #{instance.pk}",
            request=self.request
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny])
    def client_reply(self, request, pk=None):
        enquiry = self.get_object()
        message = request.data.get("message")
        if not message or not message.strip():
            return Response({"error": "Message cannot be empty."}, status=400)

        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(enquiry)

        reply = EnquiryReply.objects.create(
            content_type=ct,
            object_id=enquiry.pk,
            sender=None,
            recipient_email=settings.DEFAULT_FROM_EMAIL,
            subject=f"Re: Client response on property enquiry #{enquiry.pk}",
            message=message,
            email_delivered=True
        )

        enquiry.status = "Pending"
        enquiry.replied = False
        enquiry.save(update_fields=["status", "replied"])

        # Broadcast client reply to all active admins
        from core.services.notification_service import notify_admin
        notify_admin(
            title=f"Client Reply on Property Enquiry #{enquiry.pk}",
            message=f"Client {enquiry.name} has replied to thread #{enquiry.pk}.\n\nReply Message:\n{message}",
            notification_type="property_enquiry"
        )

        return Response({"status": "success", "message": "Reply saved successfully."})

    @action(detail=True, methods=["post"], permission_classes=[DjangoModelPermissionsOrStaffExplicit])
    def reply(self, request, pk=None):
        """Send a reply email to the enquiry submitter."""
        enquiry = self.get_object()
        subject = request.data.get("subject", f"Re: Your enquiry about {enquiry.property_title}")
        message = request.data.get("message", "")

        if not message.strip():
            return Response(
                {"error": "Reply message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reply_obj = send_enquiry_reply(
                enquiry_instance=enquiry,
                subject=subject,
                message=message,
                sender_user=request.user if request.user.is_authenticated else None,
            )

            # Update responder metadata
            enquiry.responded_at = timezone.now()
            enquiry.responded_by = request.user
            enquiry.save(update_fields=["responded_at", "responded_by"])

            log_action(
                user=request.user,
                action="reply",
                model_name="PropertyEnquiry",
                object_id=enquiry.pk,
                description=f"Replied to property enquiry #{enquiry.pk}",
                request=request
            )

            serializer = EnquiryReplySerializer(reply_obj, context={"request": request})
            return Response(
                {
                    "status": "success",
                    "email_delivered": reply_obj.email_delivered,
                    "reply": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            logger.error(f"Reply failed for PropertyEnquiry #{enquiry.pk}: {exc}", exc_info=True)
            return Response(
                {"error": f"Failed to send reply: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["get"], permission_classes=[DjangoModelPermissionsOrStaffExplicit])
    def replies(self, request, pk=None):
        """List all replies for this enquiry."""
        enquiry = self.get_object()
        from django.contrib.contenttypes.models import ContentType
        from core.models import EnquiryReply
        ct = ContentType.objects.get_for_model(PropertyEnquiry)
        replies = EnquiryReply.objects.filter(content_type=ct, object_id=enquiry.pk)
        serializer = EnquiryReplySerializer(replies, many=True, context={"request": request})
        return Response(serializer.data)


class ServiceEnquiryViewSet(viewsets.ModelViewSet):
    queryset = ServiceEnquiry.objects.filter(is_deleted=False).order_by("-created_at")
    serializer_class = ServiceEnquirySerializer

    def get_permissions(self):
        if self.action in ["create", "client_reply"]:
            return [permissions.AllowAny()]
        return [DjangoModelPermissionsOrStaffExplicit()]

    def create(self, request, *args, **kwargs):
        service_type_id_or_slug = request.data.get("service_type")
        name = request.data.get("name")
        email = request.data.get("email")
        phone = request.data.get("phone")
        message = request.data.get("message", "")

        try:
            enquiry = create_service_enquiry(
                service_slug_or_id=service_type_id_or_slug,
                name=name,
                email=email,
                phone=phone,
                message=message,
            )
            serializer = self.get_serializer(enquiry)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            error_message = e.messages[0] if hasattr(e, "messages") else str(e)
            return Response(
                {"error": error_message}, status=status.HTTP_400_BAD_REQUEST
            )

    def perform_update(self, serializer):
        instance = serializer.instance
        status_val = self.request.data.get("status")
        replied_val = self.request.data.get("replied")

        update_fields = []
        if status_val in ["Pending", "Responded", "Closed"]:
            instance.status = status_val
            update_fields.append("status")
            if status_val == "Responded":
                instance.responded_at = timezone.now()
                instance.responded_by = self.request.user
                update_fields.extend(["responded_at", "responded_by"])

        if replied_val is not None:
            instance.replied = replied_val in [True, "true", "True", 1]
            update_fields.append("replied")

        serializer.save()
        if update_fields:
            instance.save(update_fields=update_fields)

        log_action(
            user=self.request.user,
            action="update",
            model_name="ServiceEnquiry",
            object_id=instance.pk,
            description=f"Updated service enquiry #{instance.pk} status to '{instance.status}'",
            request=self.request
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])
        log_action(
            user=self.request.user,
            action="delete",
            model_name="ServiceEnquiry",
            object_id=instance.pk,
            description=f"Soft-deleted service enquiry #{instance.pk}",
            request=self.request
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny])
    def client_reply(self, request, pk=None):
        enquiry = self.get_object()
        message = request.data.get("message")
        if not message or not message.strip():
            return Response({"error": "Message cannot be empty."}, status=400)

        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(enquiry)

        reply = EnquiryReply.objects.create(
            content_type=ct,
            object_id=enquiry.pk,
            sender=None,
            recipient_email=settings.DEFAULT_FROM_EMAIL,
            subject=f"Re: Client response on service enquiry #{enquiry.pk}",
            message=message,
            email_delivered=True
        )

        enquiry.status = "Pending"
        enquiry.replied = False
        enquiry.save(update_fields=["status", "replied"])

        # Broadcast client reply to all active admins
        from core.services.notification_service import notify_admin
        notify_admin(
            title=f"Client Reply on Service Enquiry #{enquiry.pk}",
            message=f"Client {enquiry.name} has replied to thread #{enquiry.pk}.\n\nReply Message:\n{message}",
            notification_type="service_enquiry"
        )

        return Response({"status": "success", "message": "Reply saved successfully."})

    @action(detail=True, methods=["post"], permission_classes=[DjangoModelPermissionsOrStaffExplicit])
    def reply(self, request, pk=None):
        """Send a reply email to the service enquiry submitter."""
        enquiry = self.get_object()
        subject = request.data.get("subject", f"Re: Your enquiry about {enquiry.service_title}")
        message = request.data.get("message", "")

        if not message.strip():
            return Response(
                {"error": "Reply message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reply_obj = send_enquiry_reply(
                enquiry_instance=enquiry,
                subject=subject,
                message=message,
                sender_user=request.user if request.user.is_authenticated else None,
            )

            # Update responder metadata
            enquiry.responded_at = timezone.now()
            enquiry.responded_by = request.user
            enquiry.save(update_fields=["responded_at", "responded_by"])

            log_action(
                user=request.user,
                action="reply",
                model_name="ServiceEnquiry",
                object_id=enquiry.pk,
                description=f"Replied to service enquiry #{enquiry.pk}",
                request=request
            )

            serializer = EnquiryReplySerializer(reply_obj, context={"request": request})
            return Response(
                {
                    "status": "success",
                    "email_delivered": reply_obj.email_delivered,
                    "reply": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            logger.error(f"Reply failed for ServiceEnquiry #{enquiry.pk}: {exc}", exc_info=True)
            return Response(
                {"error": f"Failed to send reply: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["get"], permission_classes=[DjangoModelPermissionsOrStaffExplicit])
    def replies(self, request, pk=None):
        """List all replies for this service enquiry."""
        enquiry = self.get_object()
        from django.contrib.contenttypes.models import ContentType
        from core.models import EnquiryReply
        ct = ContentType.objects.get_for_model(ServiceEnquiry)
        replies = EnquiryReply.objects.filter(content_type=ct, object_id=enquiry.pk)
        serializer = EnquiryReplySerializer(replies, many=True, context={"request": request})
        return Response(serializer.data)


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.filter(is_deleted=False).order_by("-created_at")
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action in ["create", "client_reply"]:
            return [permissions.AllowAny()]
        return [DjangoModelPermissionsOrStaffExplicit()]

    def create(self, request, *args, **kwargs):
        name = request.data.get("name")
        email = request.data.get("email")
        phone = request.data.get("phone")
        message = request.data.get("message", "")
        subject = request.data.get("subject", "")

        try:
            contact = create_contact_message(
                name=name,
                email=email,
                phone=phone,
                message=message,
                subject=subject,
            )
            serializer = self.get_serializer(contact)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            error_message = e.messages[0] if hasattr(e, "messages") else str(e)
            return Response(
                {"error": error_message}, status=status.HTTP_400_BAD_REQUEST
            )

    def perform_update(self, serializer):
        instance = serializer.instance
        status_val = self.request.data.get("status")
        replied_val = self.request.data.get("replied")

        update_fields = []
        if status_val in ["Pending", "Responded", "Closed"]:
            instance.status = status_val
            update_fields.append("status")
            if status_val == "Responded":
                instance.responded_at = timezone.now()
                instance.responded_by = self.request.user
                update_fields.extend(["responded_at", "responded_by"])

        if replied_val is not None:
            instance.replied = replied_val in [True, "true", "True", 1]
            update_fields.append("replied")

        serializer.save()
        if update_fields:
            instance.save(update_fields=update_fields)

        log_action(
            user=self.request.user,
            action="update",
            model_name="ContactMessage",
            object_id=instance.pk,
            description=f"Updated contact message #{instance.pk} status to '{instance.status}'",
            request=self.request
        )

    def perform_destroy(self, instance):
        instance.is_deleted = True
        instance.save(update_fields=["is_deleted"])
        log_action(
            user=self.request.user,
            action="delete",
            model_name="ContactMessage",
            object_id=instance.pk,
            description=f"Soft-deleted contact message #{instance.pk}",
            request=self.request
        )

    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny])
    def client_reply(self, request, pk=None):
        contact = self.get_object()
        message = request.data.get("message")
        if not message or not message.strip():
            return Response({"error": "Message cannot be empty."}, status=400)

        from django.contrib.contenttypes.models import ContentType
        ct = ContentType.objects.get_for_model(contact)

        reply = EnquiryReply.objects.create(
            content_type=ct,
            object_id=contact.pk,
            sender=None,
            recipient_email=settings.DEFAULT_FROM_EMAIL,
            subject=f"Re: Client response on contact message #{contact.pk}",
            message=message,
            email_delivered=True
        )

        contact.status = "Pending"
        contact.replied = False
        contact.save(update_fields=["status", "replied"])

        # Broadcast client reply to all active admins
        from core.services.notification_service import notify_admin
        notify_admin(
            title=f"Client Reply on Contact Message #{contact.pk}",
            message=f"Client {contact.name} has replied to thread #{contact.pk}.\n\nReply Message:\n{message}",
            notification_type="contact"
        )

        return Response({"status": "success", "message": "Reply saved successfully."})

    @action(detail=True, methods=["post"], permission_classes=[DjangoModelPermissionsOrStaffExplicit])
    def reply(self, request, pk=None):
        """Send a reply email to the contact message submitter."""
        contact = self.get_object()
        subject = request.data.get("subject", f"Re: {contact.subject or 'Your Message'}")
        message = request.data.get("message", "")

        if not message.strip():
            return Response(
                {"error": "Reply message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reply_obj = send_enquiry_reply(
                enquiry_instance=contact,
                subject=subject,
                message=message,
                sender_user=request.user if request.user.is_authenticated else None,
            )

            # Update responder metadata
            contact.responded_at = timezone.now()
            contact.responded_by = request.user
            contact.save(update_fields=["responded_at", "responded_by"])

            log_action(
                user=request.user,
                action="reply",
                model_name="ContactMessage",
                object_id=contact.pk,
                description=f"Replied to contact message #{contact.pk}",
                request=request
            )

            serializer = EnquiryReplySerializer(reply_obj, context={"request": request})
            return Response(
                {
                    "status": "success",
                    "email_delivered": reply_obj.email_delivered,
                    "reply": serializer.data,
                },
                status=status.HTTP_200_OK,
            )
        except Exception as exc:
            return Response(
                {"error": f"Failed to send reply: {exc}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=True, methods=["get"], permission_classes=[DjangoModelPermissionsOrStaffExplicit])
    def replies(self, request, pk=None):
        """List all replies for this contact message."""
        contact = self.get_object()
        from django.contrib.contenttypes.models import ContentType
        from core.models import EnquiryReply
        ct = ContentType.objects.get_for_model(ContactMessage)
        replies = EnquiryReply.objects.filter(content_type=ct, object_id=contact.pk)
        serializer = EnquiryReplySerializer(replies, many=True, context={"request": request})
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# Admin Notifications
# ---------------------------------------------------------------------------

class AdminNotificationViewSet(viewsets.ModelViewSet):
    queryset = AdminNotification.objects.all().order_by("-created_at")
    serializer_class = AdminNotificationSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        """Toggle notification read status."""
        notification = self.get_object()
        notification.read = True
        notification.save(update_fields=["read"])
        return Response({"status": "success", "read": True}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        """Mark all unread notifications as read."""
        count = AdminNotification.objects.filter(read=False).update(read=True)
        return Response({"status": "success", "marked_read": count})


# ---------------------------------------------------------------------------
# Media Assets (Media Library)
# ---------------------------------------------------------------------------

class MediaAssetViewSet(viewsets.ModelViewSet):
    queryset = MediaAsset.objects.all().order_by("-created_at")
    serializer_class = MediaAssetSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        qs = super().get_queryset()
        media_type = self.request.query_params.get("media_type")
        folder = self.request.query_params.get("folder")
        search = self.request.query_params.get("search")
        unused_only = self.request.query_params.get("unused")

        if media_type:
            qs = qs.filter(media_type=media_type)
        if folder is not None:
            qs = qs.filter(folder=folder)
        if search:
            qs = qs.filter(file_name__icontains=search)

        if unused_only and unused_only.lower() in ("true", "1", "yes"):
            # Exclude assets that are used in properties (either image or video)
            from core.models import PropertyImage, PropertyVideo
            used_urls = list(PropertyImage.objects.exclude(image_url="").values_list("image_url", flat=True))
            used_uploads = list(PropertyImage.objects.exclude(image_upload="").values_list("image_upload", flat=True))
            used_optimized = list(PropertyImage.objects.exclude(image_optimized="").values_list("image_optimized", flat=True))
            used_videos = list(PropertyVideo.objects.exclude(video_url="").values_list("video_url", flat=True))
            used_video_uploads = list(PropertyVideo.objects.exclude(video_upload="").values_list("video_upload", flat=True))

            exclude_q = Q(file__in=used_uploads + used_optimized + used_video_uploads)
            for url in used_urls + used_videos:
                if url:
                    exclude_q |= Q(file__icontains=os.path.basename(url))
            qs = qs.exclude(exclude_q)

        return qs

    def perform_create(self, serializer):
        file = self.request.FILES.get("file")
        if not file:
            from rest_framework.exceptions import ValidationError as DRFValidationError
            raise DRFValidationError({"file": "No file was provided."})

        try:
            # Validate magic bytes
            mime_type, _ = mimetypes.guess_type(file.name)
            mime_type = mime_type or "application/octet-stream"

            if mime_type.startswith("image/"):
                from core.services.image_service import validate_image_file
                media_type = MediaAsset.MEDIA_TYPE_IMAGE
                validate_image_file(file)
            elif mime_type.startswith("video/"):
                from core.models import validate_video_file
                media_type = MediaAsset.MEDIA_TYPE_VIDEO
                validate_video_file(file)
            else:
                media_type = MediaAsset.MEDIA_TYPE_DOCUMENT

            instance = serializer.save(
                file_name=file.name,
                media_type=media_type,
                mime_type=mime_type,
                file_size=file.size,
                uploaded_by=self.request.user if self.request.user.is_authenticated else None,
            )
            log_action(
                user=self.request.user,
                action="upload",
                model_name="MediaAsset",
                object_id=instance.pk,
                description=f"Uploaded media asset '{file.name}'",
                request=self.request
            )
        except Exception as exc:
            # Send operational notification email to active admin
            from core.services.notification_service import send_operational_notification
            send_operational_notification(
                user=self.request.user,
                title="Failed Media Upload / Processing",
                message=f"Upload failed for file '{file.name}'. Error: {exc}"
            )
            raise

    def perform_destroy(self, instance):
        name = instance.file_name
        pk = instance.pk
        if instance.file and os.path.exists(instance.file.path):
            try:
                os.remove(instance.file.path)
            except Exception as e:
                logger.warning(f"Failed to remove file from disk: {e}")

        instance.delete()
        log_action(
            user=self.request.user,
            action="delete",
            model_name="MediaAsset",
            object_id=pk,
            description=f"Deleted media asset '{name}'",
            request=self.request
        )

    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def replace(self, request, pk=None):
        asset = self.get_object()
        file = request.FILES.get("file")
        if not file:
            return Response({"error": "No file was provided."}, status=400)

        try:
            # Delete old file
            if asset.file and os.path.exists(asset.file.path):
                try:
                    os.remove(asset.file.path)
                except Exception as e:
                    logger.warning(f"Failed to delete old file: {e}")

            mime_type, _ = mimetypes.guess_type(file.name)
            mime_type = mime_type or "application/octet-stream"

            if mime_type.startswith("image/"):
                from core.services.image_service import validate_image_file
                media_type = MediaAsset.MEDIA_TYPE_IMAGE
                validate_image_file(file)
            elif mime_type.startswith("video/"):
                from core.models import validate_video_file
                media_type = MediaAsset.MEDIA_TYPE_VIDEO
                validate_video_file(file)
            else:
                media_type = MediaAsset.MEDIA_TYPE_DOCUMENT

            asset.file = file
            asset.file_name = file.name
            asset.mime_type = mime_type
            asset.media_type = media_type
            asset.file_size = file.size
            asset.save()

            log_action(
                user=request.user,
                action="upload",
                model_name="MediaAsset",
                object_id=asset.pk,
                description=f"Replaced media asset with file '{file.name}'",
                request=request
            )

            serializer = self.get_serializer(asset)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as exc:
            from core.services.notification_service import send_operational_notification
            send_operational_notification(
                user=request.user,
                title="Failed Media Replacement",
                message=f"Replacement failed for media asset #{asset.pk} with '{file.name}'. Error: {exc}"
            )
            raise

    @action(detail=False, methods=["get"])
    def stats(self, request):
        from django.db.models import Sum
        total_count = MediaAsset.objects.count()
        total_size = MediaAsset.objects.aggregate(total=Sum("file_size"))["total"] or 0

        # Find unused media
        unused_assets = []
        all_assets = MediaAsset.objects.all()
        from core.models import PropertyImage, PropertyVideo
        
        used_urls = list(PropertyImage.objects.exclude(image_url="").values_list("image_url", flat=True))
        used_uploads = list(PropertyImage.objects.exclude(image_upload="").values_list("image_upload", flat=True))
        used_optimized = list(PropertyImage.objects.exclude(image_optimized="").values_list("image_optimized", flat=True))
        used_videos = list(PropertyVideo.objects.exclude(video_url="").values_list("video_url", flat=True))
        used_video_uploads = list(PropertyVideo.objects.exclude(video_upload="").values_list("video_upload", flat=True))
        
        used_set = set(used_uploads + used_optimized + used_video_uploads)
        used_basenames = {os.path.basename(u) for u in used_set if u}
        used_urls_basenames = {os.path.basename(url) for url in used_urls + used_videos if url}

        for asset in all_assets:
            if not asset.file:
                unused_assets.append(asset.id)
                continue
            
            basename = os.path.basename(asset.file.name)
            is_used = (asset.file.name in used_set) or (basename in used_basenames) or (basename in used_urls_basenames)
            if not is_used:
                unused_assets.append(asset.id)

        unused_count = len(unused_assets)
        unused_size = MediaAsset.objects.filter(id__in=unused_assets).aggregate(total=Sum("file_size"))["total"] or 0

        types_breakdown = {}
        for mtype in [MediaAsset.MEDIA_TYPE_IMAGE, MediaAsset.MEDIA_TYPE_VIDEO, MediaAsset.MEDIA_TYPE_DOCUMENT]:
            count = MediaAsset.objects.filter(media_type=mtype).count()
            size = MediaAsset.objects.filter(media_type=mtype).aggregate(total=Sum("file_size"))["total"] or 0
            types_breakdown[mtype] = {"count": count, "size": size}

        return Response({
            "total_count": total_count,
            "total_size": total_size,
            "unused_count": unused_count,
            "unused_size": unused_size,
            "types_breakdown": types_breakdown,
        }, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Audit Log
# ---------------------------------------------------------------------------

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by("-timestamp")
    serializer_class = AuditLogSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get("user")
        action = self.request.query_params.get("action")
        search = self.request.query_params.get("search")
        date_from = self.request.query_params.get("date_from")
        date_to = self.request.query_params.get("date_to")

        if user_id:
            qs = qs.filter(user_id=user_id)
        if action:
            qs = qs.filter(action=action)
        if search:
            qs = qs.filter(
                Q(description__icontains=search) |
                Q(user__username__icontains=search) |
                Q(model_name__icontains=search)
            )
        if date_from:
            qs = qs.filter(timestamp__gte=date_from)
        if date_to:
            qs = qs.filter(timestamp__lte=date_to)
        return qs

    @action(detail=False, methods=["get"])
    def export_csv(self, request):
        import csv
        from django.http import HttpResponse

        queryset = self.filter_queryset(self.get_queryset())
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = 'attachment; filename="audit_log.csv"'

        writer = csv.writer(response)
        writer.writerow(["Timestamp", "User", "Action", "Model", "Object ID", "Description", "IP Address", "User Agent"])

        for log in queryset:
            username = log.user.username if log.user else "System"
            writer.writerow([
                log.timestamp.strftime("%Y-%m-%d %H:%M:%S") if log.timestamp else "",
                username,
                log.action,
                log.model_name,
                log.object_id,
                log.description,
                log.ip_address,
                log.user_agent,
            ])
        return response


# ---------------------------------------------------------------------------
# Dashboard Statistics
# ---------------------------------------------------------------------------

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        total_likes = Property.objects.aggregate(total=Sum("likes_count"))["total"] or 0

        stats = {
            "total_properties": Property.objects.filter(is_deleted=False).count(),
            "visible_properties": Property.objects.filter(is_deleted=False, is_visible=True).count(),
            "featured_properties": Property.objects.filter(is_deleted=False, featured=True).count(),
            "luxury_properties": Property.objects.filter(is_deleted=False, luxury=True).count(),
            "hidden_properties": Property.objects.filter(is_deleted=False, is_visible=False).count(),
            "sold_properties": Property.objects.filter(is_deleted=False, status="Sold").count(),
            "total_likes": total_likes,
            "property_enquiries": PropertyEnquiry.objects.filter(is_deleted=False).count(),
            "service_enquiries": ServiceEnquiry.objects.filter(is_deleted=False).count(),
            "contact_messages": ContactMessage.objects.filter(is_deleted=False).count(),
            "unread_notifications": AdminNotification.objects.filter(read=False).count(),
            "total_media_assets": MediaAsset.objects.count(),
        }

        serializer = DashboardStatsSerializer(stats)
        return Response(serializer.data)


# ---------------------------------------------------------------------------
# User Management (Admin Portal)
# ---------------------------------------------------------------------------

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = UserSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]

    def get_queryset(self):
        if self.request.user.is_superuser or self.request.user.is_staff:
            return User.objects.all().order_by("-date_joined")
        return User.objects.filter(id=self.request.user.id)

    @action(detail=False, methods=["get"])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def perform_create(self, serializer):
        instance = serializer.save()
        log_action(
            user=self.request.user,
            action="create",
            model_name="User",
            object_id=instance.pk,
            description=f"Created staff user '{instance.username}'",
            request=self.request
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        log_action(
            user=self.request.user,
            action="update",
            model_name="User",
            object_id=instance.pk,
            description=f"Updated user details/roles for '{instance.username}'",
            request=self.request
        )

    def perform_destroy(self, instance):
        username = instance.username
        pk = instance.pk
        instance.delete()
        log_action(
            user=self.request.user,
            action="delete",
            model_name="User",
            object_id=pk,
            description=f"Deleted user '{username}'",
            request=self.request
        )


# ---------------------------------------------------------------------------
# Group & Permission Management
# ---------------------------------------------------------------------------

class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all().order_by("name")
    serializer_class = GroupSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]
    pagination_class = None


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all().order_by("name")
    serializer_class = PermissionSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]
    pagination_class = None


# ---------------------------------------------------------------------------
# Property Images (Ordering & Operations)
# ---------------------------------------------------------------------------

class PropertyImageViewSet(viewsets.ModelViewSet):
    queryset = PropertyImage.objects.all().order_by("order")
    serializer_class = PropertyImageSerializer
    permission_classes = [DjangoModelPermissionsOrStaffExplicit]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            logger.error(f"Property image creation validation errors: {serializer.errors}")
            print("Property image creation validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        instance = serializer.save()
        from core.services.image_service import process_property_image
        try:
            process_property_image(instance)
            instance.save()
        except Exception as exc:
            from core.services.notification_service import send_operational_notification
            send_operational_notification(
                user=self.request.user,
                title="Property Image Optimization Failed",
                message=f"Failed to process and optimize image for property '{instance.property.title}'. Error: {exc}"
            )
            raise

    def perform_update(self, serializer):
        instance = serializer.save()
        log_action(
            user=self.request.user,
            action="update",
            model_name="PropertyImage",
            object_id=instance.pk,
            description=f"Updated image properties on property '{instance.property.title}'",
            request=self.request
        )

    def perform_destroy(self, instance):
        title = instance.property.title
        pk = instance.pk
        instance.delete()
        log_action(
            user=self.request.user,
            action="delete",
            model_name="PropertyImage",
            object_id=pk,
            description=f"Removed image from property '{title}'",
            request=self.request
        )

    @action(detail=True, methods=["post"])
    def set_primary(self, request, pk=None):
        instance = self.get_object()
        instance.is_primary = True
        instance.save()
        return Response({"status": "primary image set", "is_primary": True}, status=status.HTTP_200_OK)


class MetadataView(APIView):
    """
    Exposes database-driven choices for dropdowns.
    Updates immediately when property records change.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        active_properties = Property.objects.filter(is_deleted=False)
        statuses = ["For Sale", "For Rent", "Sold", "Under Offer", "Shortlet", "Archived"]
        cities = list(active_properties.exclude(city="").values_list("city", flat=True).distinct().order_by("city"))
        states = list(active_properties.exclude(state="").values_list("state", flat=True).distinct().order_by("state"))
        countries = list(active_properties.exclude(country="").values_list("country", flat=True).distinct().order_by("country"))
        locations = list(active_properties.exclude(location="").values_list("location", flat=True).distinct().order_by("location"))

        features = set()
        amenities = set()
        for p in active_properties:
            if isinstance(p.features, list):
                for f in p.features:
                    features.add(f)
            if isinstance(p.amenities, list):
                for a in p.amenities:
                    amenities.add(a)

        property_types = [{"id": pt.id, "name": pt.name, "slug": pt.slug} for pt in PropertyType.objects.filter(is_deleted=False)]
        service_types = [{"id": st.id, "title": st.title, "slug": st.slug} for st in ServiceType.objects.filter(is_deleted=False)]

        return Response({
            "statuses": statuses,
            "cities": cities,
            "states": states,
            "countries": countries,
            "locations": locations,
            "features": sorted(list(features)),
            "amenities": sorted(list(amenities)),
            "property_types": property_types,
            "service_types": service_types,
        }, status=status.HTTP_200_OK)

