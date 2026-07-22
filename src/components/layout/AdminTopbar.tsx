"use client";

import { usePathname } from "next/navigation";

// Longest-prefix wins; order matters.
const TITLES: Array<[prefix: string, title: string]> = [
  ["/admin/clients", "Clients"],
  ["/admin/projects", "Projects"],
  ["/admin", "Dashboard"],
];

export default function AdminTopbar() {
  const pathname = usePathname();
  const title = TITLES.find(([prefix]) => pathname.startsWith(prefix))?.[1] ?? "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/6 bg-surface/70 px-8 backdrop-blur-md">
      <span className="text-[17px] font-medium tracking-[-0.01em]">{title}</span>
      <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-accent/18 text-xs font-semibold text-accent">
        SL
      </span>
    </header>
  );
}
