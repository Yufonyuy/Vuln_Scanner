import asyncio
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

async def check_ssrf(url, client=None):
    """
    Test for SSRF by attempting to fetch internal URLs via common parameters.
    
    This function parses the given URL, dynamically extracts query parameters, 
    and iterates over them, replacing their values with common internal network addresses
    (e.g., localhost, AWS metadata endpoint). It then checks the response to see if 
    any internal server information was successfully returned.
    """
    if client is None:
        from apps.scanner.utils.http_client import AsyncHTTPClient
        client = AsyncHTTPClient()

    findings = []
    # High-value internal targets typically tested for SSRF
    internal_hosts = ['127.0.0.1', 'localhost', '169.254.169.254', '0.0.0.0']

    # 1. Parse active URL queries to target dynamically
    parsed_url = urlparse(url)
    current_params = parse_qs(parsed_url.query)
    
    # 2. Fallback: If no parameters exist, force a 'url' parameter
    if not current_params:
        current_params = {'url': ['']}

    # 3. Iterate and inject payloads into every parameter individually
    for param_key in current_params.keys():
        for host in internal_hosts:
            test_params = current_params.copy()
            test_params[param_key] = [host]
            
            # Reconstruct the URL string with the injected SSRF payload
            new_query = urlencode(test_params, doseq=True)
            test_url = urlunparse(parsed_url._replace(query=new_query))
            
            try:
                response = await client.get(test_url)
                # Heuristic: Check if the response contains keywords common to internal panels/metadata
                if response and ('root' in response.text or 'ec2' in response.text or 'admin' in response.text):
                    findings.append({
                        'url': url,
                        'parameter': param_key,
                        'payload': host,
                        'vuln_type': 'SSRF',
                        'severity': 'HIGH',
                        'cvss_score': 8.2,
                        'cwe_id': 'CWE-918',
                        'evidence': f"Response from {host} detected.",
                        'remediation': 'Validate and sanitize all external URLs. Utilize an allowlist.'
                    })
                    break # Stop testing this parameter once vulnerability is confirmed
            except Exception:
                pass
    return findings