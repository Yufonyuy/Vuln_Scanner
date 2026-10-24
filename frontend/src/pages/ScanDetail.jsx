import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getScan, getFindings, getWebSocketUrl, exportPdf } from '../api';
import { useWebSocket } from '../utils/websocket';
import ProgressBar from '../components/ProgressBar';
import FindingsList from '../components/FindingsList';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

function SeverityCard({ label, count, color }) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-5">
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full blur-3xl ${color}`} />
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-white">{count}</p>
        </div>
      </div>
    </div>
  );
}

export default function ScanDetail() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [findings, setFindings] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const wsUrl = getWebSocketUrl(id);
  const handleMessage = useCallback((data) => {
    if (data.type === 'progress') {
      setScan((prev) => (prev ? { ...prev, ...data.data } : { ...data.data }));
    } else if (data.type === 'finding') {
      setFindings((prev) => {
        if (prev.find((f) => f.id === data.data.id)) return prev;
        return [data.data, ...prev];
      });
    } else if (data.type === 'log') {
      const message = data.data?.message || '';
      const timestamp = new Date().toLocaleTimeString();
      setLogs((prev) => [...prev, { timestamp, message }].slice(-150));
    }
  }, []);

  const { isConnected } = useWebSocket(wsUrl, handleMessage);

  useEffect(() => {
    getScan(id)
      .then((res) => {
        setScan(res.data);
        if (res.data.status === 'completed' || res.data.status === 'COMPLETED') {
          getFindings(id, 1).then((res) => setFindings(res.data.results || res.data));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('API error:', err);
        setError('Failed to load scan details');
        setLoading(false);
      });
  }, [id]);

  const severityCounts = findings.reduce(
    (acc, finding) => {
      const sev = (finding.severity || 'INFO').toUpperCase();
      acc[sev] = (acc[sev] || 0) + 1;
      return acc;
    },
    { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="w-12 h-12" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="glass-panel max-w-md rounded-2xl border border-rose-400/40 p-8 text-center text-rose-200">
          {error || 'Scan not found'}
        </div>
      </div>
    );
  }

  const targetUrl = scan.target?.url || scan.target;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <Link to="/" className="text-sm text-sky-300 transition hover:text-sky-200">
            ← Back to Dashboard
          </Link>
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-sky-300/70">Assessment Report</p>
            <h1 className="mt-3 break-all text-3xl font-semibold text-white sm:text-4xl">{targetUrl}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-gray-400">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]' : 'bg-rose-400'}`} />
            {isConnected ? 'Live Telemetry Connected' : 'Reconnecting...'}
          </div>
          <StatusBadge status={scan.status} />
          <button
            onClick={() => exportPdf(id)}
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-gray-200 transition hover:bg-white/5"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SeverityCard label="Critical" count={severityCounts.CRITICAL} color="bg-rose-500/10" />
        <SeverityCard label="High" count={severityCounts.HIGH} color="bg-orange-500/10" />
        <SeverityCard label="Medium" count={severityCounts.MEDIUM} color="bg-amber-500/10" />
        <SeverityCard label="Low" count={severityCounts.LOW} color="bg-sky-500/10" />
        <SeverityCard label="Informational" count={severityCounts.INFO} color="bg-cyan-500/10" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="glass-panel rounded-3xl">
          <div className="border-b border-white/5 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-semibold text-white">Execution Progress</h2>
            <p className="mt-1 text-sm text-gray-500">Real-time crawl, fingerprinting, and vulnerability testing status.</p>
          </div>
          <div className="space-y-6 px-6 py-6 sm:px-8">
            <ProgressBar progress={scan.progress} stage={scan.current_stage} message={scan.current_stage} />
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/5 bg-[#05070d]/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Depth</p>
                <p className="mt-2 text-2xl font-semibold text-white">{scan.depth}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#05070d]/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">URLs</p>
                <p className="mt-2 text-2xl font-semibold text-white">{scan.discovered_urls?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#05070d]/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Forms</p>
                <p className="mt-2 text-2xl font-semibold text-white">{scan.forms_found?.length || 0}</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#05070d]/40 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Findings</p>
                <p className="mt-2 text-2xl font-semibold text-white">{findings.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel flex flex-col rounded-3xl">
          <div className="border-b border-white/5 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-semibold text-white">Live Scan Log</h2>
            <p className="mt-1 text-sm text-gray-500">Stream of events from the crawler and active scanners.</p>
          </div>
          <div className="relative flex-1 overflow-hidden px-6 py-6 sm:px-8">
            <div className="subtle-grid absolute inset-x-0 top-0 h-full opacity-40" />
            <div className="relative max-h-[420px] space-y-2 overflow-y-auto pr-2 font-mono text-xs">
              {logs.length === 0 ? (
                <div className="flex h-full items-center justify-center text-gray-600">
                  Waiting for scan events...
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex gap-3 text-gray-400">
                    <span className="text-gray-600">[{log.timestamp}]</span>
                    <span className="text-emerald-300/80">›</span>
                    <span className="break-all text-gray-300">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-3xl">
        <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="text-xl font-semibold text-white">Vulnerability Findings</h2>
            <p className="mt-1 text-sm text-gray-500">Detailed evidence, parameters, payloads, and remediation guidance.</p>
          </div>
          <p className="text-sm text-gray-500">{findings.length} discovered</p>
        </div>
        <div className="px-6 py-6 sm:px-8">
          <FindingsList findings={findings} />
          {(scan.status === 'completed' || scan.status === 'COMPLETED') && findings.length === 0 && (
            <div className="mt-6 rounded-2xl border border-white/5 bg-[#05070d]/40 p-8 text-center text-gray-500">
              No vulnerabilities were confirmed during this assessment.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}