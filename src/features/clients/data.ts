import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Client, ClientStatus, ClientWithCounts } from "./types";

type ClientRow = {
  id: string;
  name: string;
  contact_email: string | null;
  status: "active" | "onboarding" | "paused";
};

const STATUS_LABELS: Record<ClientRow["status"], ClientStatus> = {
  active: "Active",
  onboarding: "Onboarding",
  paused: "Paused",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact_email ?? "—",
    status: STATUS_LABELS[row.status],
  };
}

export async function getClients(): Promise<ClientWithCounts[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, contact_email, status, projects(status)")
    .order("name");
  if (error) throw new Error(`Failed to load clients: ${error.message}`);

  type Row = ClientRow & { projects: { status: string }[] };
  return (data as unknown as Row[]).map((row) => ({
    ...toClient(row),
    activeProjects: row.projects.filter((p) => p.status !== "delivered").length,
  }));
}

export async function getClientById(id: string): Promise<Client | undefined> {
  // Route params are user input — reject non-UUIDs before they hit Postgres.
  if (!UUID_RE.test(id)) return undefined;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("id, name, contact_email, status")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load client: ${error.message}`);
  return data ? toClient(data as ClientRow) : undefined;
}
