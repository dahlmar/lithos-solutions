"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { createClient as createSupabase } from "@/lib/supabase/server";

export type DeliverableFormState = { error?: string };

const STATUSES = [
  "upcoming",
  "in_progress",
  "in_review",
  "approved",
  "delivered",
] as const;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createDeliverable(
  _prevState: DeliverableFormState,
  formData: FormData,
): Promise<DeliverableFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const projectId = String(formData.get("project_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const version = String(formData.get("version") ?? "").trim();
  const dueOn = String(formData.get("due_on") ?? "");

  if (!UUID_RE.test(projectId)) return { error: "Invalid project." };
  if (!name) return { error: "Deliverable name is required." };
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: "Choose a valid status." };
  }
  if (dueOn && Number.isNaN(new Date(dueOn).getTime())) {
    return { error: "Due date doesn't look valid." };
  }

  const supabase = await createSupabase();
  const { error } = await supabase.from("deliverables").insert({
    project_id: projectId,
    name,
    description,
    status,
    version: version || null,
    due_on: dueOn || null,
  });
  if (error) return { error: `Could not create deliverable: ${error.message}` };

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin");
  return {};
}
