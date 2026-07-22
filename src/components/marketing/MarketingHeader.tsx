"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/creative", label: "Creative" },
  { href: "/infrastructure", label: "Infrastructure" },
];

export default function MarketingHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/6 bg-surface/72 px-6 py-[22px] backdrop-blur-[14px] md:px-12">
      <Link href="/" className="flex items-baseline gap-2.5">
        <span className="text-[17px] font-semibold tracking-[0.24em] pl-[0.24em]">
          LITHOS
        </span>
        <span className="hidden font-mono text-[9px] tracking-[0.3em] text-muted sm:inline">
          SOLUTIONS
        </span>
      </Link>
      <nav className="flex items-center gap-5 md:gap-7">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`text-[13px] transition-colors ${
              pathname === item.href
                ? "text-foreground"
                : "text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/login"
          className="rounded-[10px] bg-foreground px-4 py-[9px] text-[13px] font-medium text-[#111111] transition-colors hover:bg-accent hover:text-[#06120d]"
        >
          Client Login
        </Link>
      </nav>
    </header>
  );
}
