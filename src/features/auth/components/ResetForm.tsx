"use client";

import { useActionState } from "react";
import { accentButton, fieldClasses, labelClasses } from "@/components/ui/fieldStyles";
import { updatePassword, type ResetState } from "../actions";

export default function ResetForm() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    updatePassword,
    {},
  );

  return (
    <form action={formAction} className="mt-[34px] flex flex-col gap-[18px]">
      <label className="block">
        <span className={labelClasses}>New password</span>
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={fieldClasses}
        />
      </label>

      <label className="block">
        <span className={labelClasses}>Confirm new password</span>
        <input
          type="password"
          name="confirm"
          autoComplete="new-password"
          required
          minLength={8}
          className={fieldClasses}
        />
      </label>

      {state.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className={accentButton}>
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
