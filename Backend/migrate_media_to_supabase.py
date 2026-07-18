import os
import sys
import django

# Setup Django context
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mabelhomes_backend.settings")

try:
    django.setup()
except Exception as e:
    print(f"CRITICAL: Failed to initialize Django: {e}")
    sys.exit(1)

from django.conf import settings
from django.core.files.storage import default_storage
from core.models import PropertyImage, PropertyVideo
from core.storage import SupabaseStorage

def migrate_media():
    print("=" * 65)
    print("MABEL HOMES MEDIA TO SUPABASE STORAGE MIGRATION")
    print("=" * 65)

    if not getattr(settings, "USE_SUPABASE_STORAGE", False):
        print("FAIL: USE_SUPABASE_STORAGE is not set to True in your settings/environment.")
        print("Please enable USE_SUPABASE_STORAGE=True before running this migration.")
        print("=" * 65)
        return

    # Instantiate Supabase storage explicitly to access it
    storage = default_storage
    if not isinstance(storage, SupabaseStorage):
        print("FAIL: Default storage is not SupabaseStorage. Check your settings.py configuration.")
        return

    print(f"Supabase Bucket:  {storage.bucket_name}")
    print(f"Supabase URL:     {storage.supabase_url}")
    print("-" * 65)

    images = PropertyImage.objects.all()
    videos = PropertyVideo.objects.all()

    print(f"Found {images.count()} PropertyImage records in database.")
    print(f"Found {videos.count()} PropertyVideo records in database.")
    print("\nStarting migration...")

    migrated_images = 0
    skipped_images = 0
    failed_images = 0

    # 1. Migrate Property Images
    print("\n1. Migrating Property Images...")
    for idx, img in enumerate(images, 1):
        fields = ["image_upload", "image_optimized", "image_thumbnail"]
        print(f"[{idx}/{images.count()}] Image for Property: '{img.property.title}' (ID: {img.id})")
        
        modified = False
        for field_name in fields:
            field_file = getattr(img, field_name)
            if not field_file:
                continue

            file_path = field_file.name
            # If the file URL is already absolute (e.g. Supabase public URL), it's already migrated
            if file_path.startswith("http://") or file_path.startswith("https://"):
                print(f"  - Field '{field_name}' already migrated: {file_path}")
                continue

            # Check if file exists locally on disk
            local_full_path = os.path.join(settings.MEDIA_ROOT, file_path)
            if os.path.exists(local_full_path):
                try:
                    print(f"  - Uploading local file to Supabase: {file_path}...")
                    with open(local_full_path, "rb") as f:
                        # django default_storage.save handles uploading
                        # Specify name directly to upload to the same path
                        storage.save(file_path, f)
                    migrated_images += 1
                    modified = True
                except Exception as e:
                    print(f"  - [ERROR] Upload failed for {file_path}: {e}")
                    failed_images += 1
            else:
                print(f"  - [WARNING] File {file_path} does not exist locally.")
                failed_images += 1

        if modified:
            # We don't need to change file names in DB since path stays identical, 
            # but we trigger save to run any necessary logic or signals if any (signals are skipped since it's same name)
            img.save()

    # 2. Migrate Property Videos
    print("\n2. Migrating Property Videos...")
    migrated_videos = 0
    skipped_videos = 0
    failed_videos = 0

    for idx, vid in enumerate(videos, 1):
        print(f"[{idx}/{videos.count()}] Video for Property: '{vid.property.title}' (ID: {vid.id})")
        if not vid.video_upload:
            print("  - Video type is URL, skipping file migration.")
            continue

        file_path = vid.video_upload.name
        if file_path.startswith("http://") or file_path.startswith("https://"):
            print(f"  - Video already migrated: {file_path}")
            continue

        local_full_path = os.path.join(settings.MEDIA_ROOT, file_path)
        if os.path.exists(local_full_path):
            try:
                print(f"  - Uploading local file to Supabase: {file_path}...")
                with open(local_full_path, "rb") as f:
                    storage.save(file_path, f)
                migrated_videos += 1
                vid.save()
            except Exception as e:
                print(f"  - [ERROR] Upload failed for {file_path}: {e}")
                failed_videos += 1
        else:
            print(f"  - [WARNING] Video file {file_path} does not exist locally.")
            failed_videos += 1

    print("\n" + "=" * 65)
    print("MIGRATION COMPLETED SUMMARY")
    print("=" * 65)
    print(f"Images Migrated (Uploaded): {migrated_images}")
    print(f"Images Skipped (Already on Supabase): {skipped_images}")
    print(f"Images Failed (Missing):   {failed_images}")
    print(f"Videos Migrated (Uploaded): {migrated_videos}")
    print(f"Videos Skipped (Already on Supabase): {skipped_videos}")
    print(f"Videos Failed (Missing):   {failed_videos}")
    print("=" * 65)

if __name__ == "__main__":
    migrate_media()
