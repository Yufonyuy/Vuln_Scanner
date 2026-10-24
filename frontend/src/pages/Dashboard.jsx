import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getScans } from '../api';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

function StatCard({ label, value, accent }) {
  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-6">
      <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl ${accent}`} />
      <div className="relative">
        <p className="text-sm uppercase tracking-[0.3em] text-gray-500">{label}</p>
        <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getScans()
      .then((res) => {
        const data = res.data.results || res.data;
        setScans(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('API error:', err);
        setError('Failed to load scans. Please try again.');
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: 'Total Scans', value: scans.length, accent: 'bg-sky-400/10' },
    { label: 'Running', value: scans.filter((s) => (s.status || '').toUpperCase() === 'RUNNING').length, accent: 'bg-amber-400/10' },
    { label: 'Completed', value: scans.filter((s) => (s.status || '').toUpperCase() === 'COMPLETED').length, accent: 'bg-emerald-400/10' },
    { label: 'Findings', value: scans.reduce((sum, s) => sum + (s.finding_count || 0), 0), accent: 'bg-rose-400/10' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="glass-panel max-w-md rounded-2xl border border-rose-400/40 p-8 text-center">
          <h2 className="text-xl font-semibold text-rose-200">Something went wrong</h2>
          <p className="mt-2 text-sm text-gray-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-full bg-rose-500/80 px-6 py-2 text-sm font-medium text-white transition hover:bg-rose-400"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-sky-300/70">Overview</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Security Operations Dashboard</h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-400">
            Monitor authenticated scans, live progress, and validated findings from a single command center.
          </p>
        </div>
        <Link
          to="/new"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-6 py-3 font-medium text-[#05070d] shadow-[0_60px_120px_-80px_rgba(56,189,248,0.9)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            Launch New Assessment
          </span>
          <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-0" />
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="glass-panel rounded-3xl">
        <div className="flex flex-col gap-4 border-b border-white/5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent Assessments</h2>
            <p className="mt-1 text-sm text-gray-500">Track every scan with live status and discovery metrics.</p>
          </div>
          <Link to="/new" className="text-sm text-sky-300 transition hover:text-sky-200">
            Start a new scan →
          </Link>
        </div>
        {scans.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center sm:px-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-400/20 to-emerald-400/20">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-sky-300" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12M6 12h12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-white">No assessments yet</p>
              <p className="mt-1 text-sm text-gray-500">Launch your first authenticated or unauthenticated scan to see results here.</p>
            </div>
            <Link
              to="/new"
              className="rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-6 py-2 text-sm font-medium text-[#05070d]"
            >
              Create Scan
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="px-6 py-4 font-medium sm:px-8">Target</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Progress</th>
                  <th className="px-4 py-4 font-medium">Discoveries</th>
                  <th className="px-4 py-4 font-medium">Findings</th>
                  <th className="px-4 py-4 font-medium">Started</th>
                  <th className="px-6 py-4 text-right font-medium sm:px-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scans.map((scan) => {
                  const targetUrl = scan.target?.url || scan.target;
                  return (
                    <tr key={scan.id} className="group transition hover:bg-white/[0.01]">
                      <td className="px-6 py-5 sm:px-8">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/20 to-emerald-400/20 text-sky-300">
                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-white">{targetUrl}</p>
                            <p className="mt-1 text-xs text-gray-500">Depth {scan.depth}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <StatusBadge status={scan.status} />
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/5">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 transition-all duration-700"
                              style={{ width: `${Math.min(Math.max(scan.progress || 0, 0), 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{scan.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-5 text-gray-400">{scan.discovered_urls?.length || 0} URLs • {scan.forms_found?.length || 0} Forms</td>
                      <td className="px-4 py-5">
                        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">{scan.finding_count || 0}</span>
                      </td>
                      <td className="px-4 py-5 text-xs text-gray-500">{scan.started_at ? new Date(scan.started_at).toLocaleString() : '—'}</td>
                      <td className="px-6 py-5 text-right sm:px-8">
                        <Link to={`/scan/${scan.id}`} className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-sky-300 transition hover:bg-white/5 hover:text-sky-200">
                          View Report
                          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}