"use client";

import { useActionState } from "react";
import { fieldClasses } from "@/components/ui/fieldStyles";
import {
  requestOtp,
  verifyOtp,
  type RequestOtpState,
  type VerifyOtpState,
} from "../actions";

const submitButton =
  "mt-1.5 w-full cursor-pointer rounded-xl bg-accent p-3.5 text-[15px] font-medium text-[#06120d] transition-colors hover:bg-[#35c493] disabled:cursor-default disabled:opacity-60";

export default function LoginForm({ next }: { next?: string }) {
  const [reqState, requestAction, requesting] = useActionState<
    RequestOtpState,
    FormData
  >(requestOtp, {});
  const [verState, verifyAction, verifying] = useActionState<
    VerifyOtpState,
    FormData
  >(verifyOtp, {});

  // Once a code has been sent, switch to the code-entry step.
  if (reqState.sent && reqState.email) {
    return (
      <div className="mt-[34px]">
        <form action={verifyAction} className="flex flex-col gap-[18px]">
          {next ? <input type="hidden" name="next" value={next} /> : null}
          <input type="hidden" name="email" value={reqState.email} />

          <p className="text-sm text-muted">
            We sent a 6-digit code to{" "}
            <span className="text-foreground">{reqState.email}</span>. Enter it
            below to sign in.
          </p>

          <label className="block">
            <span className="text-xs text-muted">Verification code</span>
            <input
              type="text"
              name="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              required
              autoFocus
              className={`${fieldClasses} tracking-[0.5em]`}
            />
          </label>

          {verState.error ? (
            <p className="text-[13px] text-danger" role="alert">
              {verState.error}
            </p>
          ) : null}

          <button type="submit" disabled={verifying} className={submitButton}>
            {verifying ? "Verifying…" : "Sign in"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-[13px] text-muted">
          {/* Sibling form re-sends a fresh code to the same email. */}
          <form action={requestAction}>
            <input type="hidden" name="email" value={reqState.email} />
            <button
              type="submit"
              disabled={requesting}
              className="cursor-pointer transition-colors hover:text-foreground disabled:opacity-60"
            >
              {requesting ? "Sending…" : "Resend code"}
            </button>
          </form>

          {/* Full reload preserves any `next` in the URL and resets the flow. */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="cursor-pointer transition-colors hover:text-foreground"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  // Step 1: ask for the email address.
  return (
    <form action={requestAction} className="mt-[34px] flex flex-col gap-[18px]">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <label className="block">
        <span className="text-xs text-muted">Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          autoFocus
          className={fieldClasses}
        />
      </label>

      {reqState.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {reqState.error}
        </p>
      ) : null}

      <button type="submit" disabled={requesting} className={submitButton}>
        {requesting ? "Sending code…" : "Send code"}
      </button>
    </form>
  );
}
