"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/features/auth/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/clients", label: "Clients" },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

type AdminSidebarProps = {
  userName: string;
  userRole: string;
};

function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export default function AdminSidebar({ userName, userRole }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-[244px] shrink-0 flex-col border-r border-white/6 bg-panel px-4 py-[22px]">
      <Link href="/" className="flex items-baseline gap-2 px-2.5 pb-2 pt-1.5">
        <span className="text-[15px] font-semibold tracking-[0.22em] pl-[0.22em]">
          LITHOS
        </span>
        <span className="font-mono text-[8px] tracking-[0.28em] text-muted">
          SOLUTIONS
        </span>
      </Link>
      <div className="px-2.5 pb-4">
        <span className="font-mono text-[9px] tracking-[0.24em] text-accent">
          OPERATIONS
        </span>
      </div>

      <nav className="flex flex-col gap-[3px]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
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

      <div className="mt-auto flex items-center gap-3 border-t border-white/6 p-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-accent/18 text-xs font-semibold text-accent">
          {initials(userName)}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[12.5px] font-medium">{userName}</div>
          <div className="text-[10.5px] capitalize text-muted">{userRole}</div>
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
    </aside>
  );
}
