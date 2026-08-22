import asyncio
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from apps.scanner.utils.http_client import AsyncHTTPClient

async def check_xss(url, client=None):
    """
    Test for Reflected Cross-Site Scripting (XSS).
    
    Dynamically fuzzes all parameters identified in the URL by injecting 
    a series of malicious JavaScript payloads. It then analyzes the DOM response 
    to see if the payload is reflected unsanitized in the HTML body.
    """
    if client is None:
        client = AsyncHTTPClient()

    findings = []
    
    # Common polyglot and standard XSS payloads
    payloads = [
        "<script>alert('XSS')</script>",
        "<img src=x onerror=alert(1)>",
        "javascript:alert('XSS')",
        "'><script>alert(1)</script>",
        "\"><script>alert(1)</script>",
        "'';!--\"<XSS>=&{()}",
    ]

    # Extract all parameters from the requested target URL
    parsed_url = urlparse(url)
    current_params = parse_qs(parsed_url.query)
    
    # Fallback to test search query parameters if none exist
    if not current_params:
        current_params = {'q': ['']}

    for param_key in current_params.keys():
        for payload in payloads:
            test_params = current_params.copy()
            test_params[param_key] = [payload]
            
            # Re-assemble URL with our payload
            new_query = urlencode(test_params, doseq=True)
            test_url = urlunparse(parsed_url._replace(query=new_query))
            
            try:
                response = await client.get(test_url)
                
                # Check if the exact un-encoded payload is reflected in the source code
                if response and payload in response.text:
                    findings.append({
                        'url': url,
                        'parameter': param_key,
                        'payload': payload,
                        'vuln_type': 'Reflected XSS',
                        'severity': 'HIGH',
                        'cvss_score': 7.0,
                        'cwe_id': 'CWE-79',
                        'evidence': f"Payload reflected: {payload[:50]}...",
                        'remediation': 'Encode output, utilize Content Security Policy (CSP), validate all inputs.'
                    })
                    break # Stop testing this parameter once vulnerability is found
            except Exception:
                pass
    
    return findings