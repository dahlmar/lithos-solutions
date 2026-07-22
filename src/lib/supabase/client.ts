import { createBrowserClient } from "@supabase/ssr";

/** Browser-side Supabase client for client components (realtime, storage, …). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Both env var names are inlined at build time; whichever is set wins.
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)!,
  );
}
