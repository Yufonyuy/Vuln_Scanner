import asyncio
from apps.scanner.utils.http_client import AsyncHTTPClient

async def check_security_headers(url, client=None):
    """
    Check for missing security headers.
    Returns a list of findings (each missing header as a finding).
    """
    if client is None:
        client = AsyncHTTPClient()

    findings = []
    try:
        response = await client.get(url)
        if not response:
            return findings
            
        headers = response.headers

        required_headers = {
            'Strict-Transport-Security': {
                'severity': 'MEDIUM',
                'cwe_id': 'CWE-319',
                'remediation': 'Set HSTS header with max-age and includeSubDomains.'
            },
            'Content-Security-Policy':{
                'severity': 'HIGH',
                'cwe_id': 'CWE-693',
                'remediation': 'Define a CSP policy to prevent XSS  and data injection.'
            },
            'X-Frame-Options': {
                'severity': 'MEDIUM',
                'cwe_id': 'CWE-693',
                'remediation': 'Set X-Frame-Options: DENY or SAMEORIGIN.'
            },
            'X-Content-Type-Options': {
                'severity': 'LOW',
                'cwe_id': 'CWE-693',
                'remediation': 'Set X-Content-Type-Options: nosniff.'
            },
            'Referrer-Policy': {
                'severity': 'LOW',
                'cwe_id': 'CWE-693',
                'remediation': 'Set Referer-Policy: strict-origin-when-cross-origin.'
            },

        }

        for header, info in required_headers.items():
            if header not in headers:
                findings.append({
                    'url': url,
                    'parameter': 'header',
                    'payload': header,
                    'vuln_type': 'Missing Security Header',
                    'severity': info['severity'],
                    'cvss_score': 5.0 if info['severity'] == 'MEDIUM' else 3.0,
                    'cwe_id': info['cwe_id'],
                    'evidence': f"Missing {header} header.",
                    'remediation': info['remediation']
                })
    except Exception:
        pass

    return findings