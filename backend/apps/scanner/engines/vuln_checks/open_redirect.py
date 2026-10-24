import asyncio
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

async def check_open_redirect(url, client=None):
    """
    Test for open redirects by injecting external domains.
    """
    if client is None:
        from apps.scanner.utils.http_client import AsyncHTTPClient
        client = AsyncHTTPClient()

    findings = []
    external = 'https://evil.com'
    
    parsed_url = urlparse(url)
    current_params = parse_qs(parsed_url.query)
    
    if not current_params:
        current_params = {'redirect': ['']}

    for param_key in current_params.keys():
        test_params = current_params.copy()
        test_params[param_key] = [external]
        
        new_query = urlencode(test_params, doseq=True)
        test_url = urlunparse(parsed_url._replace(query=new_query))
        
        try:
            response = await client.get(test_url, allow_redirects=False)
            if response and response.status_code in (301, 302, 303, 307, 308):
                location = response.headers.get('location', '')
                if external in location:
                    findings.append({
                        'url': url,
                        'parameter': param_key,
                        'payload': external,
                        'vuln_type': 'Open Redirect',
                        'severity': 'MEDIUM',
                        'cvss_score': 5.0,
                        'cwe_id': 'CWE-601',
                        'evidence': f"Redirect to {external}.",
                        'remediation': 'Validate redirect URLs against a whitelist.'
                    })
        except Exception:
            pass
    return findings