from django import forms
from django.contrib import admin, messages
from django.contrib.admin import AdminSite
from django.contrib.contenttypes.models import ContentType
from django.db.models import Sum
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import get_object_or_404, render
from django.template.loader import render_to_string
from django.urls import path
from django.utils import timezone
from django.utils.html import format_html

from core.models import (AdminNotification, AuditLog, ContactMessage,
                         EnquiryReply, MediaAsset, Property, PropertyEnquiry,
                         PropertyImage, PropertyType, PropertyVideo,
                         ServiceEnquiry, ServiceType)
from core.services.enquiry_service import send_enquiry_reply
from core.services.image_service import process_property_image
from core.services.report_service import (generate_csv_string,
                                          generate_pdf_bytes, generate_xlsx_bytes)
from core.widgets import MapPickerWidget


# ---------------------------------------------------------------------------
# Custom Branded Admin Site
# ---------------------------------------------------------------------------

class MabelHomesAdminSite(AdminSite):
    site_header = "Mabel Homes Administration"
    site_title = "Mabel Homes Admin"
    index_title = "Welcome to Mabel Homes Backend Portal"

    def get_app_list(self, request, app_label=None):
        app_list = super().get_app_list(request, app_label)
        return app_list

    def index(self, request, extra_context=None):
        """Custom dashboard index with live statistics."""
        from django.db.models import Count

        total_likes = Property.objects.aggregate(t=Sum("likes_count"))["t"] or 0

        extra_context = extra_context or {}
        extra_context.update(
            {
                "site_header": self.site_header,
                "stats": {
                    "total_properties": Property.objects.filter(is_deleted=False).count(),
                    "visible_properties": Property.objects.filter(
                        is_deleted=False, is_visible=True
                    ).count(),
                    "featured_properties": Property.objects.filter(
                        is_deleted=False, featured=True
                    ).count(),
                    "sold_properties": Property.objects.filter(
                        is_deleted=False, status="Sold"
                    ).count(),
                    "hidden_properties": Property.objects.filter(
                        is_deleted=False, is_visible=False
                    ).count(),
                    "total_likes": total_likes,
                    "property_enquiries": PropertyEnquiry.objects.filter(
                        is_deleted=False
                    ).count(),
                    "service_enquiries": ServiceEnquiry.objects.filter(
                        is_deleted=False
                    ).count(),
                    "contact_messages": ContactMessage.objects.filter(
                        is_deleted=False
                    ).count(),
                    "unread_notifications": AdminNotification.objects.filter(
                        read=False
                    ).count(),
                },
                "recent_property_enquiries": PropertyEnquiry.objects.filter(
                    is_deleted=False
                ).order_by("-created_at")[:5],
                "recent_service_enquiries": ServiceEnquiry.objects.filter(
                    is_deleted=False
                ).order_by("-created_at")[:5],
                "recent_contact_messages": ContactMessage.objects.filter(
                    is_deleted=False
                ).order_by("-created_at")[:3],
                "recent_notifications": AdminNotification.objects.filter(
                    read=False
                ).order_by("-created_at")[:5],
                "recent_properties": Property.objects.filter(is_deleted=False)
                .order_by("-created_at")
                .select_related("property_type")[:5],
            }
        )
        return super().index(request, extra_context)


# Use our branded admin site
admin.site.__class__ = MabelHomesAdminSite
admin.site.site_header = "Mabel Homes Administration"
admin.site.site_title = "Mabel Homes Admin"
admin.site.index_title = "Backend Portal"


# ---------------------------------------------------------------------------
# Property Admin Form (with Leaflet map)
# ---------------------------------------------------------------------------

