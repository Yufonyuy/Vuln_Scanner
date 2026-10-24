import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanDetail from './pages/ScanDetail';

function AppShell({ children }) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_70%)]" />
      <div className="pointer-events-none absolute -top-40 right-[-20%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(52,211,153,0.1),transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-60 left-[-25%] h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)] blur-3xl" />
      <header className="relative z-10 border-b border-white/5 bg-[#05070d]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 opacity-80 blur-lg" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400/90 to-emerald-400/90 text-[#05070d]">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7.794 4.5v9L12 21l-7.794-4.5v-9L12 3z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6M9 12h6" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-sky-300/80">Web</p>
              <p className="text-lg font-semibold text-white">Pentest Suite</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="rounded-full px-4 py-2 text-gray-400 transition hover:text-white">Dashboard</Link>
            <Link
              to="/new"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 px-5 py-2 font-medium text-[#05070d] shadow-[0_40px_80px_-60px_rgba(56,189,248,0.9)] transition hover:shadow-[0_40px_90px_-50px_rgba(52,211,153,0.9)]"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                New Scan
              </span>
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-0" />
            </Link>
          </nav>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new" element={<NewScan />} />
          <Route path="/scan/:id" element={<ScanDetail />} />
          <Route path="*" element={<div className="glass-panel mx-auto mt-20 max-w-lg rounded-2xl p-10 text-center text-gray-400">Page not found</div>} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;