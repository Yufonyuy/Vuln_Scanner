import os
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv

# Load environment variable
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-default-dev-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',') if os.getenv('ALLOWED_HOSTS') else ['localhost', '127.0.0.1']
ALLOWED_HOSTS = [h.strip() for h in ALLOWED_HOSTS if h.strip()]
# Allow Render domains automatically
if not any('.onrender.com' in h for h in ALLOWED_HOSTS):
    ALLOWED_HOSTS.append('.onrender.com')

CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', '').split(',') if os.getenv('CSRF_TRUSTED_ORIGINS') else []
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://localhost:5173').split(',') if os.getenv('CORS_ALLOWED_ORIGINS') else ["http://localhost:3000", "http://localhost:5173"]
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'False') == 'True'
CORS_ALLOW_CREDENTIALS = True


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    #Third-party apps
    'rest_framework',
    'corsheaders',
    'channels',
    'django_celery_results',

    # Our custom apps
    'apps.scans',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Must be at the top
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'
ASGI_APPLICATION = 'core.asgi.application'  # For WebSockets

# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600,
            ssl_require=True,
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('POSTGRES_DB', 'pentest_db'),
            'USER': os.getenv('POSTGRES_USER', 'pentest_user'),
            'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'securepass123'),
            'HOST': os.getenv('POSTGRES_HOST', 'db'),
            'PORT': os.getenv('POSTGRES_PORT', '5432'),
        }
    }


# Redis + Celery Configuration
REDIS_URL = os.getenv('REDIS_URL', 'redis://redis:6379/0')
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL') or REDIS_URL
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND') or REDIS_URL
if CELERY_BROKER_URL and CELERY_BROKER_URL.startswith('rediss://') and 'ssl_cert_reqs' not in CELERY_BROKER_URL:
    separator = '&' if '?' in CELERY_BROKER_URL else '?'
    CELERY_BROKER_URL = f"{CELERY_BROKER_URL}{separator}ssl_cert_reqs=none"
if CELERY_RESULT_BACKEND and CELERY_RESULT_BACKEND.startswith('rediss://') and 'ssl_cert_reqs' not in CELERY_RESULT_BACKEND:
    separator = '&' if '?' in CELERY_RESULT_BACKEND else '?'
    CELERY_RESULT_BACKEND = f"{CELERY_RESULT_BACKEND}{separator}ssl_cert_reqs=none"
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_BROKER_TRANSPORT_OPTIONS = {'visibility_timeout': 3600}
CELERY_REDIS_BACKEND_USE_SSL = {'ssl_cert_reqs': 0}
CELERY_BROKER_USE_SSL = {'ssl_cert_reqs': 0}


# Django Channels (Websockets) - Using Redis as channel layer
if os.getenv('REDIS_URL'):
    redis_hosts = [REDIS_URL]
    if REDIS_URL.startswith('rediss://') and 'ssl_cert_reqs' not in REDIS_URL:
        separator = '&' if '?' in REDIS_URL else '?'
        redis_hosts = [f"{REDIS_URL}{separator}ssl_cert_reqs=none"]
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": redis_hosts,
            },
        },
    }
else:
    CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels_redis.core.RedisChannelLayer",
            "CONFIG": {
                "hosts": [(os.getenv('REDIS_HOST', 'redis'), int(os.getenv('REDIS_PORT', '6379')))],
            },
        },
    }


# CORS - Allow our React frontend
CORS_ALLOW_CREDENTIALS = True

# DRF Settings
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}


# Static & Media
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
MEDIA_URL = '/media/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


