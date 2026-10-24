const statusStyles = {
  PENDING: 'bg-gray-600/40 text-gray-300 border border-gray-500/40',
  pending: 'bg-gray-600/40 text-gray-300 border border-gray-500/40',
  RUNNING: 'bg-amber-500/15 text-amber-300 border border-amber-400/40 animate-pulse',
  running: 'bg-amber-500/15 text-amber-300 border border-amber-400/40 animate-pulse',
  COMPLETED: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40',
  completed: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/40',
  FAILED: 'bg-rose-500/15 text-rose-300 border border-rose-400/40',
  failed: 'bg-rose-500/15 text-rose-300 border border-rose-400/40',
};

export default function StatusBadge({ status = 'PENDING' }) {
  const key = typeof status === 'string' ? status.toUpperCase() : 'PENDING';
  const classes = statusStyles[key] || statusStyles.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${classes}`}>
      {key}
    </span>
  );
}