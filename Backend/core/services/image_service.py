import sys
from io import BytesIO

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import InMemoryUploadedFile
from PIL import Image


def validate_image_file(file):
    """
    Validates uploaded image file beyond extension checking.
    Verifies magic byte signature, MIME type, and size limit.
    """
    # 1. Check size limit
    if file.size > settings.MABEL_MAX_UPLOAD_SIZE:
        raise ValidationError(
            f"File size exceeds limit of {settings.MABEL_MAX_UPLOAD_SIZE / (1024*1024):.1f}MB."
        )

    # 2. Check magic byte signature
    header = file.read(12)
    file.seek(0)  # Reset file pointer after reading

    if len(header) < 4:
        raise ValidationError("Invalid or corrupted file.")

    # Magic signatures
    is_jpeg = header.startswith(b"\xff\xd8")
    is_png = header.startswith(b"\x89PNG\r\n\x1a\n")
    is_webp = header.startswith(b"RIFF") and header[8:12] == b"WEBP"

    if not (is_jpeg or is_png or is_webp):
        raise ValidationError(
            "Unsupported file type. Only JPEG, PNG, and WebP are allowed."
        )

    # Verify Pillow can open the image
    try:
        img = Image.open(file)
        img.verify()
        file.seek(0)  # Reset pointer again
    except Exception:
        raise ValidationError("The uploaded file is corrupted or not a valid image.")


def resize_and_compress(image_file, target_width, quality=80):
    """
    Resizes an image maintaining aspect ratio and compresses it.
    Returns an InMemoryUploadedFile.
    """
    image_file.seek(0)
    img = Image.open(image_file)

    # Keep original format or fallback to JPEG
    orig_format = img.format if img.format else "JPEG"
    content_type = (
        image_file.content_type
        if image_file.content_type
        else f"image/{orig_format.lower()}"
    )

    width, height = img.size
    if width > target_width:
        new_width = target_width
        new_height = int((new_width / width) * height)
        # Check Pillow version support for Resampling
        try:
            resample_method = Image.Resampling.LANCZOS
        except AttributeError:
            resample_method = Image.ANTIALIAS
        img = img.resize((new_width, new_height), resample_method)

    output = BytesIO()
    # Save with quality compression
    img.save(output, format=orig_format, quality=quality)
    output.seek(0)

    return InMemoryUploadedFile(
        file=output,
        field_name="ImageField",
        name=image_file.name,
        content_type=content_type,
        size=sys.getsizeof(output),
        charset=None,
    )


def process_property_image(property_image_instance):
    """
    Processes and populates the optimized and thumbnail fields
    for a PropertyImage instance before saving.
    """
    if (
        property_image_instance.image_upload
        and not property_image_instance.image_optimized
    ):
        # Validate original file
        validate_image_file(property_image_instance.image_upload)

        # 1. Generate optimized web version
        opt_file = resize_and_compress(
            property_image_instance.image_upload,
            target_width=settings.MABEL_MAX_IMAGE_WIDTH,
            quality=settings.MABEL_IMAGE_QUALITY,
        )
        property_image_instance.image_optimized = opt_file

        # 2. Generate thumbnail version (e.g. 400px wide)
        thumb_file = resize_and_compress(
            property_image_instance.image_upload, target_width=400, quality=75
        )
        property_image_instance.image_thumbnail = thumb_file
