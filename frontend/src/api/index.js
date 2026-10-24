import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';
const WS_BASE =
  import.meta.env.VITE_WS_URL ||
  (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const startScan = (payload) => {
  const body = {
    url: payload.url,
    depth: payload.depth ?? 2,
  };
  if (payload.headers && Object.keys(payload.headers).length > 0) {
    body.headers = payload.headers;
  }
  if (typeof payload.cookies === 'string' && payload.cookies.trim()) {
    body.cookies = payload.cookies.trim();
  }
  if (payload.auth_config && payload.auth_config.type) {
    body.auth_config = payload.auth_config;
  }
  return api.post('/scans/', body);
};

export const getScans = () => api.get('/scans/');
export const getScan = (id) => api.get(`/scans/${id}/`);
export const getFindings = (id, page = 1) => api.get(`/scans/${id}/findings/?page=${page}`);
export const exportReport = (id) => api.get(`/scans/${id}/export/`);
export const exportPdf = (id) => window.open(`${API_BASE}/scans/${id}/export/pdf/`, '_blank');
export const getWebSocketUrl = (scanId) => `${WS_BASE}/scan/${scanId}/`;