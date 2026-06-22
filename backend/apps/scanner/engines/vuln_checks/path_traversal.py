import asyncio
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

    for payload in payloads:
        test_url = f"{url}?file={payload}"
        try:
            response = await client.get(test_url)
            # Check for common file content indicators
            if 'root:' in response.text or '[extensions]' in response.text:
                findings.append({
                    'url': url,
                    'parameter': payload,
                    'vuln_type': 'Path Traversal',
                    'severity': 'High',
                    'cvss_score': 7.5,
                    'cwe_id': 'CWE-22',
                    'evidence': f"File content detected: {response.text[:100]}...",
                    'remediation': 'Validate file paths, use whitelist.'
                })
                break
        except Exception:
            pass

    return findings