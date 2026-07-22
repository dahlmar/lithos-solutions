"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/features/auth/actions";

export type SidebarNavItem = {
  href: string;
  label: string;
  /** Match the pathname exactly (for the section's index route). */
  exact?: boolean;
};

type SidebarProps = {
  sectionLabel?: string;
  items: SidebarNavItem[];
  userName: string;
  userSub: string;
  userInitials: string;
};

export default function Sidebar({
  sectionLabel,
  items,
  userName,
  userSub,
  userInitials,
}: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (item: SidebarNavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const nav = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-[3px]">
      {items.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[13.5px] transition-colors ${
              active ? "bg-white/5 text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-[2px] ${active ? "bg-accent" : "bg-white/20"}`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const userRow = (
    <div className="flex items-center gap-3 border-t border-white/6 p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent/18 text-xs font-semibold text-accent">
        {userInitials}
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="truncate text-[12.5px] font-medium">{userName}</div>
        <div className="text-[10.5px] text-muted">{userSub}</div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          title="Sign out"
          className="cursor-pointer rounded-lg px-2 py-1 font-mono text-[10px] tracking-[0.1em] text-muted transition-colors hover:text-foreground"
        >
          OUT
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile bar + expanding menu */}
      <div className="border-b border-white/6 bg-panel lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold tracking-[0.22em] pl-[0.22em]">
              LITHOS
            </span>
            {sectionLabel ? (
              <span className="font-mono text-[9px] tracking-[0.24em] text-accent">
                {sectionLabel}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="cursor-pointer rounded-lg px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-muted transition-colors hover:text-foreground"
          >
            {open ? "CLOSE" : "MENU"}
          </button>
        </div>
        {open ? (
          <div className="px-3 pb-3">
            {nav(() => setOpen(false))}
            <div className="mt-2">{userRow}</div>
          </div>
        ) : null}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-[244px] shrink-0 flex-col border-r border-white/6 bg-panel px-4 py-[22px] lg:flex">
        <Link href="/" className="flex items-baseline gap-2 px-2.5 pb-2 pt-1.5">
          <span className="text-[15px] font-semibold tracking-[0.22em] pl-[0.22em]">
            LITHOS
          </span>
          <span className="font-mono text-[8px] tracking-[0.28em] text-muted">
            SOLUTIONS
          </span>
        </Link>
        <div className="px-2.5 pb-4">
          {sectionLabel ? (
            <span className="font-mono text-[9px] tracking-[0.24em] text-accent">
              {sectionLabel}
            </span>
          ) : null}
        </div>
        {nav()}
        <div className="mt-auto">{userRow}</div>
      </aside>
    </>
  );
}