class PropertyAdminForm(forms.ModelForm):
    class Meta:
        model = Property
        fields = "__all__"
        widgets = {
            "latitude": MapPickerWidget(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make longitude field hidden — it's updated by the map widget JS
        self.fields["longitude"].widget = forms.HiddenInput()
        self.fields["longitude"].required = True


# ---------------------------------------------------------------------------
# Inline: Property Images
# ---------------------------------------------------------------------------

class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ("image_upload", "image_url", "order", "is_primary", "image_preview")
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        if obj.id:
            if obj.image_thumbnail:
                url = obj.image_thumbnail.url
            elif obj.image_optimized:
                url = obj.image_optimized.url
            elif obj.image_upload:
                url = obj.image_upload.url
            else:
                url = obj.image_url
            if url:
                return format_html(
                    '<img src="{}" width="100" height="75" '
                    'style="object-fit: cover; border-radius: 4px;" />',
                    url,
                )
        return "Save to preview"

    image_preview.short_description = "Preview"


# ---------------------------------------------------------------------------
# Inline: Property Videos
# ---------------------------------------------------------------------------

class PropertyVideoInline(admin.TabularInline):
    model = PropertyVideo
    extra = 1
    fields = ("video_upload", "video_url", "title", "order", "is_primary", "video_type", "video_preview")
    readonly_fields = ("video_type", "video_preview")

    def video_preview(self, obj):
        if not obj.id:
            return "Save to preview"
        if obj.video_upload:
            return format_html(
                '<video width="120" height="90" controls style="border-radius: 4px;">'
                '<source src="{}" />'
                "Your browser doesn't support video."
                "</video>",
                obj.video_upload.url,
            )
        if obj.video_url:
            return format_html(
                '<a href="{}" target="_blank" style="color:#417690;">🔗 View Video</a>',
                obj.video_url,
            )
        return "No video"

    video_preview.short_description = "Preview"


# ---------------------------------------------------------------------------
# Inline: Enquiry Replies
# ---------------------------------------------------------------------------

class EnquiryReplyInline(admin.TabularInline):
    model = EnquiryReply
    ct_field = "content_type"
    ct_fk_field = "object_id"
    fields = ("sender", "recipient_email", "subject", "message", "email_delivered", "sent_at")
    readonly_fields = ("sender", "recipient_email", "subject", "message", "email_delivered", "sent_at")
    extra = 0
    can_delete = False
    verbose_name = "Sent Reply"
    verbose_name_plural = "Reply History"


# ---------------------------------------------------------------------------
# Property Type Admin
# ---------------------------------------------------------------------------

@admin.register(PropertyType)
class PropertyTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "property_count", "is_deleted", "created_at")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

    def property_count(self, obj):
        count = obj.properties.filter(is_deleted=False).count()
        return format_html(
            '<span style="font-weight: bold; color: #417690;">{}</span>', count
        )

    property_count.short_description = "Properties"


# ---------------------------------------------------------------------------
# Service Type Admin
# ---------------------------------------------------------------------------

@admin.register(ServiceType)
class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "is_deleted", "created_at")
    search_fields = ("title",)
    prepopulated_fields = {"slug": ("title",)}


# ---------------------------------------------------------------------------
# Property Admin
# ---------------------------------------------------------------------------

