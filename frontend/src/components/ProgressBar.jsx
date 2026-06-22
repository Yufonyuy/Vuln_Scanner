export default function ProgressBar({ progress, stage }) {
  const clamped = Math.min(Math.max(progress, 0), 100);
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-gray-400 mb-1">
        <span>{stage || 'Idle'}</span>
        <span>{clamped}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        ></div>
      </div>
    </div>
  );
}