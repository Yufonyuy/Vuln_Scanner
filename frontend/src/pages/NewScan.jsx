import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { startScan } from '../api';
import LoadingSpinner from '../components/LoadingSpinner';

const authTabs = [
  { id: 'none', label: 'Unauthenticated' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'bearer', label: 'Bearer Token' },
  { id: 'basic', label: 'Basic Auth' },
  { id: 'login', label: 'Login Form' },
];

export default function NewScan() {
  const [url, setUrl] = useState('https://');
  const [depth, setDepth] = useState(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState('none');
  const [cookies, setCookies] = useState('');
  const [bearerToken, setBearerToken] = useState('');
  const [basicUser, setBasicUser] = useState('');
  const [basicPass, setBasicPass] = useState('');
  const [loginUrl, setLoginUrl] = useState('');
  const [loginUserField, setLoginUserField] = useState('username');
  const [loginPassField, setLoginPassField] = useState('password');
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const navigate = useNavigate();

  const buildAuthConfig = () => {
    if (authMode === 'bearer' && bearerToken.trim()) {
      return { type: 'bearer', token: bearerToken.trim() };
    }
    if (authMode === 'basic' && basicUser.trim()) {
      return { type: 'basic', username: basicUser, password: basicPass };
    }
    if (authMode === 'login' && loginUrl.trim()) {
      return {
        type: 'login',
        login_url: loginUrl.trim(),
        username_field: loginUserField.trim() || 'username',
        password_field: loginPassField.trim() || 'password',
        username: loginUser,
        password: loginPass,
      };
    }
    return {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await startScan({
        url,
        depth,
        cookies: authMode === 'cookies' ? cookies : '',
        auth_config: buildAuthConfig(),
      });
      navigate(`/scan/${res.data.id}`);
    } catch (err) {
      const detail =
        err.response?.data?.url?.[0] ||
        err.response?.data?.auth_config?.[0] ||
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.[0] ||
        err.message ||
        'Failed to start scan';
      setError(detail);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link to="/" className="text-sm text-sky-300 transition hover:text-sky-200">
          ← Back to Dashboard
        </Link>
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-sky-300/70">New Assessment</p>
          <h1 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">Configure Authenticated Scan</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-400">
            Attach cookies, bearer tokens, basic auth, or perform an automated login so the crawler and active checks can reach authenticated surfaces.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="glass-panel rounded-3xl">
          <div className="border-b border-white/5 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-semibold text-white">Target Configuration</h2>
            <p className="mt-1 text-sm text-gray-500">Define scope and crawl depth for this assessment.</p>
          </div>
          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium text-gray-300">
                Target URL
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                placeholder="https://example.com"
                required
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="depth" className="text-sm font-medium text-gray-300">
                  Crawl Depth
                </label>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">{depth}</span>
              </div>
              <input
                id="depth"
                type="range"
                min="1"
                max="5"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                className="w-full accent-emerald-400"
              />
              <div className="flex justify-between text-xs text-gray-600">
                <span>1 - Shallow</span>
                <span>3 - Balanced</span>
                <span>5 - Deep</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-3xl">
          <div className="border-b border-white/5 px-6 py-6 sm:px-8">
            <h2 className="text-xl font-semibold text-white">Authentication & Session</h2>
            <p className="mt-1 text-sm text-gray-500">Attach credentials so the scanner can test authenticated endpoints.</p>
          </div>
          <div className="space-y-6 px-6 py-6 sm:px-8">
            <div className="flex flex-wrap gap-2">
              {authTabs.map((tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() => setAuthMode(tab.id)}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    authMode === tab.id
                      ? 'bg-gradient-to-r from-sky-400 to-emerald-400 text-[#05070d]'
                      : 'border border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {authMode === 'none' && (
              <div className="rounded-2xl border border-white/5 bg-[#05070d]/40 p-5 text-sm text-gray-400">
                Scanning unauthenticated surfaces only. Switch to a tab above to include session data.
              </div>
            )}

            {authMode === 'cookies' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Raw Cookie String</label>
                <textarea
                  value={cookies}
                  onChange={(e) => setCookies(e.target.value)}
                  rows={5}
                  placeholder="sessionid=...; csrftoken=...; auth_token=..."
                  className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-sm text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                />
                <p className="text-xs text-gray-500">These cookies are attached to every crawler and vulnerability check request.</p>
              </div>
            )}

            {authMode === 'bearer' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Bearer Token</label>
                <input
                  value={bearerToken}
                  onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                />
                <p className="text-xs text-gray-500">Sent as Authorization: Bearer &lt;token&gt;</p>
              </div>
            )}

            {authMode === 'basic' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Username</label>
                  <input
                    value={basicUser}
                    onChange={(e) => setBasicUser(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <input
                    type="password"
                    value={basicPass}
                    onChange={(e) => setBasicPass(e.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                  />
                </div>
              </div>
            )}

            {authMode === 'login' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Login Endpoint URL</label>
                  <input
                    value={loginUrl}
                    onChange={(e) => setLoginUrl(e.target.value)}
                    placeholder="https://example.com/login"
                    className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Username Field Name</label>
                    <input
                      value={loginUserField}
                      onChange={(e) => setLoginUserField(e.target.value)}
                      placeholder="username / email"
                      className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password Field Name</label>
                    <input
                      value={loginPassField}
                      onChange={(e) => setLoginPassField(e.target.value)}
                      placeholder="password"
                      className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Username/Email</label>
                    <input
                      value={loginUser}
                      onChange={(e) => setLoginUser(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <input
                      type="password"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-[#05070d]/60 px-4 py-3 text-gray-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-400/10"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">The scanner will POST to the login endpoint, follow redirects, and reuse captured session cookies.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-6 py-4 text-sm text-rose-200">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="group relative inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-8 py-4 text-lg font-medium text-[#05070d] shadow-[0_80px_160px_-100px_rgba(56,189,248,0.9)] transition disabled:opacity-60 sm:w-auto"
          >
            <span className="relative z-10 flex items-center gap-3">
              {loading ? <LoadingSpinner size="w-5 h-5" /> : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
              {loading ? 'Initializing Assessment...' : 'Launch Scan'}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-white/25 transition-transform duration-700 group-hover:translate-x-0" />
          </button>
        </div>
      </form>
    </div>
  );
}