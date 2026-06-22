import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { startScan } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function NewScan() {
  const [url, setUrl] = useState('https://');
  const [depth, setDepth] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await startScan(url, depth);
      navigate(`/scan/${res.data.id}`);
    } catch (err) {
      const detail = err.response?.data?.detail || err.message || 'Failed to start scan';
      setError(detail);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl w-full max-w-md p-8">
        <Link to="/" className="text-blue-400 hover:underline text-sm mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-100 mb-6">Start New Scan</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
              Target URL
            </label>
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="https://example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="depth" className="block text-sm font-medium text-gray-300 mb-1">
              Crawl Depth: <span className="text-green-400">{depth}</span>
            </label>
            <input
              id="depth"
              type="range"
              min="0"
              max="10"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0 (root)</span>
              <span>10 (deep)</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-300 p-3 rounded text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            {loading ? (
              <>
                <LoadingSpinner size="w-5 h-5" />
                <span className="ml-2">Starting...</span>
              </>
            ) : (
              'Start Scan'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}