@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    form = PropertyAdminForm
    list_display = (
        "thumbnail_preview",
        "title",
        "property_type",
        "price_display",
        "status",
        "city",
        "is_visible",
        "featured",
        "luxury",
        "likes_count",
    )
    list_display_links = ("thumbnail_preview", "title")
    list_filter = ("property_type", "status", "is_visible", "featured", "luxury", "is_deleted", "city")
    search_fields = ("title", "location", "city", "description")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [PropertyImageInline, PropertyVideoInline]
    list_per_page = 25

    actions = [
        "toggle_visibility_on",
        "toggle_visibility_off",
        "mark_featured",
        "unmark_featured",
        "soft_delete",
        "restore",
    ]

    fieldsets = (
        (
            "Basic Information",
            {
                "fields": (
                    "title",
                    "slug",
                    "property_type",
                    "status",
                    "currency",
                    "price",
                    "max_price",
                    "previous_price",
                    "current_price",
                )
            },
        ),
        (
            "Specifications & Metrics",
            {
                "fields": (
                    "bedrooms",
                    "bathrooms",
                    "sqft",
                    "year_built",
                    "parking",
                )
            },
        ),
        (
            "Location & Map",
            {
                "description": "Use the map below to select the property location. "
                "Click on the map or drag the marker to set coordinates.",
                "fields": ("location", "city", "latitude", "longitude"),
            },
        ),
        (
            "Description & Content",
            {"fields": ("description", "features", "amenities", "video_tour")},
        ),
        (
            "Property Documentation",
            {
                "classes": ("collapse",),
                "fields": ("building_approval", "survey", "document_title"),
            },
        ),
        (
            "Visibility & Flags",
            {
                "fields": ("is_visible", "featured", "luxury"),
            },
        ),
        (
            "Admin Controls",
            {
                "classes": ("collapse",),
                "fields": ("is_deleted", "likes_count"),
            },
        ),
    )

    def price_display(self, obj):
        symbol = "$" if obj.currency == "USD" else "₦"
        price_str = f"{symbol}{obj.price:,.0f}"
        if obj.max_price:
            price_str += f" – {symbol}{obj.max_price:,.0f}"
        return price_str

    price_display.short_description = "Price"

    def thumbnail_preview(self, obj):
        primary = obj.images.filter(is_primary=True).first() or obj.images.first()
        if primary:
            if primary.image_thumbnail:
                url = primary.image_thumbnail.url
            elif primary.image_optimized:
                url = primary.image_optimized.url
            elif primary.image_upload:
                url = primary.image_upload.url
            else:
                url = primary.image_url
            if url:
                return format_html(
                    '<img src="{}" width="60" height="45" '
                    'style="object-fit: cover; border-radius: 4px;" />',
                    url,
                )
        return "No Image"

    thumbnail_preview.short_description = "Photo"

    def save_formset(self, request, form, formset, change):
        """Executes optimization processes on uploaded inline images."""
        instances = formset.save(commit=False)
        for instance in instances:
            if isinstance(instance, PropertyImage):
                process_property_image(instance)
            instance.save()
        formset.save_m2m()

    # Bulk Actions
    def toggle_visibility_on(self, request, queryset):
        queryset.update(is_visible=True)
        self.message_user(request, "Selected properties made visible on frontend.")

    toggle_visibility_on.short_description = "✅ Make Visible"

    def toggle_visibility_off(self, request, queryset):
        queryset.update(is_visible=False)
        self.message_user(request, "Selected properties hidden from frontend.")

    toggle_visibility_off.short_description = "🙈 Hide from Frontend"

    def mark_featured(self, request, queryset):
        queryset.update(featured=True)
        self.message_user(request, "Selected properties marked as Featured.")

    mark_featured.short_description = "⭐ Mark as Featured"

    def unmark_featured(self, request, queryset):
        queryset.update(featured=False)
        self.message_user(request, "Selected properties removed from Featured.")

    unmark_featured.short_description = "Remove Featured"

    def soft_delete(self, request, queryset):
        queryset.update(is_deleted=True, is_visible=False)
        self.message_user(request, "Selected properties archived (soft-deleted).")

    soft_delete.short_description = "🗑️ Archive (Soft Delete)"

    def restore(self, request, queryset):
        queryset.update(is_deleted=False, is_visible=True)
        self.message_user(request, "Selected properties restored to active.")

    restore.short_description = "♻️ Restore"


# ---------------------------------------------------------------------------
# Common Base Admin Mixin for Enquiry Print, Export, and Reply
# ---------------------------------------------------------------------------

