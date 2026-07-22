import type { Metadata } from "next";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopbar from "@/components/layout/AdminTopbar";
import { requireUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Operations",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Secure role check (proxy.ts only does the optimistic one).
  const user = await requireUser("admin");

  return (
    <div className="flex h-screen overflow-hidden bg-surface text-foreground">
      <AdminSidebar userName={user.name} userRole={user.role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <div className="flex-1 overflow-y-auto px-8 pb-16 pt-[34px]">
          <div className="mx-auto max-w-[1080px] animate-lithos-fade">{children}</div>
        </div>
      </div>
    </div>
  );
}
