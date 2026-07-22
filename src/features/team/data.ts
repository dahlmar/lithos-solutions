import "server-only";

import { createClient } from "@/lib/supabase/server";

export type TeamMember = {
  id: string;
  name: string;
};

/** Staff profiles (admin role) — for manager assignment. Admin-only via RLS. */
export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "admin")
    .order("full_name");
  if (error) throw new Error(`Failed to load team: ${error.message}`);

  return (data as { id: string; full_name: string }[]).map((row) => ({
    id: row.id,
    name: row.full_name || "Unnamed",
  }));
}