class EnquiryAdminMixin(admin.ModelAdmin):
    def get_urls(self):
        urls = super().get_urls()
        model_name = self.model._meta.model_name
        custom_urls = [
            path(
                "<path:object_id>/print/",
                self.admin_site.admin_view(self.print_single_view),
                name=f"{model_name}_print",
            ),
            path(
                "<path:object_id>/pdf/",
                self.admin_site.admin_view(self.export_single_pdf_view),
                name=f"{model_name}_pdf",
            ),
            path(
                "<path:object_id>/reply/",
                self.admin_site.admin_view(self.reply_view),
                name=f"{model_name}_reply",
            ),
            path(
                "print-report/",
                self.admin_site.admin_view(self.print_report_view),
                name=f"{model_name}_print_report",
            ),
            path(
                "export-xlsx/",
                self.admin_site.admin_view(self.export_xlsx_view),
                name=f"{model_name}_export_xlsx",
            ),
            path(
                "export-csv/",
                self.admin_site.admin_view(self.export_csv_view),
                name=f"{model_name}_export_csv",
            ),
        ]
        return custom_urls + urls

    def _get_enquiry_labels(self, enq):
        """Return (type_label, target_title) for an enquiry."""
        if hasattr(enq, "property_title"):
            return "Property", enq.property_title
        elif hasattr(enq, "service_title"):
            return "Service", enq.service_title
        elif hasattr(enq, "subject"):
            return "Contact", enq.subject or "General Enquiry"
        return "Enquiry", ""

    def print_single_view(self, request, object_id):
        enquiry = get_object_or_404(self.model, id=object_id)
        type_label, target_title = self._get_enquiry_labels(enquiry)
        context = {
            "enquiry": enquiry,
            "type": f"{type_label} Enquiry",
            "target_title": target_title,
        }
        return render(request, "core/print_enquiry.html", context)

    def export_single_pdf_view(self, request, object_id):
        enquiry = get_object_or_404(self.model, id=object_id)
        type_label, target_title = self._get_enquiry_labels(enquiry)
        context = {
            "enquiry": enquiry,
            "type": f"{type_label} Enquiry",
            "target_title": target_title,
        }
        html_string = render_to_string("core/print_enquiry.html", context)
        pdf_bytes = generate_pdf_bytes(html_string)

        if pdf_bytes:
            response = HttpResponse(pdf_bytes, content_type="application/pdf")
            response["Content-Disposition"] = (
                f'attachment; filename="Enquiry_{enquiry.id}.pdf"'
            )
            return response

        messages.error(request, "Failed to render PDF document.")
        return HttpResponseRedirect("../")

    def reply_view(self, request, object_id):
        """Renders and handles the admin reply form."""
        enquiry = get_object_or_404(self.model, id=object_id)

        # Get existing replies for history display
        ct = ContentType.objects.get_for_model(self.model)
        reply_history = EnquiryReply.objects.filter(
            content_type=ct, object_id=enquiry.pk
        ).order_by("-sent_at")

        if request.method == "POST":
            subject = request.POST.get("subject", "").strip()
            message_body = request.POST.get("message", "").strip()

            if not subject or not message_body:
                messages.error(request, "Subject and message are required.")
            else:
                try:
                    reply_obj = send_enquiry_reply(
                        enquiry_instance=enquiry,
                        subject=subject,
                        message=message_body,
                        sender_user=request.user,
                    )
                    if reply_obj.email_delivered:
                        messages.success(
                            request,
                            f"✅ Reply sent successfully to {enquiry.email}.",
                        )
                    else:
                        messages.warning(
                            request,
                            f"⚠️ Reply recorded but email delivery failed for "
                            f"{enquiry.email}. Check SMTP configuration.",
                        )
                    return HttpResponseRedirect("../")
                except Exception as exc:
                    messages.error(request, f"Failed to send reply: {exc}")

        type_label, target_title = self._get_enquiry_labels(enquiry)
        context = {
            "title": f"Reply to {enquiry.name}",
            "enquiry": enquiry,
            "type_label": type_label,
            "target_title": target_title,
            "reply_history": reply_history,
            "opts": self.model._meta,
        }
        return render(request, "admin/core/reply_form.html", context)

    def print_report_view(self, request):
        queryset = self.get_queryset(request)
        for enq in queryset:
            enq.type_label, enq.target_title = self._get_enquiry_labels(enq)

        context = {
            "title": f"Mabel Homes - {self.model._meta.verbose_name_plural} Summary Report",
            "enquiries": queryset,
            "generated_at": timezone.now(),
        }
        return render(request, "core/print_report.html", context)

    def export_csv_view(self, request):
        queryset = self.get_queryset(request)
        headers = ["ID", "Type", "Target", "Name", "Email", "Phone", "Status", "Replied", "Date", "Message"]
        rows = []
        for enq in queryset:
            t_label, t_title = self._get_enquiry_labels(enq)
            rows.append([
                enq.id, t_label, t_title, enq.name, enq.email, enq.phone,
                enq.status, "Yes" if enq.replied else "No",
                enq.created_at.strftime("%Y-%m-%d %H:%M"), enq.message,
            ])
        csv_data = generate_csv_string(headers, rows)
        response = HttpResponse(csv_data, content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="Enquiry_Summary_{timezone.now().strftime("%Y%m%d")}.csv"'
        )
        return response

    def export_xlsx_view(self, request):
        queryset = self.get_queryset(request)
        headers = ["ID", "Type", "Target", "Name", "Email", "Phone", "Status", "Replied", "Date", "Message"]
        rows = []
        for enq in queryset:
            t_label, t_title = self._get_enquiry_labels(enq)
            rows.append([
                enq.id, t_label, t_title, enq.name, enq.email, enq.phone,
                enq.status, "Yes" if enq.replied else "No",
                enq.created_at.strftime("%Y-%m-%d %H:%M"), enq.message,
            ])
        xlsx_bytes = generate_xlsx_bytes("Enquiries Summary", headers, rows)
        response = HttpResponse(
            xlsx_bytes,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )
        response["Content-Disposition"] = (
            f'attachment; filename="Enquiry_Summary_{timezone.now().strftime("%Y%m%d")}.xlsx"'
        )
        return response


