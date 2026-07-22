import { toneBadge, type Tone } from "./tones";

type StatusBadgeProps = {
  tone: Tone;
  children: React.ReactNode;
};

export default function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] ${toneBadge[tone]}`}>
      {children}
    </span>
  );
}
