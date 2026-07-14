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

# Database configuration
# Connects to PostgreSQL via DATABASE_URL or separate credentials if available, falls back to SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT", "5432")

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
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

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# CORS & CSRF Configurations
CORS_ALLOW_ALL_ORIGINS = (
    True  # Can be tightened in production using CORS_ALLOWED_ORIGINS
)
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = os.getenv(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001",
).split(",")

# Django REST Framework Settings
REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
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
# Email / SMTP Configuration
# ---------------------------------------------------------------------------
_email_host_user = os.getenv("EMAIL_HOST_USER", "")
_email_host_password = os.getenv("EMAIL_HOST_PASSWORD", "")

EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend")
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() in ("true", "1", "yes")
EMAIL_USE_SSL = os.getenv("EMAIL_USE_SSL", "False").lower() in ("true", "1", "yes")
EMAIL_HOST_USER = _email_host_user
EMAIL_HOST_PASSWORD = _email_host_password
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "olajumoke@mabelhomes.org")
SERVER_EMAIL = os.getenv("SERVER_EMAIL", "olajumoke@mabelhomes.org")
ADMIN_EMAIL_FROM = os.getenv("ADMIN_EMAIL_FROM", "olajumoke@mabelhomes.org")

# If SMTP details are empty in local development, fallback to console email backend
if not _email_host_user or not _email_host_password:
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    _EMAIL_BACKEND_REASON = "EMAIL_HOST_USER or EMAIL_HOST_PASSWORD not set in .env"
else:
    EMAIL_BACKEND = os.getenv(
        "EMAIL_BACKEND", "django.core.mail.backends.smtp.EmailBackend"
    )
    _EMAIL_BACKEND_REASON = "SMTP credentials configured"

# Allow disabling email notifications via environment variable
if os.getenv("DISABLE_EMAIL_NOTIFICATIONS", "False").lower() in ("true", "1", "yes"):
    EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
    _EMAIL_BACKEND_REASON = "Disabled via DISABLE_EMAIL_NOTIFICATIONS"

EMAIL_TIMEOUT = 5  # SMTP connection/read timeout in seconds to prevent blocking

# Expose which backend is active and why — used by notification_service for logging
EMAIL_BACKEND_IS_CONSOLE = EMAIL_BACKEND == "django.core.mail.backends.console.EmailBackend"
EMAIL_BACKEND_REASON = _EMAIL_BACKEND_REASON

# Custom Mabel Homes Settings
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "olajumoke@mabelhomes.org")

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
