from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'targets', views.TargetViewSet)
router.register(r'scans', views.ScanViewSet, basename='scan')
router.register(r'findings', views.FindingViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('scans/<uuid:id>/export/pdf/', views.ScanPDFExportView.as_view(), name='scan-pdf-export'),
]