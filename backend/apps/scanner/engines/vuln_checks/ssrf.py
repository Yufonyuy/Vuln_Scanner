import asyncio
from urllib.parse import urlparse, urljoin

async def check_ssrf(url, client=None):
    """
    Test for SSRF by attempting to fetch internal URLs via common parameters.
    """
    if client is None:
        from apps.scanner.utils.http_client import AsyncHTTPClient
        client = AsyncHTTPClient()

    findings = []
    # Common SSRF parameters
    params = ['url', 'dest', 'redirect', 'uri', 'path', 'load', 'file']
    internal_hosts = ['127.0.0.1', 'localhost', '169.254.169.254', '0.0.0.0']
    for param in params:
        for host in internal_hosts:
            test_url = f"{url}?{param}={host}"
            try:
                response = await client.get(test_url)
                # Check if response contains internal content
                if 'root' in response.text or 'ec2' in response.text or 'admin' in response.text:
                    findings.append({
                        'url': url,
                        'parameter': param,
                        'payload': host,
                        'vuln_type': 'SSRF',
                        'severity': 'High',
                        'cvss_score': 8.2,
                        'cwe_id': 'CWE-918',
                        'evidence': f"Response from {host} detected.",
                        'remediation': 'Validate and sanitize all external URLs.'
                    })
                    break
            except Exception:
                pass
    return findings