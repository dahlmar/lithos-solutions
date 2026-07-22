"use client";

import { useActionState } from "react";
import { accentButton, fieldClasses, labelClasses } from "@/components/ui/fieldStyles";
import { requestPasswordReset, type ForgotState } from "../actions";

export default function ForgotForm() {
  const [state, formAction, pending] = useActionState<ForgotState, FormData>(
    requestPasswordReset,
    {},
  );

  if (state.sent) {
    return (
      <p className="mt-[34px] text-sm leading-6 text-muted">
        If an account exists for that email, a reset link is on its way. Check
        your inbox — the link is valid for one hour.
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-[34px] flex flex-col gap-[18px]">
      <label className="block">
        <span className={labelClasses}>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          className={fieldClasses}
        />
      </label>

      {state.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={accentButton}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
