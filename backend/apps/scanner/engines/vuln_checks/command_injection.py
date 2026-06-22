import asyncio
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
    for payload in payloads:
        test_url = f"{url}?cmd={payloads}"
        try:
            response = await client.get(test_url)
            # Look for common command output indicators (simplistic)
            if any(indicator in response.text for indicator in ['root', 'bin', 'etc', 'usr', 'var']):
                findings.append({
                    'url': url,
                    'parameter': 'cmd',
                    'payload': payload,
                    'vuln_type': 'Command Injection',
                    'severity': 'Critical',
                    'cvss_score': 9.0,
                    'cwe_id': 'CWE-78',
                    'evidence': f"Possible command output: {response.text[:100]}...",
                    'remediation': 'Avoid system calls, use parameterized APIs'
                })
                break
        except Exception:
            pass

    return findings