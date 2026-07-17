from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.db import models
from django.utils.text import slugify


# ---------------------------------------------------------------------------
# Property Types
# ---------------------------------------------------------------------------

class PropertyType(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=150, unique=True, blank=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    # Audit timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_deleted"]),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while PropertyType.objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Service Types
# ---------------------------------------------------------------------------

class ServiceType(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=250, unique=True, blank=True)
    description = models.CharField(max_length=500)
    icon = models.CharField(max_length=50)  # Name of Lucide icon to use
    features = models.JSONField(default=list, blank=True)  # List of feature strings
    long_description = models.TextField(blank=True, null=True)
    process = models.JSONField(
        default=list, blank=True
    )  # List of {"title": str, "description": str}
    benefits = models.JSONField(default=list, blank=True)  # List of benefit strings
    is_deleted = models.BooleanField(default=False, db_index=True)

    # Audit timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_deleted"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while ServiceType.objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Properties
# ---------------------------------------------------------------------------

class Property(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    location = models.CharField(max_length=255)
    city = models.CharField(max_length=100, db_index=True)
    price = models.BigIntegerField(db_index=True)
    previous_price = models.BigIntegerField(blank=True, null=True)
    current_price = models.BigIntegerField(blank=True, null=True)
    bedrooms = models.PositiveIntegerField()
    bathrooms = models.PositiveIntegerField()
    sqft = models.PositiveIntegerField()
    status = models.CharField(
        max_length=50, db_index=True
    )  # For Sale, Shortlet, Sold, etc.
    property_type = models.ForeignKey(
        PropertyType, on_delete=models.PROTECT, related_name="properties"
    )
    featured = models.BooleanField(default=False)
    luxury = models.BooleanField(default=False)
    description = models.TextField()

    # Documentations
    building_approval = models.CharField(max_length=100, blank=True, null=True)
    survey = models.CharField(max_length=255, blank=True, null=True)
    document_title = models.CharField(max_length=255, blank=True, null=True)

    features = models.JSONField(default=list, blank=True)
    amenities = models.JSONField(default=list, blank=True)
    year_built = models.PositiveIntegerField(blank=True, null=True)
    parking = models.PositiveIntegerField(blank=True, null=True)
    video_tour = models.CharField(max_length=255, blank=True, null=True)

    # Coordinates for maps
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    # Location details
    state = models.CharField(max_length=100, blank=True, default="")
    country = models.CharField(max_length=100, blank=True, default="")

    # SEO Information
    seo_title = models.CharField(max_length=255, blank=True, default="")
    seo_description = models.TextField(blank=True, default="")
    seo_keywords = models.CharField(max_length=255, blank=True, default="")

    # Visibility and Soft Delete
    is_visible = models.BooleanField(default=True, db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    # Likes Counter (Denormalized to optimize read speed)
    likes_count = models.PositiveIntegerField(default=0)

    # Audit timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Properties"
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["city"]),
            models.Index(fields=["status"]),
            models.Index(fields=["price"]),
            models.Index(fields=["is_visible"]),
            models.Index(fields=["is_deleted"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Property.objects.filter(slug=slug).exclude(id=self.id).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Property Images
# ---------------------------------------------------------------------------

class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="images"
    )
    image_upload = models.ImageField(
        upload_to="property_images/original/",
        blank=True,
        null=True,
        help_text="Original uploaded image",
    )
    image_optimized = models.ImageField(
        upload_to="property_images/optimized/",
        blank=True,
        null=True,
        help_text="Optimized web version of the image",
    )
    image_thumbnail = models.ImageField(
        upload_to="property_images/thumbnails/",
        blank=True,
        null=True,
        help_text="Thumbnail size image",
    )
    image_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True,
        help_text="Fallback URL for external images",
    )
    order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "created_at"]

    def __str__(self):
        return f"Image for {self.property.title} (Order: {self.order})"

    def save(self, *args, **kwargs):
        # Auto calculate display order if not specified
        if self.order == 0:
            existing = PropertyImage.objects.filter(property=self.property)
            if existing.exists():
                self.order = existing.aggregate(models.Max("order"))["order__max"] + 1
            else:
                self.order = 1

        # Enforce single primary image per property
        if self.is_primary:
            PropertyImage.objects.filter(
                property=self.property, is_primary=True
            ).exclude(id=self.id).update(is_primary=False)
        else:
            # If this is the only image, make it primary
            if (
                not PropertyImage.objects.filter(
                    property=self.property, is_primary=True
                )
                .exclude(id=self.id)
                .exists()
            ):
                self.is_primary = True

        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Property Videos
# ---------------------------------------------------------------------------

def validate_video_file(file):
    """Validates uploaded video: size and magic bytes."""
    from django.conf import settings

    max_size = getattr(settings, "MABEL_MAX_VIDEO_SIZE", 100 * 1024 * 1024)  # 100MB
    if file.size > max_size:
        raise ValidationError(
            f"Video file size exceeds limit of {max_size / (1024*1024):.0f}MB."
        )

    # Check magic bytes for MP4 / WebM / MOV
    file.seek(0)
    header = file.read(12)
    file.seek(0)

    # MP4 / MOV: ftyp box (bytes 4-8 = 'ftyp')
    is_mp4_mov = len(header) >= 8 and header[4:8] in (
        b"ftyp", b"moov", b"mdat", b"wide", b"skip",
    )
    # WebM: starts with 0x1A45DFA3
    is_webm = header[:4] == b"\x1a\x45\xdf\xa3"

    if not (is_mp4_mov or is_webm):
        raise ValidationError(
            "Unsupported video format. Only MP4, WebM, and MOV files are allowed."
        )


class PropertyVideo(models.Model):
    """
    Stores uploaded videos or external video URLs (YouTube/Vimeo) for a property.
    Videos are displayed in the gallery alongside images according to their order.
    """

    VIDEO_TYPE_UPLOAD = "upload"
    VIDEO_TYPE_YOUTUBE = "youtube"
    VIDEO_TYPE_VIMEO = "vimeo"
    VIDEO_TYPE_EXTERNAL = "external"

    VIDEO_TYPE_CHOICES = [
        (VIDEO_TYPE_UPLOAD, "Uploaded File"),
        (VIDEO_TYPE_YOUTUBE, "YouTube"),
        (VIDEO_TYPE_VIMEO, "Vimeo"),
        (VIDEO_TYPE_EXTERNAL, "External URL"),
    ]

    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="videos"
    )
    video_upload = models.FileField(
        upload_to="property_videos/",
        blank=True,
        null=True,
        help_text="Uploaded video file (MP4, WebM, MOV)",
        validators=[validate_video_file],
    )
    video_url = models.URLField(
        max_length=1000,
        blank=True,
        null=True,
        help_text="YouTube, Vimeo, or other external video URL",
    )
    video_type = models.CharField(
        max_length=20,
        choices=VIDEO_TYPE_CHOICES,
        default=VIDEO_TYPE_UPLOAD,
        db_index=True,
    )
    title = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "created_at"]

    def __str__(self):
        return f"Video for {self.property.title} (Order: {self.order})"

    def get_embed_url(self):
        """Converts YouTube/Vimeo watch URLs to embed URLs."""
        if not self.video_url:
            return None

        url = self.video_url

        # YouTube: convert watch?v= or youtu.be/ to embed URL
        if self.video_type == self.VIDEO_TYPE_YOUTUBE:
            video_id = None
            if "youtu.be/" in url:
                video_id = url.split("youtu.be/")[-1].split("?")[0]
            elif "v=" in url:
                video_id = url.split("v=")[-1].split("&")[0]
            if video_id:
                return f"https://www.youtube.com/embed/{video_id}"

        # Vimeo: convert to embed URL
        if self.video_type == self.VIDEO_TYPE_VIMEO:
            parts = url.rstrip("/").split("/")
            video_id = parts[-1] if parts else None
            if video_id and video_id.isdigit():
                return f"https://player.vimeo.com/video/{video_id}"

        return url

    def clean(self):
        if not self.video_upload and not self.video_url:
            raise ValidationError("Either a video file or a video URL must be provided.")
        if self.video_upload and self.video_url:
            raise ValidationError("Provide either a video file or a URL, not both.")

    def save(self, *args, **kwargs):
        # Auto-detect video type from URL
        if self.video_url:
            url_lower = self.video_url.lower()
            if "youtube.com" in url_lower or "youtu.be" in url_lower:
                self.video_type = self.VIDEO_TYPE_YOUTUBE
            elif "vimeo.com" in url_lower:
                self.video_type = self.VIDEO_TYPE_VIMEO
            else:
                self.video_type = self.VIDEO_TYPE_EXTERNAL
        else:
            self.video_type = self.VIDEO_TYPE_UPLOAD

        # Auto-set order
        if self.order == 0:
            existing = PropertyVideo.objects.filter(property=self.property)
            if existing.exists():
                self.order = existing.aggregate(models.Max("order"))["order__max"] + 1
            else:
                self.order = 1

        # Enforce single primary video
        if self.is_primary:
            PropertyVideo.objects.filter(
                property=self.property, is_primary=True
            ).exclude(id=self.id).update(is_primary=False)

        super().save(*args, **kwargs)


