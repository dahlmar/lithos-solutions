const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The prototype's circular progress indicator (116px SVG ring). */
export default function ProgressRing({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div className="relative h-[116px] w-[116px] shrink-0">
      <svg width="116" height="116" viewBox="0 0 116 116" className="-rotate-90">
        <circle
          cx="58"
          cy="58"
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="58"
          cy="58"
          r={RADIUS}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[26px] font-semibold">{clamped}%</span>
        <span className="text-[10px] text-muted">complete</span>
      </div>
    </div>
  );
}
