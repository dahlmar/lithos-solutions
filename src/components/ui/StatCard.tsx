import Panel from "./Panel";
import { toneText, type Tone } from "./tones";

type StatCardProps = {
  label: string;
  value: string;
  delta: string;
  tone?: Tone;
};

export default function StatCard({ label, value, delta, tone = "neutral" }: StatCardProps) {
  return (
    <Panel className="p-[22px]">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-3.5 text-[34px] font-semibold tracking-[-0.02em] ${toneText[tone]}`}>
        {value}
      </div>
      <div className="mt-1.5 text-[11.5px] text-muted">{delta}</div>
    </Panel>
  );
}
