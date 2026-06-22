# apps/scanner/engines/js_crawler.py
import asyncio
from playwright.async_api import async_playwright

async def crawl_with_js(start_url, max_pages=10):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto(start_url)
        # Wait for dynamic content
        await page.wait_for_load_state('networkidle')
        # Extract links
        links = await page.eval_on_selector_all('a', 'els => els.map(el => el.href)')
        await browser.close()
        return links