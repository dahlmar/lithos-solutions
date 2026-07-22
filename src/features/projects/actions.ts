"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { createClient as createSupabase } from "@/lib/supabase/server";

export type ProjectFormState = { error?: string };

const TYPES = ["creative", "infrastructure"] as const;
const STATUSES = ["planning", "on_track", "at_risk", "delivered"] as const;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const name = String(formData.get("name") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "");
  const type = String(formData.get("type") ?? "");
  const status = String(formData.get("status") ?? "");
  const managerId = String(formData.get("manager_id") ?? "");
  const startedOn = String(formData.get("started_on") ?? "");
  const progress = Number(formData.get("progress") ?? 0);
  const budgetRaw = String(formData.get("budget") ?? "").replace(",", ".").trim();

  if (!name) return { error: "Project name is required." };
  if (!UUID_RE.test(clientId)) return { error: "Choose a client." };
  if (!TYPES.includes(type as (typeof TYPES)[number])) {
    return { error: "Choose a project type." };
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: "Choose a valid status." };
  }
  if (managerId && !UUID_RE.test(managerId)) {
    return { error: "Choose a valid manager." };
  }
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    return { error: "Progress must be a whole number between 0 and 100." };
  }
  if (startedOn && Number.isNaN(new Date(startedOn).getTime())) {
    return { error: "Start date doesn't look valid." };
  }
  const budget = budgetRaw ? Number(budgetRaw) : null;
  if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
    return { error: "Budget must be a non-negative number." };
  }

  const supabase = await createSupabase();
  const { error } = await supabase.from("projects").insert({
    name,
    client_id: clientId,
    type,
    status,
    progress,
    manager_id: managerId || null,
    started_on: startedOn || null,
    budget_cents: budget === null ? null : Math.round(budget * 100),
  });
  if (error) return { error: `Could not create project: ${error.message}` };

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/clients/${clientId}`);
  redirect("/admin/projects");
}

export async function updateProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const managerId = String(formData.get("manager_id") ?? "");
  const startedOn = String(formData.get("started_on") ?? "");
  const progress = Number(formData.get("progress") ?? NaN);
  const budgetRaw = String(formData.get("budget") ?? "").replace(",", ".").trim();

  if (!UUID_RE.test(id)) return { error: "Invalid project." };
  if (!name) return { error: "Project name is required." };
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: "Choose a valid status." };
  }
  if (managerId && !UUID_RE.test(managerId)) {
    return { error: "Choose a valid manager." };
  }
  if (startedOn && Number.isNaN(new Date(startedOn).getTime())) {
    return { error: "Start date doesn't look valid." };
  }
  if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
    return { error: "Progress must be a whole number between 0 and 100." };
  }
  const budget = budgetRaw ? Number(budgetRaw) : null;
  if (budget !== null && (!Number.isFinite(budget) || budget < 0)) {
    return { error: "Budget must be a non-negative number." };
  }

  const supabase = await createSupabase();
  const { error } = await supabase
    .from("projects")
    .update({
      name,
      status,
      progress,
      manager_id: managerId || null,
      started_on: startedOn || null,
      budget_cents: budget === null ? null : Math.round(budget * 100),
    })
    .eq("id", id);
  if (error) return { error: `Could not update project: ${error.message}` };

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${id}`);
}

export async function deleteProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { error: "Invalid project." };

  const supabase = await createSupabase();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: `Could not delete project: ${error.message}` };

  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}
