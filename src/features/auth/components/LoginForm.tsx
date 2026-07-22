"use client";

import Link from "next/link";
import { useActionState } from "react";
import { fieldClasses } from "@/components/ui/fieldStyles";
import { signIn, type SignInState } from "../actions";

export default function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<SignInState, FormData>(
    signIn,
    {},
  );

  return (
    <form action={formAction} className="mt-[34px] flex flex-col gap-[18px]">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <label className="block">
        <span className="text-xs text-muted">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className={fieldClasses}
        />
      </label>

      <label className="block">
        <span className="text-xs text-muted">Password</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          className={fieldClasses}
        />
      </label>

      <div className="flex justify-end">
        <Link
          href="/forgot"
          className="text-[13px] text-muted transition-colors hover:text-foreground"
        >
          Forgot password?
        </Link>
      </div>

      {state.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1.5 w-full cursor-pointer rounded-xl bg-accent p-3.5 text-[15px] font-medium text-[#06120d] transition-colors hover:bg-[#35c493] disabled:cursor-default disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
