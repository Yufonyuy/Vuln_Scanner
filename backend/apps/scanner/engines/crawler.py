# Grabs All links and forms from a page.

from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

class Crawler:
    def __init__(self, base_url, http_client, depth=2):
        self.base_url = base_url
        self.client = http_client  # Fixed naming match
        self.depth = depth
        self.visited = set()
        self.discovered_urls = []
        self.forms = []

    async def crawl(self, url, current_depth=0):
        # 1. Termination condition rules
        if current_depth > self.depth or url in self.visited:
            return
        self.visited.add(url)

        # 2. Fetch page using our custom HTTP Client
        resp = await self.client.fetch(url)  # Fixed typo: 'cleint' -> 'client'
        if not resp or resp.status_code != 200:
            return
        
        soup = BeautifulSoup(resp.text, 'lxml')

        # 3. Extract all links and handle recursion depth
        for link in soup.find_all('a', href=True):
            full_url = urljoin(url, link['href'])
            
            # Verify the link belongs to our target site (In-Scope Verification)
            if urlparse(full_url).netloc == urlparse(self.base_url).netloc:
                if full_url not in self.discovered_urls:
                    self.discovered_urls.append(full_url)
                # Recursively descend to the next level of pages
                await self.crawl(full_url, current_depth + 1)  # Fixed syntax error: '= +' -> ' + '

        # 4. Extract input areas for future vulnerability injection testing
        for form in soup.find_all('form'):
            action = form.get('action')
            method = form.get('method', 'GET').upper()
            inputs = []
            
            for inp in form.find_all('input'):
                name = inp.get('name')
                if name: 
                    inputs.append({
                        'name': name,
                        'type': inp.get('type', 'text'),  # Fixed missing string quotes
                        'value': inp.get('value', '')
                    })
            
            # Save the structural map of the form to our platform repository
            self.forms.append({
                'action': urljoin(url, action) if action else url,
                'method': method,
                'inputs': inputs
            })
    # Inside Crawler class, add method to submit forms with dummy data
async def submit_forms(self, url, soup):
    """Find forms and submit them with dummy data to discover new endpoints."""
    forms = soup.find_all('form')
    for form in forms:
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
            # Fill with dummy values
            if typ == 'email':
                data[name] = 'test@example.com'
            elif typ == 'password':
                data[name] = 'password123'
            elif typ == 'number':
                data[name] = '1'
            elif typ == 'checkbox' or typ == 'radio':
                data[name] = 'on'
            else:
                data[name] = 'test'
        # If there's a textarea, also add dummy
        textareas = form.find_all('textarea')
        for ta in textareas:
            name = ta.get('name')
            if name:
                data[name] = 'test content'
        # Submit
        try:
            full_url = urljoin(url, action)
            if method == 'post':
                resp = await self.client.post(full_url, data=data)
            else:
                resp = await self.client.get(full_url, params=data)
            # Extract any new links from response
            new_soup = BeautifulSoup(resp.text, 'html.parser')
            new_links = self.extract_links(full_url, new_soup)
            self.discovered_urls.extend(new_links)
        except Exception as e:
            self.logger.error(f"Form submission failed: {e}")