# ---------------------------------------------------------------------------
# Property Likes
# ---------------------------------------------------------------------------

class PropertyLike(models.Model):
    property = models.ForeignKey(
        Property, on_delete=models.CASCADE, related_name="likes"
    )
    session_key = models.CharField(max_length=40, db_index=True, blank=True, null=True)
    ip_address = models.GenericIPAddressField(db_index=True, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            # Prevent spam likes from the same session/visitor on a property
            models.UniqueConstraint(
                fields=["property", "session_key"],
                name="unique_property_session_like",
                condition=models.Q(session_key__isnull=False),
            ),
        ]

    def __str__(self):
        return f"Like on {self.property.title}"


# ---------------------------------------------------------------------------
# Media Asset Library
# ---------------------------------------------------------------------------

class MediaAsset(models.Model):
    """
    Central media library. Images and videos can be reused across properties
    without re-uploading the same file.
    """

    MEDIA_TYPE_IMAGE = "image"
    MEDIA_TYPE_VIDEO = "video"
    MEDIA_TYPE_DOCUMENT = "document"

    MEDIA_TYPE_CHOICES = [
        (MEDIA_TYPE_IMAGE, "Image"),
        (MEDIA_TYPE_VIDEO, "Video"),
        (MEDIA_TYPE_DOCUMENT, "Document"),
    ]

    file = models.FileField(upload_to="media_library/")
    file_name = models.CharField(max_length=255)
    media_type = models.CharField(
        max_length=20, choices=MEDIA_TYPE_CHOICES, db_index=True
    )
    mime_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveIntegerField(default=0, help_text="File size in bytes")
    alt_text = models.CharField(max_length=255, blank=True)
    folder = models.CharField(
        max_length=100, blank=True, default="", help_text="Optional folder/category name"
    )
    uploaded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Media Asset"
        verbose_name_plural = "Media Assets"

    def __str__(self):
        return self.file_name


