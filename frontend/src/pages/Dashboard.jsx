import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getScans } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getScans()
      .then((res) => {
        // Handle both array and paginated responses
        const data = res.data.results || res.data;
        setScans(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('API error:', err);
        setError('Failed to load scans. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <LoadingSpinner size="w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-6 rounded-lg max-w-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <Link
            to="/new"
            className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium transition-colors"
          >
            <span className="mr-1">+</span> New Scan
          </Link>
        </div>

        {scans.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-12 text-center">
            <p className="text-gray-400 text-lg">No scans yet. Start your first scan!</p>
            <Link
              to="/new"
              className="mt-4 inline-block px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-medium"
            >
              Start a Scan
            </Link>
          </div>
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-x-auto shadow-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1c2128] border-b border-[#30363d]">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-400">Target</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Progress</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Findings</th>
                  <th className="px-4 py-3 font-medium text-gray-400">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {scans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-[#1c2128] transition-colors">
                    {/* ✅ FIXED: safely access nested target.url */}
                    <td className="px-4 py-3 truncate max-w-xs text-gray-200">
                      {scan.target?.url || scan.target}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={scan.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${scan.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{scan.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-200">{scan.findings_count || 0}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(scan.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/scan/${scan.id}`}
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}