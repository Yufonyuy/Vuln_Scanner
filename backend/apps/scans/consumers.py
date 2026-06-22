import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Scan


class ScanConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.scan_id = self.scope['url_route']['kwargs']['scan_id']
        self.groups_name = f'scan_{self.scan_id}'

        # Check if scan exists (optional)
        exists = await self.scan_exists()
        if not exists: 
            await self.close()
            return
        
        # Join group 
        await self.channel_layer.group_add(
            self.groups_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave group
        await self.channel_layer.group_discard(
            self.groups_name,
            self.channel_name
        )

    # Recieve message from WebSocket (not used, we only send)
    async def receive(self, text_data):
        pass

    # Send progress update to the client
    async def send_progress(self, event):
        await self.send(text_data=json.dumps({
            'type': 'progress',
            'data': event['data']
        }))

    # Send finding to the client
    async def send_finding(self, event):
        await self.send(text_data=json.dumps({
            'type': 'finding',
            'data': event['data']
        }))

    # Send log message 
    async def send_log(self, event):
        await self.send(text_data=json.dumps({
            'type': 'log',
            'data': event['data']
        }))

    @database_sync_to_async
    def scan_exists(self):
        return Scan.objects.filter(id=self.scan_id).exists()