# ---------------------------------------------------------------------------
# Property Enquiry Admin
# ---------------------------------------------------------------------------

@admin.register(PropertyEnquiry)
class PropertyEnquiryAdmin(EnquiryAdminMixin):
    list_display = (
        "id",
        "name",
        "email",
        "phone",
        "property_title",
        "status",
        "replied",
        "created_at",
        "action_links",
    )
    list_filter = ("status", "replied", "created_at")
    search_fields = ("name", "email", "phone", "message", "property_title")
    readonly_fields = ("created_at", "updated_at")
    actions = ["mark_responded", "mark_closed"]

    def action_links(self, obj):
        return format_html(
            '<a class="button" href="{}/print/" target="_blank">Print</a>&nbsp;'
            '<a class="button" href="{}/pdf/">PDF</a>&nbsp;'
            '<a class="button" style="background:#417690;color:white;" href="{}/reply/">✉ Reply</a>',
            obj.id, obj.id, obj.id,
        )

    action_links.short_description = "Actions"

    def mark_responded(self, request, queryset):
        queryset.update(status="Responded", replied=True)
        self.message_user(request, "Selected enquiries marked as Responded.")

    mark_responded.short_description = "Mark Responded"

    def mark_closed(self, request, queryset):
        queryset.update(status="Closed")
        self.message_user(request, "Selected enquiries marked as Closed.")

    mark_closed.short_description = "Mark Closed"


# ---------------------------------------------------------------------------
# Service Enquiry Admin
# ---------------------------------------------------------------------------

@admin.register(ServiceEnquiry)
class ServiceEnquiryAdmin(EnquiryAdminMixin):
    list_display = (
        "id",
        "name",
        "email",
        "phone",
        "service_colored",
        "status",
        "replied",
        "created_at",
        "action_links",
    )
    list_filter = ("service_type", "status", "replied", "created_at")
    search_fields = ("name", "email", "phone", "message", "service_title")
    readonly_fields = ("created_at", "updated_at")
    actions = ["mark_responded", "mark_closed"]

    def service_colored(self, obj):
        colors = {
            "buying-property": "#27ae60",
            "selling-property": "#c0392b",
            "investment-consultation": "#f39c12",
            "property-marketing": "#2980b9",
            "property-documentation": "#8e44ad",
            "property-inspection": "#16a085",
            "property-management": "#2c3e50",
            "shortlet-apartments": "#d35400",
        }
        slug = obj.service_type.slug if obj.service_type else "other"
        color = colors.get(slug, "#7f8c8d")
        return format_html(
            '<span style="color: {}; font-weight: bold; border-left: 4px solid {}; padding-left: 6px;">{}</span>',
            color, color, obj.service_title,
        )

    service_colored.short_description = "Service Category"

    def action_links(self, obj):
        return format_html(
            '<a class="button" href="{}/print/" target="_blank">Print</a>&nbsp;'
            '<a class="button" href="{}/pdf/">PDF</a>&nbsp;'
            '<a class="button" style="background:#417690;color:white;" href="{}/reply/">✉ Reply</a>',
            obj.id, obj.id, obj.id,
        )

    action_links.short_description = "Actions"

    def mark_responded(self, request, queryset):
        queryset.update(status="Responded", replied=True)
        self.message_user(request, "Selected enquiries marked as Responded.")

    mark_responded.short_description = "Mark Responded"

    def mark_closed(self, request, queryset):
        queryset.update(status="Closed")
        self.message_user(request, "Selected enquiries marked as Closed.")

    mark_closed.short_description = "Mark Closed"


# ---------------------------------------------------------------------------
# Contact Messages Admin
# ---------------------------------------------------------------------------

@admin.register(ContactMessage)
class ContactMessageAdmin(EnquiryAdminMixin):
    list_display = (
        "id",
        "name",
        "email",
        "phone",
        "subject",
        "status",
        "replied",
        "created_at",
        "action_links",
    )
    list_filter = ("status", "replied", "created_at")
    search_fields = ("name", "email", "phone", "message", "subject")
    readonly_fields = ("created_at", "updated_at")
    actions = ["mark_responded", "mark_closed"]

    def action_links(self, obj):
        return format_html(
            '<a class="button" href="{}/print/" target="_blank">Print</a>&nbsp;'
            '<a class="button" href="{}/pdf/">PDF</a>&nbsp;'
            '<a class="button" style="background:#417690;color:white;" href="{}/reply/">✉ Reply</a>',
            obj.id, obj.id, obj.id,
        )

    action_links.short_description = "Actions"

    def mark_responded(self, request, queryset):
        queryset.update(status="Responded", replied=True)
        self.message_user(request, "Selected messages marked as Responded.")

    mark_responded.short_description = "Mark Responded"

    def mark_closed(self, request, queryset):
        queryset.update(status="Closed")
        self.message_user(request, "Selected messages marked as Closed.")

    mark_closed.short_description = "Mark Closed"


