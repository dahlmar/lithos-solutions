import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Deliverable, DeliverableStatus } from "./types";

type DeliverableRow = {
  id: string;
  name: string;
  description: string;
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
  "id, name, description, status, version, due_on, projects(name)";

function toDeliverable(row: DeliverableRow): Deliverable {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    projectName: row.projects?.name ?? "—",
    status: STATUS_LABELS[row.status],
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
