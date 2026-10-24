import StatusBadge from './StatusBadge';

const severityStyles = {
  CRITICAL: 'border-rose-400/60 bg-gradient-to-r from-rose-500/10 to-transparent',
  HIGH: 'border-orange-400/60 bg-gradient-to-r from-orange-500/10 to-transparent',
  MEDIUM: 'border-amber-400/60 bg-gradient-to-r from-amber-500/10 to-transparent',
  LOW: 'border-sky-400/60 bg-gradient-to-r from-sky-500/10 to-transparent',
  INFO: 'border-cyan-400/60 bg-gradient-to-r from-cyan-500/10 to-transparent',
};

export default function FindingsList({ findings }) {
  if (!findings || findings.length === 0) {
    return (
      <div className="rounded-2xl border border-white/5 bg-[#05070d]/40 p-8 text-center text-sm text-gray-500">
        No findings discovered yet. Results will appear here as checks complete.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => {
        const severity = (finding.severity || 'INFO').toUpperCase();
        return (
          <div
            key={finding.id}
            className={`relative overflow-hidden rounded-2xl border-l-2 p-6 ${severityStyles[severity] || severityStyles.INFO}`}
          >
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/2 blur-3xl" />
            <div className="relative flex flex-col gap-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-semibold text-white">{finding.vuln_type}</h4>
                    <StatusBadge status={severity} />
                    {finding.cvss_score !== null && finding.cvss_score !== undefined && (
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">CVSS {finding.cvss_score}</span>
                    )}
                    {finding.cwe_id && (
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">{finding.cwe_id}</span>
                    )}
                    {finding.method && <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-400">{finding.method}</span>}
                  </div>
                  <p className="break-all text-sm text-gray-400">{finding.url}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {finding.parameter && (
                  <div className="rounded-2xl border border-white/5 bg-[#05070d]/50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Affected Parameter</p>
                    <p className="mt-2 break-all text-sm text-gray-200">{finding.parameter}</p>
                  </div>
                )}
                {finding.payload && (
                  <div className="rounded-2xl border border-white/5 bg-[#05070d]/50 p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Payload</p>
                    <code className="mt-2 block break-all text-sm text-emerald-300">{finding.payload}</code>
                  </div>
                )}
              </div>
              {finding.evidence && (
                <div className="rounded-2xl border border-white/5 bg-[#05070d]/50 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Evidence</p>
                  <p className="mt-2 whitespace-pre-wrap break-all text-sm text-gray-300">{finding.evidence}</p>
                </div>
              )}
              {finding.remediation && (
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">Remediation</p>
                  <p className="mt-2 whitespace-pre-wrap break-all text-sm text-emerald-100/90">{finding.remediation}</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}