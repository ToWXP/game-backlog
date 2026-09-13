export default function ProgressBar({ pct, className = '' }) {
  const width = Math.min(100, Math.max(0, pct));
  return (
    <div
      className={`progress ${pct >= 100 ? 'progress-done' : ''} ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
    >
      <span style={{ width: `${width}%` }} />
    </div>
  );
}
