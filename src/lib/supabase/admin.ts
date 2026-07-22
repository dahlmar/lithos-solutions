import "server-only";

import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./server";

/**
 * Service-role client for admin-only server actions (user invites, role
 * changes). Bypasses RLS — never expose it to request-scoped reads, and keep
 * every caller behind requireUser("admin").
 *
 * Returns null when SUPABASE_SERVICE_ROLE_KEY isn't configured so features
 * can degrade with a helpful message instead of crashing.
 */
export function createAdminClient(): SupabaseClient | null {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return null;

  const { url } = supabaseEnv();
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export const SERVICE_KEY_HINT =
  "User management needs the SUPABASE_SERVICE_ROLE_KEY environment variable. " +
  "Copy it from Supabase → Project Settings → API keys and add it in Vercel → " +
  "Settings → Environment Variables, then redeploy.";
