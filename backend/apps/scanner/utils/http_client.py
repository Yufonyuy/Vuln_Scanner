import asyncio
import httpx
from urllib.parse import urlparse

class AsyncHTTPClient:
    def __init__(self, rate_limit=10, timeout=60.0):
        self.semaphore = asyncio.Semaphore(rate_limit)
        self.timeout = timeout
        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(timeout, connect=10.0),  # more granular
            follow_redirects=True,
            headers={"User-Agent": "PentestSuite/1.0"}
        )

    async def fetch(self, url):
        async with self.semaphore:
            try:
                resp = await self.client.get(url)
                return resp
            except httpx.TimeoutException:
                print(f"Timeout fetching {url}")
                return None
            except Exception as e:
                print(f"Error fetching {url}: {e}")
                return None

    async def close(self):
        await self.client.aclose()