import os
import django
from django.core.asgi import get_asgi_application

# 1. Set the settings module FIRST
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# 2. Load Django apps (this MUST happen before importing any app module)
django.setup()

# 3. Now import Channels and consumers (Django is ready)
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path
from apps.scans.consumers import ScanConsumer

# 4. Build the ASGI application
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter([
            path('ws/scan/<str:scan_id>/', ScanConsumer.as_asgi()),
        ])
    ),
})