# ---------------------------------------------------------------------------
# Abstract Enquiry Base
# ---------------------------------------------------------------------------

class AbstractEnquiry(models.Model):
    """
    Shared base for all enquiry types: PropertyEnquiry, ServiceEnquiry, ContactMessage.
    Provides consistent fields, reply tracking, and soft-delete support.
    """

    STATUS_PENDING = "Pending"
    STATUS_RESPONDED = "Responded"
    STATUS_CLOSED = "Closed"

    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_RESPONDED, "Responded"),
        (STATUS_CLOSED, "Closed"),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50)
    message = models.TextField()
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        db_index=True,
    )
    replied = models.BooleanField(default=False, db_index=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    # Response tracking
    responded_at = models.DateTimeField(blank=True, null=True)
    responded_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="%(class)s_responses"
    )

    # Audit timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ["-created_at"]


# ---------------------------------------------------------------------------
# Property Enquiries
# ---------------------------------------------------------------------------

class PropertyEnquiry(AbstractEnquiry):
    property = models.ForeignKey(
        Property,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="enquiries",
    )
    property_title = models.CharField(
        max_length=255
    )  # Historical copy in case Property gets deleted/modified

    class Meta(AbstractEnquiry.Meta):
        verbose_name_plural = "Property Enquiries"

    def __str__(self):
        return f"Enquiry from {self.name} on {self.property_title}"


# ---------------------------------------------------------------------------
# Service Enquiries
# ---------------------------------------------------------------------------

