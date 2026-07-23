import logging
import os
from datetime import timedelta
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger("core")

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "django-insecure-mabel-homes-fallback-key-for-dev")
DEBUG = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "*").split(",")

# Application definition
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third party apps
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    # Local apps
    "core.apps.CoreConfig",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "mabelhomes_backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [os.path.join(BASE_DIR, "templates")],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "mabelhomes_backend.wsgi.application"
ASGI_APPLICATION = "mabelhomes_backend.asgi.application"

# Helper to read environment variables and strip whitespaces safely
def get_env_stripped(key, default=""):
    val = os.getenv(key, default)
    if val is None:
        return None
    return val.strip()

# Database configuration
# Connects to PostgreSQL via DATABASE_URL or separate credentials if available, falls back to SQLite
DATABASE_URL = get_env_stripped("DATABASE_URL")
DB_NAME = get_env_stripped("DB_NAME")
DB_USER = get_env_stripped("DB_USER")
DB_PASSWORD = get_env_stripped("DB_PASSWORD")
DB_HOST = get_env_stripped("DB_HOST")
DB_PORT = get_env_stripped("DB_PORT", "5432")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
            disable_server_side_cursors=True,
        )
    }
elif DB_NAME and DB_USER and DB_PASSWORD and DB_HOST:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": DB_NAME,
            "USER": DB_USER,
            "PASSWORD": DB_PASSWORD,
            "HOST": DB_HOST,
            "PORT": DB_PORT,
            "CONN_MAX_AGE": 600,
            "DISABLE_SERVER_SIDE_CURSORS": True,
        }
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, "static_src"),
]

# Media files (uploaded user/admin content)
MEDIA_URL = "/media/"
MEDIA_ROOT = os.path.join(BASE_DIR, "media")

# Supabase Storage Configuration
USE_SUPABASE_STORAGE = get_env_stripped("USE_SUPABASE_STORAGE", "False").lower() in ("true", "1", "yes")
SUPABASE_URL = get_env_stripped("SUPABASE_URL", "")
SUPABASE_KEY = get_env_stripped("SUPABASE_KEY", "")
SUPABASE_BUCKET = get_env_stripped("SUPABASE_BUCKET", "property-media")

if USE_SUPABASE_STORAGE:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ValueError(
            "USE_SUPABASE_STORAGE is set to True, but SUPABASE_URL or SUPABASE_KEY is missing/empty. "
            "Please configure all Supabase Storage environment variables to prevent silent fallback to local storage."
        )
    STORAGES = {
        "default": {
            "BACKEND": "core.storage.SupabaseStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
        },
    }

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS & CSRF Configurations
from corsheaders.defaults import default_headers

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "https://www.mabelhomes.org",
    "https://mabelhomes.org",
    "https://admin.mabelhomes.org",
    "https://api.mabelhomes.org",
]
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.onrender\.com$",
    r"^http://localhost:\d+$",
    r"^http://127\.0\.0\.1:\d+$",
]
CORS_ALLOW_HEADERS = list(default_headers) + [
    "x-visitor-id",
]
CSRF_TRUSTED_ORIGINS = os.getenv(
    "CSRF_TRUSTED_ORIGINS",
    "https://www.mabelhomes.org,https://mabelhomes.org,https://admin.mabelhomes.org,https://api.mabelhomes.org,https://*.onrender.com,http://localhost:3000,http://localhost:3001,http://localhost:3002",
).split(",")

# Django REST Framework Settings
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "core.pagination.StandardResultsSetPagination",
    "PAGE_SIZE": 10,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": os.getenv("THROTTLE_RATE_ANON", "100/day"),
        "user": os.getenv("THROTTLE_RATE_USER", "1000/day"),
        "enquiry": os.getenv("THROTTLE_RATE_ENQUIRY", "5/minute"),
        "like": os.getenv("THROTTLE_RATE_LIKE", "10/minute"),
    },
}

# JWT Configuration (for Admin Portal authentication)
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "TOKEN_TYPE_CLAIM": "token_type",
    "JTI_CLAIM": "jti",
}

# OpenAPI Swagger/ReDoc Settings
SPECTACULAR_SETTINGS = {
    "TITLE": "Mabel Homes REST API",
    "DESCRIPTION": "REST API for Mabel Homes properties management, enquiries and services backend.",
    "VERSION": "2.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SECURITY": [{"BearerAuth": []}],
    "COMPONENTS": {
        "securitySchemes": {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
        }
    },
}

# Caching Configuration
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "mabelhomes-cache",
    }
}
MABEL_CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))

# ---------------------------------------------------------------------------
# Resend Email Configuration
# ---------------------------------------------------------------------------
RESEND_API_KEY = get_env_stripped("RESEND_API_KEY", "")
FROM_EMAIL = get_env_stripped("FROM_EMAIL", get_env_stripped("DEFAULT_FROM_EMAIL", "olajumoke@mabelhomes.org"))
ADMIN_EMAIL = get_env_stripped("ADMIN_EMAIL", "olajumoke@mabelhomes.org")
DEFAULT_FROM_EMAIL = FROM_EMAIL
SERVER_EMAIL = FROM_EMAIL
ADMIN_EMAIL_FROM = FROM_EMAIL


# Image Processing Configuration
MABEL_MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", str(5 * 1024 * 1024)))  # 5MB
MABEL_ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
MABEL_MAX_IMAGE_WIDTH = int(os.getenv("MAX_IMAGE_WIDTH", "1920"))
MABEL_IMAGE_QUALITY = int(os.getenv("IMAGE_QUALITY", "80"))

# Video Processing Configuration
MABEL_MAX_VIDEO_SIZE = int(os.getenv("MAX_VIDEO_SIZE", str(100 * 1024 * 1024)))  # 100MB
MABEL_ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"]

# ---------------------------------------------------------------------------
# Logging Configuration
# ---------------------------------------------------------------------------
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "INFO",
        },
        "core": {
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
}
