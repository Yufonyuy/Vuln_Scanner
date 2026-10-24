import asyncio
import httpx
from urllib.parse import urlparse

class AsyncHTTPClient:
    def __init__(self, rate_limit=10, timeout=60.0, headers=None, cookies=None, auth_config=None):
        self.semaphore = asyncio.Semaphore(rate_limit)
        self.timeout = timeout
        self.cookies = cookies or ''
        self.auth_config = auth_config or {}

        default_headers = {"User-Agent": "PentestSuite/1.0"}
        if headers:
            default_headers.update(headers)

        self.client = httpx.AsyncClient(
            timeout=httpx.Timeout(timeout, connect=10.0),
            follow_redirects=True,
            headers=default_headers,
            cookies=self._parse_cookies(self.cookies),
        )

        if self.auth_config.get('type') == 'bearer' and self.auth_config.get('token'):
            self.client.headers['Authorization'] = f"Bearer {self.auth_config.get('token')}"

        if self.auth_config.get('type') == 'basic':
            self.client.auth = httpx.BasicAuth(
                self.auth_config.get('username', ''),
                self.auth_config.get('password', ''),
            )

    @staticmethod
    def _parse_cookies(cookies):
        parsed = {}
        if isinstance(cookies, dict):
            return cookies
        if isinstance(cookies, str):
            for part in cookies.split(';'):
                if '=' in part:
                    key, value = part.strip().split('=', 1)
                    parsed[key] = value
        return parsed

    async def authenticate(self):
        """Perform form-based login if configured, capturing resulting session cookies."""
        if self.auth_config.get('type') != 'login':
            return True
        login_url = self.auth_config.get('login_url', '')
        username_field = self.auth_config.get('username_field', 'username')
        password_field = self.auth_config.get('password_field', 'password')
        username = self.auth_config.get('username', '')
        password = self.auth_config.get('password', '')
        try:
            async with self.semaphore:
                resp = await self.client.post(
                    login_url,
                    data={username_field: username, password_field: password},
                    follow_redirects=True,
                )
            return resp is not None
        except Exception as e:
            print(f"Login failed for {login_url}: {e}")
            return False

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