import mimetypes
import logging
import requests
from django.conf import settings
from django.core.files.storage import Storage
from django.core.files.base import ContentFile
from django.utils.deconstruct import deconstructible

logger = logging.getLogger("core")

@deconstructible
class SupabaseStorage(Storage):
    """
    Production-ready storage backend for Supabase Storage.
    Integrates directly with Supabase Storage REST API using pre-installed requests.
    Falls back gracefully if URL or Key is not configured.
    """
    def __init__(self, bucket_name=None, supabase_url=None, supabase_key=None):
        _bucket = bucket_name or getattr(settings, "SUPABASE_BUCKET", "property-media")
        self.bucket_name = _bucket.strip() if _bucket else "property-media"
        
        _url = supabase_url or getattr(settings, "SUPABASE_URL", "")
        self.supabase_url = _url.rstrip("/").strip() if _url else ""
        
        _key = supabase_key or getattr(settings, "SUPABASE_KEY", "")
        self.supabase_key = _key.strip() if _key else ""
        
        self.api_url = f"{self.supabase_url}/storage/v1/object"

    def _get_headers(self):
        return {
            "Authorization": f"Bearer {self.supabase_key}",
            "apikey": self.supabase_key,
        }

    def _open(self, name, mode='rb'):
        name = name.replace("\\", "/")
        url = f"{self.api_url}/{self.bucket_name}/{name}"
        logger.debug(f"SupabaseStorage: Opening {name} from {url}")
        res = requests.get(url, headers=self._get_headers())
        if res.status_code != 200:
            logger.error(f"SupabaseStorage: File {name} not found or failed to fetch. Status: {res.status_code}")
            raise FileNotFoundError(f"File {name} not found in Supabase Storage.")
        return ContentFile(res.content, name=name)

    def _save(self, name, content):
        # Clean and normalize path separators
        name = name.replace("\\", "/")
        url = f"{self.api_url}/{self.bucket_name}/{name}"
        logger.info(f"SupabaseStorage: Saving {name} to {url}")
        
        # Read content bytes
        content.seek(0)
        file_data = content.read()
        
        mime_type, _ = mimetypes.guess_type(name)
        headers = self._get_headers()
        if mime_type:
            headers["Content-Type"] = mime_type
            
        # Enable upserting files so replacements or retries overwrite correctly
        headers["x-upsert"] = "true"
        
        res = requests.post(url, headers=headers, data=file_data)
        if res.status_code not in (200, 201):
            logger.error(f"SupabaseStorage: Failed to upload {name}. Status: {res.status_code}, Response: {res.text}")
            raise IOError(f"Failed to upload {name} to Supabase Storage: {res.text}")
            
        return name

    def delete(self, name):
        if not name:
            return False
        name = name.replace("\\", "/")
        url = f"{self.api_url}/{self.bucket_name}/{name}"
        logger.info(f"SupabaseStorage: Deleting {name} from {url}")
        res = requests.delete(url, headers=self._get_headers())
        if res.status_code not in (200, 204):
            logger.warning(f"SupabaseStorage: Failed to delete {name} or file was already deleted. Status: {res.status_code}")
            return False
        return True

    def exists(self, name):
        if not name:
            return False
        name = name.replace("\\", "/")
        url = f"{self.api_url}/info/public/{self.bucket_name}/{name}"
        res = requests.get(url, headers=self._get_headers())
        return res.status_code == 200

    def url(self, name):
        if not name:
            return ""
        # If it's already an absolute URL (e.g. from seed data), return as is
        if name.startswith("http://") or name.startswith("https://"):
            return name
        name = name.replace("\\", "/")
        return f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{name}"

    def size(self, name):
        name = name.replace("\\", "/")
        url = f"{self.api_url}/info/public/{self.bucket_name}/{name}"
        res = requests.get(url, headers=self._get_headers())
        if res.status_code == 200:
            try:
                return res.json().get("metadata", {}).get("size", 0)
            except Exception:
                pass
        return 0
