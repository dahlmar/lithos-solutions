import type { Metadata } from "next";
import Link from "next/link";
import ResetForm from "@/features/auth/components/ResetForm";
import { getUser } from "@/features/auth/session";

export const metadata: Metadata = {
  title: "Set new password",
};

export default async function ResetPage() {
  const user = await getUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface p-6 text-foreground">
      <div className="w-full max-w-[380px] animate-lithos-fade">
        {user ? (
          <>
            <h1 className="text-[28px] font-medium tracking-[-0.015em]">
              Set a new password
            </h1>
            <p className="mt-2 text-sm text-muted">
              Signed in as {user.email}. Choose a new password below.
            </p>
            <ResetForm />
          </>
        ) : (
          <>
            <h1 className="text-[28px] font-medium tracking-[-0.015em]">
              Link expired
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              This reset link is invalid or has expired. Request a fresh one and
              try again.
            </p>
            <Link
              href="/forgot"
              className="mt-6 inline-block text-sm text-accent hover:text-[#35c493]"
            >
              Request a new link →
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
