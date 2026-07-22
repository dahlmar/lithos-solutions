"use client";

import { usePathname } from "next/navigation";

type TopbarProps = {
  /** [prefix, title] pairs — longest prefix first; first match wins. */
  titles: Array<[prefix: string, title: string]>;
  /** Optional letter-spaced mono label next to the title (e.g. client name). */
  label?: string;
  userInitials: string;
};

export default function Topbar({ titles, label, userInitials }: TopbarProps) {
  const pathname = usePathname();
  const title = titles.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/6 bg-surface/70 px-8 backdrop-blur-md">
      <div className="flex items-baseline gap-3">
        <span className="text-[17px] font-medium tracking-[-0.01em]">{title}</span>
        {label ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
            {label}
          </span>
        ) : null}
      </div>
      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-accent/18 text-xs font-semibold text-accent">
        {userInitials}
      </span>
    </header>
  );
}