class ServiceEnquiry(AbstractEnquiry):
    service_type = models.ForeignKey(
        ServiceType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="enquiries",
    )
    service_title = models.CharField(
        max_length=255
    )  # Historical copy in case ServiceType gets deleted

    class Meta(AbstractEnquiry.Meta):
        verbose_name_plural = "Service Enquiries"

    def __str__(self):
        return f"Enquiry from {self.name} for {self.service_title}"


# ---------------------------------------------------------------------------
# Contact Messages
# ---------------------------------------------------------------------------

class ContactMessage(AbstractEnquiry):
    """
    General contact form submissions not tied to a specific property or service.
    """

    subject = models.CharField(max_length=255, blank=True)

    class Meta(AbstractEnquiry.Meta):
        verbose_name = "Contact Message"
        verbose_name_plural = "Contact Messages"

    def __str__(self):
        return f"Contact from {self.name}: {self.subject or self.message[:50]}"


# ---------------------------------------------------------------------------
# Enquiry Replies
# ---------------------------------------------------------------------------

class EnquiryReply(models.Model):
    """
    Records a reply sent by an administrator to any type of enquiry.
    Uses GenericForeignKey so it works with PropertyEnquiry, ServiceEnquiry,
    and ContactMessage without needing separate tables.
    """

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    enquiry = GenericForeignKey("content_type", "object_id")

    sender = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="replies_sent"
    )
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    email_delivered = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-sent_at"]
        verbose_name = "Enquiry Reply"
        verbose_name_plural = "Enquiry Replies"

    def __str__(self):
        return f"Reply to {self.recipient_email} at {self.sent_at:%Y-%m-%d %H:%M}"


# ---------------------------------------------------------------------------
# Admin Notifications
# ---------------------------------------------------------------------------

class AdminNotification(models.Model):
    NOTIFICATION_PROPERTY_ENQUIRY = "property_enquiry"
    NOTIFICATION_SERVICE_ENQUIRY = "service_enquiry"
    NOTIFICATION_CONTACT = "contact"
    NOTIFICATION_LIKE = "like"
    NOTIFICATION_SYSTEM = "system"

    NOTIFICATION_TYPE_CHOICES = [
        (NOTIFICATION_PROPERTY_ENQUIRY, "Property Enquiry"),
        (NOTIFICATION_SERVICE_ENQUIRY, "Service Enquiry"),
        (NOTIFICATION_CONTACT, "Contact Message"),
        (NOTIFICATION_LIKE, "Property Like"),
        (NOTIFICATION_SYSTEM, "System"),
    ]

    title = models.CharField(max_length=255)
    message = models.TextField()
    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPE_CHOICES,
        default=NOTIFICATION_SYSTEM,
        db_index=True,
    )
    read = models.BooleanField(default=False, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title




# ---------------------------------------------------------------------------
# Audit Log
# ---------------------------------------------------------------------------

class AuditLog(models.Model):
    """
    Records all significant administrative actions for accountability.
    """

    ACTION_LOGIN = "login"
    ACTION_LOGOUT = "logout"
    ACTION_CREATE = "create"
    ACTION_UPDATE = "update"
    ACTION_DELETE = "delete"
    ACTION_REPLY = "reply"
    ACTION_UPLOAD = "upload"
    ACTION_SETTINGS = "settings"
    ACTION_OTHER = "other"

    ACTION_CHOICES = [
        (ACTION_LOGIN, "Login"),
        (ACTION_LOGOUT, "Logout"),
        (ACTION_CREATE, "Create"),
        (ACTION_UPDATE, "Update"),
        (ACTION_DELETE, "Delete"),
        (ACTION_REPLY, "Reply"),
        (ACTION_UPLOAD, "Upload"),
        (ACTION_SETTINGS, "Settings Change"),
        (ACTION_OTHER, "Other"),
    ]

    user = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs"
    )
    action = models.CharField(max_length=20, choices=ACTION_CHOICES, db_index=True)
    model_name = models.CharField(max_length=100, blank=True)
    object_id = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=500, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"

    def __str__(self):
        user_str = self.user.username if self.user else "Anonymous"
        return f"[{self.action.upper()}] {user_str} — {self.description[:80]}"


# ---------------------------------------------------------------------------
# User Profile (Profile Photos)
# ---------------------------------------------------------------------------

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="avatars/", blank=True, null=True)

    def __str__(self):
        return f"Profile of {self.user.username}"
