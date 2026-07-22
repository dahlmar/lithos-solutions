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

export type PortalUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "client";
  clientId: string | null;
  clientName: string | null;
};

/** Every portal user with their role and client link — admin-only via RLS. */
export async function getAllUsers(): Promise<PortalUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, client_id, clients(name)")
    .order("role")
    .order("full_name");
  if (error) throw new Error(`Failed to load users: ${error.message}`);

  type Row = {
    id: string;
    full_name: string;
    email: string | null;
    role: "admin" | "client";
    client_id: string | null;
    clients: { name: string } | null;
  };
  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    name: row.full_name || "Unnamed",
    email: row.email ?? "—",
    role: row.role,
    clientId: row.client_id,
    clientName: row.clients?.name ?? null,
  }));
}
