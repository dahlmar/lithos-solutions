import { toneDot, type Tone } from "./tones";

type ProgressBarProps = {
  value: number; // 0–100
  tone?: Tone;
};

export default function ProgressBar({ value, tone = "positive" }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-[5px] max-w-[90px] flex-1 overflow-hidden rounded-[3px] bg-white/8">
        <span
          className={`block h-full ${toneDot[tone]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </span>
      <span className="text-[11.5px] text-muted">{value}%</span>
    </div>
  );
}
