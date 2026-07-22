"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { createClient as createSupabase } from "@/lib/supabase/server";

export type NoteFormState = { error?: string };

const VISIBILITIES = ["internal", "client"] as const;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createNote(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  const user = await requireUser("admin");

  const projectId = String(formData.get("project_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const visibility = String(formData.get("visibility") ?? "");

  if (!UUID_RE.test(projectId)) return { error: "Invalid project." };
  if (!body) return { error: "Write something first." };
  if (!VISIBILITIES.includes(visibility as (typeof VISIBILITIES)[number])) {
    return { error: "Choose a valid visibility." };
  }

  const supabase = await createSupabase();
  const { error } = await supabase.from("notes").insert({
    project_id: projectId,
    author_id: user.id,
    body,
    visibility,
  });
  if (error) return { error: `Could not create note: ${error.message}` };

  revalidatePath(`/admin/projects/${projectId}`);
  return {};
}
