from typing import Optional, Dict

class AuthManager:
    def __init__(self, client):
        self.client = client
        self.session_cookies = {}
        self.headers = {}

    async def login(self, login_url, username, password, **kwargs):
        """Perform login and store session cookies."""
        # Try to find login form
        response = await self.client.get(login_url)
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')
        form = soup.find('form')
        if not form:
            raise ValueError("No login form found")
        action = form.get('action', '')
        method = form.get('method', 'get').lower()
        inputs = form.find_all('input')
        data = {}
        for inp in inputs:
            name = inp.get('name')
            if not name:
                continue
            typ = inp.get('type', 'text').lower()
            if typ in ('submit', 'button', 'reset', 'image'):
                continue
            if 'user' in name.lower() or 'email' in name.lower():
                data[name] = username
            elif 'pass' in name.lower():
                data[name] = password
            else:
                # Preserve other hidden fields
                if inp.get('value'):
                    data[name] = inp.get('value')
        if method == 'post':
            resp = await self.client.post(action, data=data)
        else:
            resp = await self.client.get(action, params=data)
        # Store cookies
        self.session_cookies = resp.cookies
        # Update client with cookies
        self.client.cookies = self.session_cookies
        return resp

    def add_auth_header(self, token_type='Bearer', token=None):
        if token:
            self.headers['Authorization'] = f"{token_type} {token}"
            self.client.headers.update(self.headers)