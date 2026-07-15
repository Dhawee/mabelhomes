import os

from django.contrib.auth.models import User, Group, Permission
from rest_framework import serializers

from core.models import (AdminNotification, AuditLog, ContactMessage,
                         EnquiryReply, MediaAsset, Property, PropertyEnquiry,
                         PropertyImage, PropertyType, PropertyVideo,
                         ServiceEnquiry, ServiceType, UserProfile)

# Base URL used when serializing without a request context (e.g. Next.js SSR fetch)
_SITE_URL = os.getenv("SITE_URL", "").rstrip("/")


def _build_url(request, url: str) -> str:
    """Build an absolute URL from a relative path. Uses request if available, else SITE_URL env."""
    if not url:
        return url
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if request:
        return request.build_absolute_uri(url)
    if _SITE_URL:
        return f"{_SITE_URL}{url}"
    return url


# ---------------------------------------------------------------------------
# Property Types & Service Types
# ---------------------------------------------------------------------------

class PropertyTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyType
        fields = ["id", "name", "slug", "created_at", "updated_at"]


class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = [
            "id",
            "title",
            "slug",
            "description",
            "icon",
            "features",
            "long_description",
            "process",
            "benefits",
        ]


# ---------------------------------------------------------------------------
# Property Images
# ---------------------------------------------------------------------------

class PropertyImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    original = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ["id", "property", "image_upload", "image", "thumbnail", "original", "order", "is_primary"]

    def get_image(self, obj):
        request = self.context.get("request")
        if obj.image_optimized:
            return _build_url(request, obj.image_optimized.url)
        if obj.image_upload:
            return _build_url(request, obj.image_upload.url)
        return obj.image_url

    def get_thumbnail(self, obj):
        request = self.context.get("request")
        if obj.image_thumbnail:
            return _build_url(request, obj.image_thumbnail.url)
        return self.get_image(obj)

    def get_original(self, obj):
        request = self.context.get("request")
        if obj.image_upload:
            return _build_url(request, obj.image_upload.url)
        return obj.image_url


# ---------------------------------------------------------------------------
# Property Videos
# ---------------------------------------------------------------------------

class PropertyVideoSerializer(serializers.ModelSerializer):
    video_src = serializers.SerializerMethodField()
    embed_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyVideo
        fields = [
            "id",
            "property",
            "video_upload",
            "video_type",
            "video_src",
            "video_url",
            "embed_url",
            "title",
            "order",
            "is_primary",
            "created_at",
        ]

    def get_video_src(self, obj):
        """Returns absolute URL for uploaded video files."""
        if obj.video_upload:
            request = self.context.get("request")
            return _build_url(request, obj.video_upload.url)
        return obj.video_url

    def get_embed_url(self, obj):
        """Converts YouTube/Vimeo watch URLs to embed URLs using model helper."""
        return obj.get_embed_url()


# ---------------------------------------------------------------------------
# Property (main)
# ---------------------------------------------------------------------------

class PropertySerializer(serializers.ModelSerializer):
    type = serializers.CharField(source="property_type.name", read_only=True)
    type_slug = serializers.CharField(source="property_type.slug", read_only=True)
    images = serializers.SerializerMethodField()
    images_details = PropertyImageSerializer(source="images", many=True, read_only=True)
    videos = serializers.SerializerMethodField()
    coordinates = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            "id",
            "slug",
            "title",
            "location",
            "city",
            "state",
            "country",
            "price",
            "previous_price",
            "current_price",
            "bedrooms",
            "bathrooms",
            "sqft",
            "status",
            "type",
            "type_slug",
            "is_visible",
            "is_deleted",
            "property_type",
            "featured",
            "luxury",
            "primary_image",
            "images",
            "images_details",
            "videos",
            "description",
            "building_approval",
            "survey",
            "document_title",
            "features",
            "amenities",
            "year_built",
            "parking",
            "video_tour",
            "latitude",
            "longitude",
            "coordinates",
            "likes_count",
            "seo_title",
            "seo_description",
            "seo_keywords",
            "created_at",
            "updated_at",
        ]

    def get_primary_image(self, obj):
        """Returns the primary image URL for card/thumbnail display."""
        request = self.context.get("request")
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary:
            if primary.image_optimized:
                return _build_url(request, primary.image_optimized.url)
            elif primary.image_upload:
                return _build_url(request, primary.image_upload.url)
            else:
                return primary.image_url
        return None

    def get_images(self, obj):
        """Returns all image URLs in order (primary first)."""
        request = self.context.get("request")
        images = obj.images.all().order_by("-is_primary", "order", "created_at")
        urls = []
        for img in images:
            if img.image_optimized:
                url = _build_url(request, img.image_optimized.url)
            elif img.image_upload:
                url = _build_url(request, img.image_upload.url)
            else:
                url = img.image_url
            if url:
                urls.append(url)
        return urls

    def get_videos(self, obj):
        """Returns all videos for this property ordered by display order."""
        request = self.context.get("request")
        videos = obj.videos.all().order_by("order", "created_at")
        return PropertyVideoSerializer(
            videos, many=True, context={"request": request}
        ).data

    def get_coordinates(self, obj):
        return {"lat": float(obj.latitude), "lng": float(obj.longitude)}


