import os
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent
DEBUG = os.getenv("KAVIN_DEBUG", "1") == "1"
SECRET_KEY = os.getenv("KAVIN_SECRET_KEY") or ("django-insecure-kavin-local-development-only-never-deploy" if DEBUG else None)
if not SECRET_KEY:
    raise ImproperlyConfigured("Set KAVIN_SECRET_KEY when KAVIN_DEBUG=0.")

def env_list(name, default=""):
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]

ALLOWED_HOSTS = env_list("KAVIN_ALLOWED_HOSTS", "127.0.0.1,localhost" if DEBUG else "")
CORS_ALLOWED_ORIGINS = env_list(
    "KAVIN_CORS_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001" if DEBUG else "",
)
CORS_URLS_REGEX = r"^/api/"

INSTALLED_APPS = [
    "django.contrib.admin", "django.contrib.auth", "django.contrib.contenttypes",
    "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "corsheaders", "rest_framework", "rest_framework.authtoken", "drf_spectacular",
    "drf_spectacular_sidecar", "reservations",
]
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware", "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware", "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware", "django.middleware.clickjacking.XFrameOptionsMiddleware",
]
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"
TEMPLATES = [{
    "BACKEND": "django.template.backends.django.DjangoTemplates", "APP_DIRS": True,
    "OPTIONS": {"context_processors": [
        "django.template.context_processors.request", "django.contrib.auth.context_processors.auth",
        "django.contrib.messages.context_processors.messages",
    ]},
}]
if os.getenv("KAVIN_DB_NAME"):
    DATABASES = {"default": {
        "ENGINE": "django.db.backends.postgresql", "NAME": os.environ["KAVIN_DB_NAME"],
        "USER": os.getenv("KAVIN_DB_USER", "kavin"), "PASSWORD": os.getenv("KAVIN_DB_PASSWORD", ""),
        "HOST": os.getenv("KAVIN_DB_HOST", "127.0.0.1"), "PORT": os.getenv("KAVIN_DB_PORT", "5432"),
    }}
else:
    DATABASES = {"default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
        "OPTIONS": {"timeout": 15, "transaction_mode": "IMMEDIATE"},
        "TEST": {"NAME": BASE_DIR / "test_kavin.sqlite3"} if os.getenv("KAVIN_TEST_SQLITE_FILE") == "1" else {},
    }}
AUTH_PASSWORD_VALIDATORS = [{"NAME": "django.contrib.auth.password_validation." + name} for name in (
    "UserAttributeSimilarityValidator", "MinimumLengthValidator",
    "CommonPasswordValidator", "NumericPasswordValidator",
)]
LANGUAGE_CODE = "en-us"
TIME_ZONE = "Asia/Tehran"
USE_TZ = True
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_SSL_REDIRECT = not DEBUG

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework.authentication.TokenAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["rest_framework.permissions.IsAuthenticated"],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_RATES": {"login": "20/min", "register": "10/min"},
    "EXCEPTION_HANDLER": "reservations.errors.exception_handler",
}
SPECTACULAR_SETTINGS = {
    "TITLE": "KAVIN Booking API", "VERSION": "1.0.0",
    "DESCRIPTION": "Gregorian dates, Asia/Tehran local times, prices in Iranian toman.",
    "SERVE_INCLUDE_SCHEMA": False, "SWAGGER_UI_DIST": "SIDECAR",
    "SWAGGER_UI_FAVICON_HREF": "SIDECAR",
}
