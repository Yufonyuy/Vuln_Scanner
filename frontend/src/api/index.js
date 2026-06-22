import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const WS_BASE = import.meta.env.VITE_WS_URL || 
  (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const startScan = (url, depth) => api.post('/scans/', { url, depth });
export const getScans = () => api.get('/scans/');
export const getScan = (id) => api.get(`/scans/${id}/`);
export const getFindings = (id, page = 1) => api.get(`/scans/${id}/findings/?page=${page}`);
export const exportReport = (id) => api.get(`/scans/${id}/export/`);
export const getWebSocketUrl = (scanId) => `${WS_BASE}/scan/${scanId}/`;