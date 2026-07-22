"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { deliverableStatusEmail } from "@/lib/email";
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

  await supabase.rpc("recompute_project_progress", { p_project_id: projectId });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin");
  return {};
}

/** Notify the client when work reaches a stage they care about. Fail-soft. */
async function notifyDeliverableStatus(
  deliverableId: string,
  status: "in_review" | "delivered",
): Promise<void> {
  const supabase = await createSupabase();
  const { data } = await supabase
    .from("deliverables")
    .select("name, projects(name, clients(contact_email))")
    .eq("id", deliverableId)
    .maybeSingle();
  const row = data as unknown as {
    name: string;
    projects: {
      name: string;
      clients: { contact_email: string | null } | null;
    } | null;
  } | null;
  const to = row?.projects?.clients?.contact_email;
  if (!to) return;
  await deliverableStatusEmail({
    to,
    deliverableName: row?.name ?? "A deliverable",
    projectName: row?.projects?.name ?? "your project",
    status,
  });
}

export async function updateDeliverable(
  _prevState: DeliverableFormState,
  formData: FormData,
): Promise<DeliverableFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const version = String(formData.get("version") ?? "").trim();
  const dueOn = String(formData.get("due_on") ?? "");

  if (!UUID_RE.test(id)) return { error: "Invalid deliverable." };
  if (!UUID_RE.test(projectId)) return { error: "Invalid project." };
  if (!name) return { error: "Deliverable name is required." };
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: "Choose a valid status." };
  }
  if (dueOn && Number.isNaN(new Date(dueOn).getTime())) {
    return { error: "Due date doesn't look valid." };
  }

  const supabase = await createSupabase();
  const { data: before } = await supabase
    .from("deliverables")
    .select("status")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("deliverables")
    .update({
      name,
      description,
      status,
      version: version || null,
      due_on: dueOn || null,
    })
    .eq("id", id);
  if (error) return { error: `Could not update deliverable: ${error.message}` };

  if (
    before &&
    before.status !== status &&
    (status === "in_review" || status === "delivered")
  ) {
    await notifyDeliverableStatus(id, status);
  }

  await supabase.rpc("recompute_project_progress", { p_project_id: projectId });

  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin");
  return {};
}

export async function deleteDeliverable(
  _prevState: DeliverableFormState,
  formData: FormData,
): Promise<DeliverableFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { error: "Invalid deliverable." };

  const supabase = await createSupabase();

  // Remove storage objects first so the bucket doesn't accumulate orphans.
  const { data: files } = await supabase
    .from("deliverable_files")
    .select("path")
    .eq("deliverable_id", id);
  const paths = ((files ?? []) as { path: string }[]).map((f) => f.path);
  if (paths.length > 0) {
    await supabase.storage.from("deliverables").remove(paths);
  }

  const { data: row } = await supabase
    .from("deliverables")
    .select("project_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("deliverables").delete().eq("id", id);
  if (error) return { error: `Could not delete deliverable: ${error.message}` };

  if (row?.project_id) {
    await supabase.rpc("recompute_project_progress", {
      p_project_id: row.project_id,
    });
    revalidatePath(`/admin/projects/${row.project_id}`);
  }
  revalidatePath("/admin");
  return {};
}

export type FileState = { error?: string };

/**
 * Record an uploaded file's metadata. The binary is uploaded straight from
 * the browser to Supabase Storage (RLS-gated); this action verifies the
 * object actually exists at the claimed path before trusting it.
 */
export async function recordDeliverableFile(
  _prevState: FileState,
  formData: FormData,
): Promise<FileState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const deliverableId = String(formData.get("deliverable_id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  const path = String(formData.get("path") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sizeBytes = Number(formData.get("size_bytes") ?? 0);
  const contentType = String(formData.get("content_type") ?? "").trim();

  if (!UUID_RE.test(deliverableId)) return { error: "Invalid deliverable." };
  if (!name || !path) return { error: "Upload metadata is incomplete." };
  if (!path.includes(`/${deliverableId}/`)) {
    return { error: "File path doesn't match the deliverable." };
  }

  const supabase = await createSupabase();

  const { error: missing } = await supabase.storage
    .from("deliverables")
    .createSignedUrl(path, 60);
  if (missing) return { error: "Uploaded file not found in storage." };

  const { error } = await supabase.from("deliverable_files").insert({
    deliverable_id: deliverableId,
    name,
    path,
    size_bytes: Number.isFinite(sizeBytes) ? Math.max(0, Math.round(sizeBytes)) : 0,
    content_type: contentType || null,
  });
  if (error) return { error: `Could not save file: ${error.message}` };

  if (UUID_RE.test(projectId)) revalidatePath(`/admin/projects/${projectId}`);
  return {};
}

export async function deleteDeliverableFile(
  _prevState: FileState,
  formData: FormData,
): Promise<FileState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const id = String(formData.get("id") ?? "");
  const projectId = String(formData.get("project_id") ?? "");
  if (!UUID_RE.test(id)) return { error: "Invalid file." };

  const supabase = await createSupabase();
  const { data: file } = await supabase
    .from("deliverable_files")
    .select("path")
    .eq("id", id)
    .maybeSingle();
  if (!file) return { error: "File not found." };

  await supabase.storage.from("deliverables").remove([file.path]);
  const { error } = await supabase.from("deliverable_files").delete().eq("id", id);
  if (error) return { error: `Could not delete file: ${error.message}` };

  if (UUID_RE.test(projectId)) revalidatePath(`/admin/projects/${projectId}`);
  return {};
}
