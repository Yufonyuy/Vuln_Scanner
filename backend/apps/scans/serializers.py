from rest_framework import serializers
from .models import Target, Scan, Finding

class TargetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Target
        fields = ['id', 'url', 'created_at', 'last_scanned', 'technologies']
        read_only_fields = ['id', 'created_at', 'last_scanned']

class FindingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Finding
        fields = [
            'id', 'scan', 'url', 'parameter', 'method', 'payload',
            'vuln_type', 'severity', 'cvss_score', 'cwe_id',
            'evidence', 'remediation', 'is_false_positive',
            'ai_confidence', 'discovered_at'
        ]
        read_only_fields = ['id', 'discovered_at']

class ScanSerializer(serializers.ModelSerializer):
    target = TargetSerializer(read_only=True)
    findings = FindingSerializer(many=True, read_only=True)
    finding_count=serializers.SerializerMethodField()

    class Meta:
        model = Scan
        fields = [
            'id', 'target', 'status', 'depth', 'progress', 'current_stage',
            'log_messages', 'started_at', 'ended_at', 'discovered_urls',
            'forms_found', 'findings', 'finding_count'
        ]
        read_only_fields = ['id', 'started_at', 'ended_at']

    def get_finding_count(self, obj):
        return obj.findings.count()
    
class ScanCreateSerializer(serializers.Serializer):
    url = serializers.URLField(required=True)
    depth = serializers.IntegerField(min_value=1, max_value=5, default=2)
    headers = serializers.JSONField(required=False, default=dict)

    def validate_url(self, value):
        # Basic validation: ensure it has scheme
        if not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("URL must start with http:// or https://")
        return value
