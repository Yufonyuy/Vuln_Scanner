import asyncio
from urllib.parse import urlparse, parse_qs

async def check_idor(url, client=None):
    """
    Attempt to detect IDOR by incrementing/decrementing numeric parameters.
    """
    if client is None:
        from apps.scanner.utils.http_client import AsyncHTTPClient
        client = AsyncHTTPClient()

    findings = []
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    for key, values in query.items():
        for val in values:
            if val.isdigit():
                original_val = int(val)
                for delta in [-1, 1, 10, 100]:
                    new_val = original_val + delta
                    if new_val < 0:
                        continue
                    new_query = query.copy()
                    new_query[key] = [str(new_val)]
                    from urllib.parse import urlencode, urlunparse
                    new_url = urlunparse(parsed._replace(query=urlencode(new_query, doseq=True)))
                    try:
                        response = await client.get(new_url)
                        # Simple heuristic: if status is 200 and content differs, it might be IDOR
                        # This is a very basic check; a full IDOR scanner is more complex.
                        if response.status_code == 200:
                            # If the response body size differs significantly
                            original_response = await client.get(url)
                            if len(response.text) != len(original_response.text):
                                findings.append({
                                    'url': url,
                                    'parameter': key,
                                    'payload': str(new_val),
                                    'vuln_type': 'IDOR (Potential)',
                                    'severity': 'High',
                                    'cvss_score': 7.5,
                                    'cwe_id': 'CWE-639',
                                    'evidence': f"Changed parameter {key} from {val} to {new_val} returned different content.",
                                    'remediation': 'Implement proper authorization checks for all object references.'
                                })
                                break
                    except Exception:
                        pass
                break
    return findings