import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import LithosBackground from "@/components/LithosBackground";
import LoginForm from "@/features/auth/components/LoginForm";
import { getUser, roleHome } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  // Proxy already redirects signed-in users, but never trust it alone.
  const user = await getUser();
  if (user) redirect(roleHome(user.role));

  const { next } = await searchParams;

  return (
    <main className="grid min-h-screen bg-surface text-foreground lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/6 p-12 lg:flex">
        <LithosBackground />
        <Link href="/" className="relative flex items-baseline gap-2.5">
          <span className="text-[17px] font-semibold tracking-[0.24em] pl-[0.24em]">
            LITHOS
          </span>
          <span className="font-mono text-[9px] tracking-[0.3em] text-muted">
            SOLUTIONS
          </span>
        </Link>
        <div className="relative">
          <p className="max-w-[400px] text-[27px] font-light leading-[1.45] tracking-[-0.015em]">
            Precision, transparency and calm confidence — for every project we
            deliver.
          </p>
          <div className="mt-6 font-mono text-[11px] tracking-[0.2em] text-muted">
            PROJECT DELIVERY PLATFORM
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-12">
        <div className="w-full max-w-[380px] animate-lithos-fade">
          <h1 className="text-[28px] font-medium tracking-[-0.015em]">Sign in</h1>
          <p className="mt-2 text-sm text-muted">
            Enter the email from your project invitation and we&apos;ll send you
            a one-time sign-in code.
          </p>

          <LoginForm next={next} />

          <div className="mt-7 border-t border-white/6 pt-5 text-[12.5px] text-muted">
            Not a client yet?{" "}
            <Link href="/" className="text-accent hover:text-[#35c493]">
              Explore our services
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
