export default function LoadingSpinner({ size = 'w-8 h-8' }) {
  return (
    <div className={`${size} border-4 border-gray-600 border-t-green-500 rounded-full animate-spin`}></div>
  );
}