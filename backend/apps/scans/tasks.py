import asyncio
from celery import shared_task
from django.utils.timezone import now
from asgiref.sync import sync_to_async
from channels.layers import get_channel_layer
from .models import Target, Scan, Finding, ScanStatusChoices
from apps.scanner.utils.http_client import AsyncHTTPClient
from apps.scanner.engines.crawler import Crawler

# Existing checks
from apps.scanner.engines.vuln_checks.sql_injection import SQLInjectionTest
from apps.scanner.engines.vuln_checks.xss import check_xss
from apps.scanner.engines.vuln_checks.command_injection import check_command_injection
from apps.scanner.engines.vuln_checks.path_traversal import check_path_traversal
from apps.scanner.engines.vuln_checks.security_headers import check_security_headers

# New checks
from apps.scanner.engines.vuln_checks.csrf import check_csrf
from apps.scanner.engines.vuln_checks.ssrf import check_ssrf
from apps.scanner.engines.vuln_checks.idor import check_idor
from apps.scanner.engines.vuln_checks.xxe import check_xxe
from apps.scanner.engines.vuln_checks.open_redirect import check_open_redirect

# Optional: AI analyzer (to be implemented later)
# from apps.scanner.ai_analyzer import analyze_finding


@shared_task(bind=True)
def run_scan_async(self, scan_id, depth=2):
    async def _run():
        # Load scan with target relation
        scan = await sync_to_async(Scan.objects.select_related('target').get)(id=scan_id)
        target_url = await sync_to_async(lambda: scan.target.url)()

        async def save_scan():
            await sync_to_async(scan.save)()

        async def send_update(event_type, data):
            channel_layer = get_channel_layer()
            await channel_layer.group_send(
                f'scan_{scan.id}',
                {'type': event_type, 'data': data}
            )

        scan.status = ScanStatusChoices.RUNNING
        await save_scan()
        await send_update('send_log', {'message': 'Scan started'})

        client = AsyncHTTPClient(rate_limit=10, headers=scan.headers)
        try:
            # ---- Crawl ----
            scan.current_stage = "Crawling the website..."
            await save_scan()
            await send_update('send_progress', {
                'progress': scan.progress,
                'stage': scan.current_stage,
                'message': f"Crawling {target_url}"
            })

            crawler = Crawler(target_url, client, depth=depth)
            await crawler.crawl(target_url)

            scan.discovered_urls = crawler.discovered_urls
            scan.forms_found = crawler.forms
            scan.progress = 30
            await save_scan()
            await send_update('send_progress', {
                'progress': scan.progress,
                'stage': 'Crawling complete',
                'message': f"Found {len(scan.discovered_urls)} URLs and {len(scan.forms_found)} forms"
            })

            # ---- Fingerprinting (placeholder) ----
            scan.current_stage = "Fingerprinting tech stack..."
            scan.progress = 50
            await save_scan()
            await send_update('send_progress', {
                'progress': scan.progress,
                'stage': scan.current_stage,
                'message': "Fingerprinting..."
            })

            # ---- Vulnerability Checks (all 10) ----
            scan.current_stage = "Testing for vulnerabilities..."
            await save_scan()
            await send_update('send_log', {'message': 'Starting parallel vulnerability tests'})

            scannable_urls = list(set([target_url] + crawler.discovered_urls))
            total_urls = len(scannable_urls)
            vuln_results = []

            # All check functions (10 total)
            check_functions = [
                SQLInjectionTest.scan,
                check_xss,
                check_command_injection,
                check_path_traversal,
                check_security_headers,
                check_csrf,
                check_ssrf,
                check_idor,
                check_xxe,
                check_open_redirect,
            ]

            sem = asyncio.Semaphore(3)  # limit concurrent URL scans
            processed_count = 0

            async def scan_single_url(url):
                async with sem:
                    tasks = [func(url, client) for func in check_functions]
                    results = await asyncio.gather(*tasks, return_exceptions=True)
                    url_findings = []
                    for res in results:
                        if isinstance(res, Exception):
                            await send_update('send_log', {'message': f'Error checking {url}: {str(res)}'})
                            continue
                        if res:
                            for finding_data in res:
                                finding_data.setdefault('parameter', '')
                                finding_data.setdefault('payload', '')
                                finding_data.setdefault('evidence', '')
                                finding_data.setdefault('remediation', '')
                                finding_data.setdefault('cvss_score', None)
                                finding_data.setdefault('cwe_id', '')
                                url_findings.append(finding_data)
                    return url, url_findings

            # Process all URLs concurrently with Semaphore
            scan_tasks = [scan_single_url(url) for url in scannable_urls]
            for completed_future in asyncio.as_completed(scan_tasks):
                finished_url, findings_list = await completed_future
                processed_count += 1
                vuln_results.extend(findings_list)

                progress = 50 + int((processed_count / total_urls) * 40)
                scan.progress = min(progress, 90)
                await save_scan()
                await send_update('send_progress', {
                    'progress': scan.progress,
                    'stage': scan.current_stage,
                    'message': f"Tested {finished_url} ({processed_count}/{total_urls})"
                })

            # ---- Save Findings and Broadcast ----
            scan.current_stage = "Saving results..."
            await save_scan()

            for v in vuln_results:
                finding = await sync_to_async(Finding.objects.create)(
                    scan=scan,
                    url=v['url'],
                    parameter=v.get('parameter', ''),
                    payload=v.get('payload', ''),
                    vuln_type=v['vuln_type'],
                    severity=v['severity'],
                    cvss_score=v.get('cvss_score'),
                    cwe_id=v.get('cwe_id', ''),
                    evidence=v.get('evidence', ''),
                    remediation=v.get('remediation', ''),
                )

                # ---- AI Analysis (placeholder - uncomment when ready) ----
                # ai_result = await analyze_finding({
                #     'vuln_type': finding.vuln_type,
                #     'evidence': finding.evidence,
                #     'url': finding.url,
                #     'payload': finding.payload,
                # })
                # finding.ai_confidence = ai_result.get('confidence')
                # finding.ai_analysis_raw = ai_result.get('analysis')
                # await sync_to_async(finding.save)()

                await send_update('send_finding', {
                    'id': str(finding.id),
                    'vuln_type': finding.vuln_type,
                    'severity': finding.severity,
                    'url': finding.url,
                    'parameter': finding.parameter,
                    'payload': finding.payload,
                    'evidence': finding.evidence,
                    'cvss_score': finding.cvss_score,
                    'cwe_id': finding.cwe_id,
                    'remediation': finding.remediation,
                })
                await send_update('send_log', {
                    'message': f"Found {finding.vuln_type} ({finding.severity}) at {finding.url}"
                })

            # ---- Finish ----
            scan.progress = 100
            scan.status = ScanStatusChoices.COMPLETED
            scan.current_stage = "Scan Completed!"
            scan.ended_at = now()
            await save_scan()
            await send_update('send_progress', {
                'progress': 100,
                'stage': 'Completed',
                'message': 'Scan finished successfully'
            })
            await send_update('send_log', {'message': 'Scan completed'})

        except Exception as e:
            scan.status = ScanStatusChoices.FAILED
            scan.current_stage = f"Error: {str(e)}"
            await save_scan()
            await send_update('send_log', {'message': f'Error: {str(e)}'})
            raise e
        finally:
            await client.close()

    asyncio.run(_run())
    return f"Scan {scan_id} completed."