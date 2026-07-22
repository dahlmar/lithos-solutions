import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { requireUser } from "@/features/auth/session";
import { initials } from "@/lib/format";

export const metadata: Metadata = {
  title: "Operations",
};

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/clients", label: "Clients" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/team", label: "Team" },
];

const TITLES: Array<[string, string]> = [
  ["/admin/clients", "Clients"],
  ["/admin/projects", "Projects"],
  ["/admin/invoices", "Invoices"],
  ["/admin/team", "Team"],
  ["/admin", "Dashboard"],
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Secure role check (proxy.ts only does the optimistic one).
  const user = await requireUser("admin");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface text-foreground lg:flex-row">
      <Sidebar
        sectionLabel="OPERATIONS"
        items={NAV_ITEMS}
        userName={user.name}
        userSub="Admin"
        userInitials={initials(user.name)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar titles={TITLES} userInitials={initials(user.name)} />
        <div className="flex-1 overflow-y-auto px-4 pb-16 pt-6 md:px-8 md:pt-[34px]">
          <div className="mx-auto max-w-[1080px] animate-lithos-fade">{children}</div>
        </div>
      </div>
    </div>
  );
}
