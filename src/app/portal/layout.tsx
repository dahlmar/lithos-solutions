import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import Panel from "@/components/ui/Panel";
import { requireUser } from "@/features/auth/session";
import { signOut } from "@/features/auth/actions";
import { getMyClient } from "@/features/clients/data";
import { initials } from "@/lib/format";

export const metadata: Metadata = {
  title: "Client Portal",
};

const NAV_ITEMS = [
  { href: "/portal", label: "Dashboard", exact: true },
  { href: "/portal/deliverables", label: "Deliverables" },
  { href: "/portal/invoices", label: "Invoices" },
];

const TITLES: Array<[string, string]> = [
  ["/portal/deliverables", "Deliverables"],
  ["/portal/invoices", "Invoices"],
  ["/portal", "Dashboard"],
];

export default async function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Secure role check; admins are sent to /admin by requireUser.
  await requireUser("client");
  const client = await getMyClient();

  if (!client) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface p-6 text-foreground">
        <Panel className="w-full max-w-[440px] p-8 text-center animate-lithos-fade">
          <h1 className="text-xl font-medium">Almost there</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Your account isn&apos;t linked to a client workspace yet. Your
            project manager will finish setting this up shortly.
          </p>
          <form action={signOut} className="mt-8">
            <button
              type="submit"
              className="cursor-pointer rounded-[10px] border border-white/12 px-[22px] py-[11px] text-[13px] text-muted transition-colors hover:border-white/30 hover:text-foreground"
            >
              Sign out
            </button>
          </form>
        </Panel>
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-foreground">
      <Sidebar
        items={NAV_ITEMS}
        userName={client.name}
        userSub="Client workspace"
        userInitials={initials(client.name)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar
          titles={TITLES}
          label={client.name}
          userInitials={initials(client.name)}
        />
        <div className="flex-1 overflow-y-auto px-8 pb-16 pt-[34px]">
          <div className="mx-auto max-w-[1000px] animate-lithos-fade">{children}</div>
        </div>
      </div>
    </div>
  );
}
