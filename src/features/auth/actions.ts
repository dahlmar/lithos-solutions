"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser, roleHome, type Role } from "./session";

export type RequestOtpState = {
  error?: string;
  sent?: boolean;
  email?: string;
};

/**
 * Step 1 of passwordless login: email a one-time code via Supabase (delivered
 * through the project's configured SMTP provider). Invite-only —
 * `shouldCreateUser: false` means an unknown email is never turned into an
 * account. We always advance to the code step and never reveal whether an
 * account exists, to avoid user enumeration.
 */
export async function requestOtp(
  _prevState: RequestOtpState,
  formData: FormData,
): Promise<RequestOtpState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) {
    // Surface the real cause (e.g. otp_disabled, over_email_send_rate_limit,
    // signups-not-allowed for an unknown email) in server logs only.
    console.error(`requestOtp: ${error.code ?? error.status} — ${error.message}`);
  }

  return { sent: true, email };
}

export type VerifyOtpState = {
  error?: string;
};

/**
 * Step 2 of passwordless login: verify the 6-digit code. On success Supabase
 * writes the session cookies via the request-bound client, then we redirect to
 * the role's home (or a safe `next`).
 */
export async function verifyOtp(
  _prevState: VerifyOtpState,
  formData: FormData,
): Promise<VerifyOtpState> {
  const email = String(formData.get("email") ?? "").trim();
  const token = String(formData.get("token") ?? "").trim();

  if (!email || !token) {
    return { error: "Enter the 6-digit code from your email." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error || !data.user) {
    console.error(`verifyOtp: ${error?.code ?? error?.status} — ${error?.message}`);
    return { error: "That code is invalid or has expired." };
  }

  const role: Role = data.user.app_metadata?.role === "admin" ? "admin" : "client";
  const next = String(formData.get("next") ?? "");
  // Only follow same-origin paths the user is actually allowed to visit.
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") && (role === "admin" || !next.startsWith("/admin"))
      ? next
      : null;

  redirect(safeNext ?? roleHome(role));
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type ForgotState = {
  error?: string;
  sent?: boolean;
};

export async function requestPasswordReset(
  _prevState: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email." };

  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? `https://${hdrs.get("host") ?? ""}`;

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset`,
  });

  // Always report success — never reveal which emails have accounts.
  return { sent: true };
}

export type ResetState = {
  error?: string;
};

export async function updatePassword(
  _prevState: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const user = await getUser();
  if (!user) redirect("/login");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { error: "Passwords don't match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: `Could not update password: ${error.message}` };

  redirect(roleHome(user.role));
}
