import asyncio
from urllib.parse import urlparse, urljoin

async def check_open_redirect(url, client=None):
    """
    Test for open redirects by injecting external domains.
    """
    if client is None:
        from apps.scanner.utils.http_client import AsyncHTTPClient
        client = AsyncHTTPClient()

    findings = []
    params = ['redirect', 'url', 'next', 'return', 'goto', 'out']
    external = 'https://evil.com'
    for param in params:
        test_url = f"{url}?{param}={external}"
        try:
            response = await client.get(test_url, allow_redirects=False)
            if response.status_code in (301, 302, 303, 307):
                location = response.headers.get('location', '')
                if external in location:
                    findings.append({
                        'url': url,
                        'parameter': param,
                        'payload': external,
                        'vuln_type': 'Open Redirect',
                        'severity': 'Medium',
                        'cvss_score': 5.0,
                        'cwe_id': 'CWE-601',
                        'evidence': f"Redirect to {external}.",
                        'remediation': 'Validate redirect URLs against a whitelist.'
                    })
        except Exception:
            pass
    return findings