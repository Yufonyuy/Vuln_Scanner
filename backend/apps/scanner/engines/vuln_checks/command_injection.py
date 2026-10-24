import asyncio
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from apps.scanner.utils.http_client import AsyncHTTPClient

async def check_command_injection(url, client=None):
    """
    Test for OS command injection via common payloads.
    """
    if client is None:
        client = AsyncHTTPClient()

    findings = []
    payloads = [
        "; ls",
        "| ls",
        "|| ls",
        "& ls",
        "&& ls",
        "$(ls)",
        "`ls`",
    ]
    
    parsed_url = urlparse(url)
    current_params = parse_qs(parsed_url.query)
    
    if not current_params:
        current_params = {'cmd': ['']}

    for param_key in current_params.keys():
        for payload in payloads:
            test_params = current_params.copy()
            test_params[param_key] = [payload]
            
            new_query = urlencode(test_params, doseq=True)
            test_url = urlunparse(parsed_url._replace(query=new_query))
            
            try:
                response = await client.get(test_url)
                if response and any(indicator in response.text for indicator in ['root:', 'bin', 'etc', 'usr', 'var', 'boot']):
                    findings.append({
                        'url': url,
                        'parameter': param_key,
                        'payload': payload,
                        'vuln_type': 'Command Injection',
                        'severity': 'CRITICAL',
                        'cvss_score': 9.0,
                        'cwe_id': 'CWE-78',
                        'evidence': f"Possible command output detected.",
                        'remediation': 'Avoid system calls, use parameterized APIs'
                    })
                    break
            except Exception:
                pass

    return findings