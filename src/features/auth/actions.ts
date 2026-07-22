"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { roleHome, type Role } from "./session";

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