# ---------------------------------------------------------------------------
# Admin Notification Admin
# ---------------------------------------------------------------------------

@admin.register(AdminNotification)
class AdminNotificationAdmin(admin.ModelAdmin):
    list_display = ("notification_type_badge", "title", "read", "created_at")
    list_filter = ("notification_type", "read", "created_at")
    search_fields = ("title", "message")
    readonly_fields = ("created_at",)
    actions = ["mark_as_read"]

    def notification_type_badge(self, obj):
        colors = {
            "property_enquiry": "#27ae60",
            "service_enquiry": "#2980b9",
            "contact": "#8e44ad",
            "like": "#e74c3c",
            "system": "#7f8c8d",
        }
        labels = {
            "property_enquiry": "🏠 Property",
            "service_enquiry": "⚙️ Service",
            "contact": "✉️ Contact",
            "like": "❤️ Like",
            "system": "🔧 System",
        }
        color = colors.get(obj.notification_type, "#7f8c8d")
        label = labels.get(obj.notification_type, obj.notification_type)
        return format_html(
            '<span style="color:{}; font-weight:bold;">{}</span>', color, label
        )

    notification_type_badge.short_description = "Type"

    def mark_as_read(self, request, queryset):
        queryset.update(read=True)
        self.message_user(request, "Selected notifications marked as read.")

    mark_as_read.short_description = "Mark as Read"


# ---------------------------------------------------------------------------
# Media Asset Admin
# ---------------------------------------------------------------------------

@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("file_name", "media_type", "folder", "file_size_display", "preview", "uploaded_by", "created_at")
    list_filter = ("media_type", "folder", "created_at")
    search_fields = ("file_name", "alt_text", "folder")
    readonly_fields = ("file_name", "media_type", "mime_type", "file_size", "created_at", "preview")

    def file_size_display(self, obj):
        if obj.file_size < 1024:
            return f"{obj.file_size} B"
        elif obj.file_size < 1024 * 1024:
            return f"{obj.file_size / 1024:.1f} KB"
        return f"{obj.file_size / (1024 * 1024):.1f} MB"

    file_size_display.short_description = "Size"

    def preview(self, obj):
        if not obj.file:
            return "No file"
        if obj.media_type == "image":
            return format_html(
                '<img src="{}" width="80" height="60" style="object-fit:cover;border-radius:4px;" />',
                obj.file.url,
            )
        elif obj.media_type == "video":
            return format_html(
                '<video width="80" height="60" controls style="border-radius:4px;">'
                '<source src="{}" />'
                "</video>",
                obj.file.url,
            )
        return format_html('<a href="{}" target="_blank">View File</a>', obj.file.url)

    preview.short_description = "Preview"




# ---------------------------------------------------------------------------
# Audit Log Admin (read-only)
# ---------------------------------------------------------------------------

@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("timestamp", "user", "action_badge", "model_name", "description_short", "ip_address")
    list_filter = ("action", "model_name", "timestamp")
    search_fields = ("user__username", "description", "model_name", "ip_address")
    readonly_fields = ("user", "action", "model_name", "object_id", "description",
                       "ip_address", "user_agent", "timestamp")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def action_badge(self, obj):
        colors = {
            "login": "#27ae60",
            "logout": "#e74c3c",
            "create": "#2980b9",
            "update": "#f39c12",
            "delete": "#c0392b",
            "reply": "#8e44ad",
            "upload": "#16a085",
            "settings": "#2c3e50",
        }
        color = colors.get(obj.action, "#7f8c8d")
        return format_html(
            '<span style="background:{}; color:white; padding:2px 8px; border-radius:3px; '
            'font-size:11px; font-weight:bold;">{}</span>',
            color, obj.action.upper(),
        )

    action_badge.short_description = "Action"

    def description_short(self, obj):
        return obj.description[:80] + "..." if len(obj.description) > 80 else obj.description

    description_short.short_description = "Description"
