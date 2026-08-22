from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
try:
    from weasyprint import HTML
except Exception:
    HTML = None
from django.template.loader import render_to_string
from .models import Target, Scan, Finding
from .serializers import (
    TargetSerializer, ScanSerializer, FindingSerializer, ScanCreateSerializer
)
from .tasks import run_scan_async

class TargetViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all()  # FIXED: removed the extra argument
    serializer_class = TargetSerializer
    permission_classes = [AllowAny]

class ScanViewSet(viewsets.ModelViewSet):
    queryset = Scan.objects.all().order_by('-started_at')
    serializer_class = ScanSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        create_serializer = ScanCreateSerializer(data=request.data)
        create_serializer.is_valid(raise_exception=True)
        url = create_serializer.validated_data['url']
        depth = create_serializer.validated_data['depth']
        headers = create_serializer.validated_data.get('headers', {})

        target, _ = Target.objects.get_or_create(url=url)
        scan = Scan.objects.create(target=target, depth=depth, headers=headers, status='PENDING')

        run_scan_async.delay(scan.id)

        return Response(
            ScanSerializer(scan).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def findings(self, request, pk=None):
        scan = self.get_object()
        findings = scan.findings.all()
        serializer = FindingSerializer(findings, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        scan = self.get_object()
        data = {
            'scan_id': str(scan.id),
            'target': scan.target.url,
            'status': scan.status,
            'started_at': scan.started_at.isoformat(),
            'ended_at': scan.ended_at.isoformat() if scan.ended_at else None,
            'findings': FindingSerializer(scan.findings.all(), many=True).data
        }
        return Response(data)

class FindingViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Finding.objects.all()
    serializer_class = FindingSerializer
    permission_classes = [AllowAny]


class ScanPDFExportView(generics.RetrieveAPIView):
    queryset = Scan.objects.prefetch_related('findings')
    lookup_field = 'id'

    def get(self, request, *args, **kwargs):
        scan = self.get_object()
        findings = scan.findings.all()
        # Render HTML template
        html_string = render_to_string('scan_report.html', {'scan': scan, 'findings': findings})
        # Generate PDF
        pdf_file = HTML(string=html_string).write_pdf()
        response = HttpResponse(pdf_file, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="scan_{scan.id}_report.pdf"'
        return response