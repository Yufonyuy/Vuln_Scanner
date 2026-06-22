import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getScan, getFindings, getWebSocketUrl } from '../api';
import { useWebSocket } from '../utils/websocket';
import ProgressBar from '../components/ProgressBar';
import FindingsList from '../components/FindingsList';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ScanDetail() {
  const { id } = useParams();
  const [scan, setScan] = useState(null);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // WebSocket connection
  const wsUrl = getWebSocketUrl(id);
  const handleMessage = useCallback((data) => {
    if (data.type === 'progress') {
      setScan((prev) => prev ? { ...prev, ...data.data } : data.data);
    } else if (data.type === 'finding') {
      setFindings((prev) => [...prev, data.data]);
    } else if (data.type === 'log') {
      console.log('Log:', data.data.message);
    }
  }, []);

  const { isConnected } = useWebSocket(wsUrl, handleMessage);

  // Fetch initial scan data
  useEffect(() => {
    getScan(id)
      .then((res) => {
        setScan(res.data);
        if (res.data.status === 'completed') {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <LoadingSpinner size="w-12 h-12" />
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-6 rounded-lg">
          {error || 'Scan not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link to="/" className="text-blue-400 hover:underline text-sm">
            &larr; Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              WebSocket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
            <span className="text-sm text-gray-400">
              Status: <StatusBadge status={scan.status} />
            </span>
          </div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 shadow-lg mb-8">
          {/* ✅ FIXED: safely access nested target.url */}
          <h2 className="text-2xl font-bold text-gray-100 break-all">
            {scan.target?.url || scan.target}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
            <div>
              <span className="text-gray-400">Depth:</span> {scan.depth}
            </div>
            <div>
              <span className="text-gray-400">Discovered URLs:</span> {scan.discovered_urls?.length || 0}
            </div>
            <div>
              <span className="text-gray-400">Forms:</span> {scan.forms_found?.length || 0}
            </div>
            <div>
              <span className="text-gray-400">Findings:</span> {findings.length}
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar progress={scan.progress} stage={scan.current_stage} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-200 mb-4">Findings</h3>
          <FindingsList findings={findings} />
          {scan.status === 'completed' && findings.length === 0 && (
            <p className="text-gray-500 text-sm mt-4">No vulnerabilities found.</p>
          )}
        </div>
      </div>
    </div>
  );
}