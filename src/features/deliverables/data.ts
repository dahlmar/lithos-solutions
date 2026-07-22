import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Deliverable, DeliverableStatus } from "./types";

type DeliverableRow = {
  id: string;
  name: string;
  description: string;
  project_id: string;
  status: "upcoming" | "in_progress" | "in_review" | "approved" | "delivered";
  version: string | null;
  due_on: string | null;
  projects: { name: string } | null;
};

const STATUS_LABELS: Record<DeliverableRow["status"], DeliverableStatus> = {
  upcoming: "Upcoming",
  in_progress: "In progress",
  in_review: "In review",
  approved: "Approved",
  delivered: "Delivered",
};

const DELIVERABLE_SELECT =
  "id, name, description, project_id, status, version, due_on, projects(name)";

function toDeliverable(row: DeliverableRow): Deliverable {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    projectId: row.project_id,
    projectName: row.projects?.name ?? "—",
    status: STATUS_LABELS[row.status],
    statusValue: row.status,
    version: row.version,
    dueOn: row.due_on,
  };
}

/** RLS-scoped: clients get only their own projects' deliverables. */
export async function getDeliverables(): Promise<Deliverable[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverables")
    .select(DELIVERABLE_SELECT)
    .order("due_on", { ascending: true, nullsFirst: false });
  if (error) throw new Error(`Failed to load deliverables: ${error.message}`);
  return (data as unknown as DeliverableRow[]).map(toDeliverable);
}

export async function getDeliverablesForProject(
  projectId: string,
): Promise<Deliverable[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverables")
    .select(DELIVERABLE_SELECT)
    .eq("project_id", projectId)
    .order("due_on", { ascending: true, nullsFirst: false });
  if (error) throw new Error(`Failed to load deliverables: ${error.message}`);
  return (data as unknown as DeliverableRow[]).map(toDeliverable);
}

import type { DeliverableFile } from "./types";

/**
 * Files for a set of deliverables, keyed by deliverable id, each with a
 * 1-hour signed download URL. RLS scopes both the metadata rows and the
 * storage objects to admins / the owning client.
 */
export async function getFilesForDeliverables(
  deliverableIds: string[],
): Promise<Map<string, DeliverableFile[]>> {
  const result = new Map<string, DeliverableFile[]>();
  if (deliverableIds.length === 0) return result;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deliverable_files")
    .select("id, deliverable_id, name, path, size_bytes")
    .in("deliverable_id", deliverableIds)
    .order("created_at", { ascending: true });
  if (error) {
    // Table missing (migration not applied yet) → degrade to "no files".
    if (error.code === "42P01") return result;
    throw new Error(`Failed to load files: ${error.message}`);
  }

  type Row = {
    id: string;
    deliverable_id: string;
    name: string;
    path: string;
    size_bytes: number;
  };
  const rows = data as Row[];
  if (rows.length === 0) return result;

  const { data: signed } = await supabase.storage
    .from("deliverables")
    .createSignedUrls(rows.map((r) => r.path), 3600);
  const urlByPath = new Map(
    (signed ?? []).map((entry) => [entry.path, entry.signedUrl]),
  );

  for (const row of rows) {
    const file: DeliverableFile = {
      id: row.id,
      deliverableId: row.deliverable_id,
      name: row.name,
      path: row.path,
      sizeBytes: row.size_bytes,
      url: urlByPath.get(row.path) ?? null,
    };
    const list = result.get(row.deliverable_id);
    if (list) list.push(file);
    else result.set(row.deliverable_id, [file]);
  }
  return result;
}
