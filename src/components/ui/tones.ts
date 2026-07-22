/**
 * Semantic status tones from the Lithos design system.
 * Maps a tone to static Tailwind classes (kept static so the compiler sees them).
 */
export type Tone = "positive" | "warning" | "danger" | "info" | "neutral" | "muted";

export const toneText: Record<Tone, string> = {
  positive: "text-accent",
  warning: "text-warn",
  danger: "text-danger",
  info: "text-info",
  neutral: "text-foreground",
  muted: "text-muted",
};

export const toneDot: Record<Tone, string> = {
  positive: "bg-accent",
  warning: "bg-warn",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-foreground",
  muted: "bg-white/30",
};

export const toneBadge: Record<Tone, string> = {
  positive: "text-accent bg-accent/15",
  warning: "text-warn bg-warn/15",
  danger: "text-danger bg-danger/15",
  info: "text-info bg-info/15",
  neutral: "text-foreground bg-white/10",
  muted: "text-muted bg-white/5",
};
