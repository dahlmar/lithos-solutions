import "server-only";

import { createClient } from "@/lib/supabase/server";

export type ActivityNote = {
  id: string;
  body: string;
  projectName: string;
  createdAt: string; // ISO timestamp
};

/**
 * Recent notes, newest first. RLS-scoped: client users only ever receive
 * client-visible notes on their own projects; internal notes never leave
 * the database for them.
 */
export async function getRecentNotes(limit = 6): Promise<ActivityNote[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .select("id, body, created_at, projects(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load notes: ${error.message}`);

  type Row = {
    id: string;
    body: string;
    created_at: string;
    projects: { name: string } | null;
  };
  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    body: row.body,
    projectName: row.projects?.name ?? "—",
    createdAt: row.created_at,
  }));
}