# ---------------------------------------------------------------------------
# Enquiries
# ---------------------------------------------------------------------------

class PropertyEnquirySerializer(serializers.ModelSerializer):
    responded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = PropertyEnquiry
        fields = [
            "id",
            "property",
            "property_title",
            "name",
            "email",
            "phone",
            "message",
            "status",
            "replied",
            "responded_at",
            "responded_by",
            "responded_by_name",
            "created_at",
        ]
        read_only_fields = ["property_title", "status", "replied", "responded_at", "responded_by", "responded_by_name", "created_at"]

    def get_responded_by_name(self, obj):
        if obj.responded_by:
            return obj.responded_by.get_full_name() or obj.responded_by.username
        return None


class ServiceEnquirySerializer(serializers.ModelSerializer):
    responded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ServiceEnquiry
        fields = [
            "id",
            "service_type",
            "service_title",
            "name",
            "email",
            "phone",
            "message",
            "status",
            "replied",
            "responded_at",
            "responded_by",
            "responded_by_name",
            "created_at",
        ]
        read_only_fields = ["service_title", "status", "replied", "responded_at", "responded_by", "responded_by_name", "created_at"]

    def get_responded_by_name(self, obj):
        if obj.responded_by:
            return obj.responded_by.get_full_name() or obj.responded_by.username
        return None


class ContactMessageSerializer(serializers.ModelSerializer):
    responded_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ContactMessage
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "subject",
            "message",
            "status",
            "replied",
            "responded_at",
            "responded_by",
            "responded_by_name",
            "created_at",
        ]
        read_only_fields = ["status", "replied", "responded_at", "responded_by", "responded_by_name", "created_at"]

    def get_responded_by_name(self, obj):
        if obj.responded_by:
            return obj.responded_by.get_full_name() or obj.responded_by.username
        return None


# ---------------------------------------------------------------------------
# Enquiry Replies
# ---------------------------------------------------------------------------

class EnquiryReplySerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    content_type_name = serializers.SerializerMethodField()

    class Meta:
        model = EnquiryReply
        fields = [
            "id",
            "content_type",
            "object_id",
            "content_type_name",
            "sender",
            "sender_name",
            "recipient_email",
            "subject",
            "message",
            "email_delivered",
            "sent_at",
        ]
        read_only_fields = ["sender", "email_delivered", "sent_at"]

    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.get_full_name() or obj.sender.username
        return "Mabel Homes Team"

    def get_content_type_name(self, obj):
        return obj.content_type.model if obj.content_type else ""


# ---------------------------------------------------------------------------
# Admin Notifications
# ---------------------------------------------------------------------------

class AdminNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminNotification
        fields = ["id", "title", "message", "notification_type", "read", "created_at"]
        read_only_fields = ["created_at"]


# ---------------------------------------------------------------------------
# Media Assets
# ---------------------------------------------------------------------------

class MediaAssetSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploaded_by_name = serializers.SerializerMethodField()
    usage = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = [
            "id",
            "file_url",
            "file_name",
            "media_type",
            "mime_type",
            "file_size",
            "alt_text",
            "folder",
            "uploaded_by",
            "uploaded_by_name",
            "usage",
            "created_at",
        ]
        read_only_fields = ["file_name", "media_type", "mime_type", "file_size", "created_at"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file:
            return (
                request.build_absolute_uri(obj.file.url)
                if request
                else obj.file.url
            )
        return None

    def get_uploaded_by_name(self, obj):
        if obj.uploaded_by:
            return obj.uploaded_by.get_full_name() or obj.uploaded_by.username
        return "Unknown"

    def get_usage(self, obj):
        import os
        from django.db import models
        from core.models import PropertyImage, PropertyVideo

        filename = os.path.basename(obj.file.name) if obj.file else ""
        file_url = obj.file.url if obj.file else ""

        properties = []

        # Check PropertyImages
        image_props = PropertyImage.objects.filter(
            models.Q(image_url=file_url) |
            models.Q(image_upload__icontains=filename) |
            models.Q(image_optimized__icontains=filename)
        ).select_related("property")
        for img in image_props:
            if img.property and img.property.title not in properties:
                properties.append(img.property.title)

        # Check PropertyVideos
        video_props = PropertyVideo.objects.filter(
            models.Q(video_url=file_url) |
            models.Q(video_upload__icontains=filename)
        ).select_related("property")
        for vid in video_props:
            if vid.property and vid.property.title not in properties:
                properties.append(vid.property.title)

        return properties




# ---------------------------------------------------------------------------
# Audit Log
# ---------------------------------------------------------------------------

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "username",
            "action",
            "model_name",
            "object_id",
            "description",
            "ip_address",
            "timestamp",
        ]
        read_only_fields = ["timestamp"]

    def get_username(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.username
        return "System"


# ---------------------------------------------------------------------------
# Dashboard Stats
# ---------------------------------------------------------------------------

class DashboardStatsSerializer(serializers.Serializer):
    total_properties = serializers.IntegerField()
    visible_properties = serializers.IntegerField()
    featured_properties = serializers.IntegerField()
    luxury_properties = serializers.IntegerField()
    hidden_properties = serializers.IntegerField()
    sold_properties = serializers.IntegerField()
    total_likes = serializers.IntegerField()
    property_enquiries = serializers.IntegerField()
    service_enquiries = serializers.IntegerField()
    contact_messages = serializers.IntegerField()
    unread_notifications = serializers.IntegerField()
    total_media_assets = serializers.IntegerField()


# ---------------------------------------------------------------------------
# User (for portal user management)
# ---------------------------------------------------------------------------

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["id", "name"]


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ["id", "name", "codename"]


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False)
    avatar = serializers.SerializerMethodField()
    avatar_upload = serializers.ImageField(write_only=True, required=False, allow_null=True)
    groups = serializers.PrimaryKeyRelatedField(many=True, queryset=Group.objects.all(), required=False)
    user_permissions = serializers.PrimaryKeyRelatedField(many=True, queryset=Permission.objects.all(), required=False)
    groups_names = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "is_staff",
            "is_superuser",
            "is_active",
            "password",
            "last_login",
            "date_joined",
            "avatar",
            "avatar_upload",
            "groups",
            "groups_names",
            "user_permissions",
            "permissions",
        ]
        read_only_fields = ["last_login", "date_joined", "avatar", "groups_names", "permissions"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username

    def get_groups_names(self, obj):
        return [g.name for g in obj.groups.all()]

    def get_permissions(self, obj):
        if obj.is_superuser:
            return ["*"]
        perms = set()
        for p in obj.user_permissions.all():
            perms.add(f"{p.content_type.app_label}.{p.codename}")
        for g in obj.groups.all():
            for p in g.permissions.all():
                perms.add(f"{p.content_type.app_label}.{p.codename}")
        return list(perms)

    def get_avatar(self, obj):
        request = self.context.get("request")
        profile, _ = UserProfile.objects.get_or_create(user=obj)
        if profile.avatar:
            return request.build_absolute_uri(profile.avatar.url) if request else profile.avatar.url
        return None

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        avatar_file = validated_data.pop("avatar_upload", None)
        groups = validated_data.pop("groups", [])
        permissions = validated_data.pop("user_permissions", [])

        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()

        if avatar_file:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.avatar = avatar_file
            profile.save()

        if groups:
            user.groups.set(groups)
        if permissions:
            user.user_permissions.set(permissions)

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        avatar_file = validated_data.pop("avatar_upload", None)
        groups = validated_data.pop("groups", None)
        permissions = validated_data.pop("user_permissions", None)

        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()

        if avatar_file is not None:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.avatar = avatar_file
            profile.save()

        if groups is not None:
            user.groups.set(groups)
        if permissions is not None:
            user.user_permissions.set(permissions)

        return user
