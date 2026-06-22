from django.db import models
from django.contrib.postgres.fields import JSONField # Django 5.0 uses models.JSONField natively
import uuid


class SeverityChoices(models.TextChoices):
    CRITICAL = 'CRITICAL', 'Critical'
    HIGH = 'HIGH', 'High'
    MEDIUM = 'MEDIUM', 'Medium'
    LOW = 'LOW', 'Low'
    INFO = 'INFO', 'Informational'


class ScanStatusChoices(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    RUNNING = 'RUNNING', 'Running'
    COMPLETED = 'COMPLETED', 'Completed'
    FAILED = 'FAILED', 'Failed'

class Target(models.Model):
    """
    The website we are testing
    """
    url = models.URLField(max_length=500, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_scanned = models.DateTimeField(null=True, blank=True)


    # Detected tech stack (cached here after fingerprinting)
    technologies = models.JSONField(default=list, blank=True, help_text="List of detected techs e.g. ['Python', 'Django', 'PostgreSQL']")

    def __str__(self):
        return self.url
    
class Scan(models.Model):
    """A specific scanning session against a target"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    target= models.ForeignKey(Target, on_delete=models.CASCADE, related_name='scans')
    status = models.CharField(max_length=20, choices=ScanStatusChoices.choices, default=ScanStatusChoices.PENDING)
    depth = models.PositiveIntegerField(default=2, help_text="Crawl depth level")

    # Progress Tracking
    progress = models.PositiveIntegerField(default=0, help_text="0 to 100")
    current_stage = models.CharField(max_length=100, blank=True, default='Initializing....')
    log_messages = models.JSONField(default=list, blank=True) # Real-time logs stored for history

    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    # Crawled data
    discovered_urls = models.JSONField(default=list, blank=True)
    forms_found = models.JSONField(default=list, blank=True)    # Stores method, action, inputs

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"Scan {self.id} - {self.target.url}"
    
class Finding(models.Model):
    """A single vulnerability or security issue discovered"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scan = models.ForeignKey(Scan, on_delete=models.CASCADE, related_name='findings')

    # Where it was found
    url = models.URLField(max_length=2000)
    parameter = models.TextField(blank=True, null=True)     # GET param, form field, or header
    method = models.CharField(max_length=10, default='GET')
    payload = models.TextField(blank=True, null=True)

    # What was found
    vuln_type = models.CharField(max_length=255)    # e.g., "SQL Injection", "XSS" "IDOR"
    severity = models.CharField(max_length=100, choices=SeverityChoices.choices)
    cvss_score = models.FloatField(null=True, blank=True)
    cwe_id = models.IntegerField(null=True, blank=True) # CWE-89, CWE-79, etc

    # Evidence & Remediation
    evidence = models.TimeField(blank=True, null=True, help_text='Snippet of response or logs proving the vuln')
    remediation = models.TextField(blank=True, null=True, help_text="AI-generated")

    # AI Validation
    is_false_positive = models.BooleanField(default=False)
    ai_confidence = models.IntegerField(default=0, help_text="0-100")
    ai_analysis_raw = models.JSONField(default=dict, blank=True, help_text="Full JSON response from Claude/Germini")

    discovered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-severity', '-cvss_score']

    def __str__(self):
        return f"{self.vuln_type} ({self.severity}) - {self.url}"