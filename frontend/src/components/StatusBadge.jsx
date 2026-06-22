const statusStyles = {
  pending: 'bg-gray-600 text-gray-200',
  running: 'bg-yellow-600 text-yellow-200 animate-pulse',
  completed: 'bg-green-600 text-green-200',
  failed: 'bg-red-600 text-red-200',
};

export default function StatusBadge({ status }) {
  const classes = statusStyles[status] || statusStyles.pending;
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${classes}`}>
      {status}
    </span>
  );
}