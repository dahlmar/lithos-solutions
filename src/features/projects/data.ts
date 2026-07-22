import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Project, ProjectStatus } from "./types";

// RLS scopes these queries: admins see everything, client users only their
// own client's rows — no explicit filtering needed here.

type ProjectRow = {
  id: string;
  name: string;
  client_id: string;
  type: "creative" | "infrastructure";
  status: "planning" | "on_track" | "at_risk" | "delivered";
  progress: number;
  clients: { name: string } | null;
  profiles: { full_name: string } | null;
};

const STATUS_LABELS: Record<ProjectRow["status"], ProjectStatus> = {
  planning: "Planning",
  on_track: "On Track",
  at_risk: "At Risk",
  delivered: "Delivered",
};

const TYPE_LABELS: Record<ProjectRow["type"], Project["type"]> = {
  creative: "Creative",
  infrastructure: "Infrastructure",
};

const PROJECT_SELECT =
  "id, name, client_id, type, status, progress, clients(name), profiles(full_name)";

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    clientId: row.client_id,
    clientName: row.clients?.name ?? "—",
    manager: row.profiles?.full_name || "—",
    type: TYPE_LABELS[row.type],
    progress: row.progress,
    status: STATUS_LABELS[row.status],
  };
}

export async function getProjects(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return (data as unknown as ProjectRow[]).map(toProject);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function getProjectById(id: string): Promise<Project | undefined> {
  // Route params are user input — reject non-UUIDs before they hit Postgres.
  if (!UUID_RE.test(id)) return undefined;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load project: ${error.message}`);
  return data ? toProject(data as unknown as ProjectRow) : undefined;
}

export async function getProjectsForClient(clientId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load projects: ${error.message}`);
  return (data as unknown as ProjectRow[]).map(toProject);
}
