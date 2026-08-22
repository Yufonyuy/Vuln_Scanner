import asyncio
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from apps.scanner.utils.http_client import AsyncHTTPClient

async def check_path_traversal(url, client=None):
    """
    Test for path traversal (directory traversal).
    """
    if client is None:
        client = AsyncHTTPClient()

    findings = []
    payloads = [
        "../../../../etc/passwd",
        "..\\..\\..\\..\\windows\\win.ini",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd",
        "%252e%252e%252f%252e%252e%252fetc%252fpasswd",
    ]

    parsed_url = urlparse(url)
    current_params = parse_qs(parsed_url.query)
    
    if not current_params:
        current_params = {'file': ['']}

    for param_key in current_params.keys():
        for payload in payloads:
            test_params = current_params.copy()
            test_params[param_key] = [payload]
            
            new_query = urlencode(test_params, doseq=True)
            test_url = urlunparse(parsed_url._replace(query=new_query))
            
            try:
                response = await client.get(test_url)
                if response and ('root:' in response.text or '[extensions]' in response.text):
                    findings.append({
                        'url': url,
                        'parameter': param_key,
                        'payload': payload,
                        'vuln_type': 'Path Traversal',
                        'severity': 'HIGH',
                        'cvss_score': 7.5,
                        'cwe_id': 'CWE-22',
                        'evidence': f"File content detected.",
                        'remediation': 'Validate file paths, use whitelist.'
                    })
                    break
            except Exception:
                pass

    return findings