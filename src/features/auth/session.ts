import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Role = "admin" | "client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export function roleHome(role: Role): string {
  return role === "admin" ? "/admin" : "/portal";
}

/**
 * Data access layer entry point. `supabase.auth.getUser()` revalidates the
 * token against Supabase — this is the secure check, unlike the optimistic
 * one in proxy.ts. Cached per request so layouts and pages can both call it.
 *
 * The role lives in `app_metadata`, which only the service role can write —
 * users cannot grant themselves admin.
 */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const role: Role = user.app_metadata?.role === "admin" ? "admin" : "client";
  return {
    id: user.id,
    email: user.email ?? "",
    name: (user.user_metadata?.full_name as string | undefined) ?? user.email ?? "",
    role,
  };
});

/**
 * Require a signed-in user, optionally with a specific role.
 * Redirects instead of rendering when the requirement isn't met.
 */
export async function requireUser(role?: Role): Promise<SessionUser> {
  const user = await getUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(roleHome(user.role));
  return user;
}
