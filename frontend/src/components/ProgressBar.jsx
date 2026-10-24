export default function ProgressBar({ progress = 0, stage = 'Idle', message = '' }) {
  const clamped = Math.min(Math.max(Number(progress) || 0, 0), 100);
  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-200 font-medium">{stage || 'Idle'}</span>
          {message && <span className="text-gray-500 hidden sm:inline">• {message}</span>}
        </div>
        <span className="text-emerald-300 font-mono">{clamped}%</span>
      </div>
      <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2.5 rounded-full transition-all duration-700 ease-out shadow-[0_0_25px_rgba(52,211,153,0.25)]"
          style={{ width: `${clamped}%` }}
        ></div>
      </div>
      {message && <p className="text-xs text-gray-500 sm:hidden">{message}</p>}
    </div>
  );
}