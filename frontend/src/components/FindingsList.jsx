import StatusBadge from './StatusBadge';

const severityColors = {
  Critical: 'border-red-600 bg-red-900/20',
  High: 'border-orange-600 bg-orange-900/20',
  Medium: 'border-yellow-600 bg-yellow-900/20',
  Low: 'border-blue-600 bg-blue-900/20',
  Info: 'border-gray-600 bg-gray-800/30',
};

export default function FindingsList({ findings }) {
  if (!findings || findings.length === 0) {
    return <p className="text-gray-500 text-sm">No findings discovered yet.</p>;
  }

  return (
    <div className="space-y-4">
      {findings.map((finding) => (
        <div
          key={finding.id}
          className={`border-l-4 p-4 rounded bg-[#0d1117] ${severityColors[finding.severity] || 'border-gray-600'}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-gray-200 break-all">{finding.vuln_type}</h4>
                <StatusBadge status={finding.severity.toLowerCase()} />
                {finding.cvss_score && (
                  <span className="text-xs text-gray-400">CVSS: {finding.cvss_score}</span>
                )}
                {finding.cwe_id && (
                  <span className="text-xs text-gray-400">{finding.cwe_id}</span>
                )}
              </div>
              <p className="text-sm text-gray-400 truncate max-w-lg">URL: {finding.url}</p>
              {finding.parameter && (
                <p className="text-sm text-gray-400">Parameter: {finding.parameter}</p>
              )}
              <div className="mt-1 text-sm">
                <span className="text-gray-500">Payload:</span>
                <code className="ml-1 bg-black/40 px-1 rounded text-xs text-green-300 break-all">
                  {finding.payload}
                </code>
              </div>
              {finding.evidence && (
                <p className="text-sm text-gray-300 mt-1">Evidence: {finding.evidence}</p>
              )}
              {finding.remediation && (
                <p className="text-sm text-green-400 mt-1">Remediation: {finding.remediation}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}