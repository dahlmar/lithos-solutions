import type { Metadata } from "next";
import Link from "next/link";
import ForgotForm from "@/features/auth/components/ForgotForm";

export const metadata: Metadata = {
  title: "Reset password",
};

export default function ForgotPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6 text-foreground">
      <div className="w-full max-w-[380px] animate-lithos-fade">
        <h1 className="text-[28px] font-medium tracking-[-0.015em]">
          Reset password
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>

        <ForgotForm />

        <div className="mt-7 border-t border-white/6 pt-5 text-[12.5px] text-muted">
          Remembered it?{" "}
          <Link href="/login" className="text-accent hover:text-[#35c493]">
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
