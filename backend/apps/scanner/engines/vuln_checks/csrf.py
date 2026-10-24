import asyncio
from bs4 import BeautifulSoup
from urllib.parse import urljoin

async def check_csrf(url, client=None):
    """
    Check forms for missing CSRF tokens.
    Returns findings for forms without apparent CSRF protection.
    """
    if client is None:
        from apps.scanner.utils.http_client import AsyncHTTPClient
        client = AsyncHTTPClient()

    findings = []
    try:
        response = await client.get(url)
        if not response:
            return findings
            
        soup = BeautifulSoup(response.text, 'html.parser')
        forms = soup.find_all('form')
        for form in forms:
            action = form.get('action', '')
            method = form.get('method', 'get').lower()
            # Look for common CSRF token input names
            inputs = form.find_all('input')
            token_names = {'csrf', 'csrf_token', 'authenticity_token', '_token', 'xsrf-token'}
            has_token = any(
                inp.get('name', '').lower() in token_names or
                inp.get('id', '').lower() in token_names
                for inp in inputs
            )
            if not has_token and method != 'get':
                findings.append({
                    'url': url,
                    'parameter': 'form_action',
                    'payload': action,
                    'vuln_type': 'CSRF (Missing Token)',
                    'severity': 'MEDIUM',
                    'cvss_score': 6.5,
                    'cwe_id': 'CWE-352',
                    'evidence': f"Form action '{action}' lacks CSRF token.",
                    'remediation': 'Implement anti-CSRF tokens for all state-changing requests.'
                })
    except Exception:
        pass
    return findings