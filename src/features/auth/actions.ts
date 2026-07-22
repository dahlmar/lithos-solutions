"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser, roleHome, type Role } from "./session";

export type SignInState = {
  error?: string;
};

export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
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
