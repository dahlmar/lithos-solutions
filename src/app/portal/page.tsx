import type { Metadata } from "next";
import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import { signOut } from "@/features/auth/actions";
import { requireUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Client Portal",
};

export default async function PortalPage() {
  const user = await requireUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6 text-foreground">
      <Panel className="w-full max-w-[440px] p-8 text-center animate-lithos-fade">
        <MonoLabel className="justify-center">CLIENT PORTAL</MonoLabel>
        <h1 className="mt-4 text-2xl font-medium tracking-[-0.015em]">
          Welcome, {user.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Your project dashboard is being prepared. Your project manager will let
          you know as soon as it goes live.
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
