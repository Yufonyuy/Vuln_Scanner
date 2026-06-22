import asyncio
from apps.scanner.utils.http_client import AsyncHTTPClient

async def check_xss(url, client=None):
    """
    Test for reflected XSS using common payloads.
    Returns a list of findings (dict) or empty list.
    """
    if client is None:
        client = AsyncHTTPClient()

    findings = []
    payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert(1)>",
        "javascript:alert('XSS')",
        "'><script>alert(1)</script>",
        "\"><script>alert(1)</script>",
        "'';!--\"<XSS>=&{()}",
    ]


    for payload in payloads:
        # Inject payload into query parameter 'q' (common)
        test_url = f"{url}?q={payload}"
        try:
            response = await client.get(test_url)
            # Check if payload is reflected in response body 
            if payload in response.text:
                findings.append({
                    'url':url,
                    'parameter': 'q',
                    'payload': payload,
                    'vuln_type': 'Reflected XSS',
                    'severity': 'High',
                    'cvss_score': 7.0,
                    'cwe_id': 'CWE-79',
                    'evidence': f"Payload reflected: {payload[:50]}...",
                    'remediation': 'Encode output, use CSP, validate input'
                })
                # Only one finding per URL for now (first payload that works)

                break
        except Exception:
            pass
    
    return findings