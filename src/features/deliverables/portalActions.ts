"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/features/auth/session";
import { createClient as createSupabase } from "@/lib/supabase/server";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ReviewState = { error?: string; done?: "approved" | "changes" };

/**
 * Client-side review of a deliverable in "In review". Runs through the
 * `review_deliverable` SECURITY DEFINER function, which enforces that the
 * caller's client owns the deliverable, flips the status, files the comment
 * as a client-visible note, and recomputes project progress.
 */
export async function reviewDeliverable(
  _prevState: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("client");

  const deliverableId = String(formData.get("deliverable_id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();

  if (!UUID_RE.test(deliverableId)) return { error: "Invalid deliverable." };
  if (decision !== "approve" && decision !== "changes") {
    return { error: "Invalid decision." };
  }
  if (decision === "changes" && !comment) {
    return { error: "Tell us what you'd like changed." };
  }

  const supabase = await createSupabase();
  const { error } = await supabase.rpc("review_deliverable", {
    p_deliverable_id: deliverableId,
    p_approve: decision === "approve",
    p_comment: comment || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/portal");
  revalidatePath("/portal/deliverables");
  return { done: decision === "approve" ? "approved" : "changes" };
}

export type CommentState = { error?: string; sent?: boolean };

/** Client comment on their own project — lands as a client-visible note. */
export async function addClientComment(
  _prevState: CommentState,
  formData: FormData,
): Promise<CommentState> {
  // Server actions are public endpoints — never rely on the page's check.
  const user = await requireUser("client");

  const projectId = String(formData.get("project_id") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!UUID_RE.test(projectId)) return { error: "Invalid project." };
  if (!body) return { error: "Write something first." };

  const supabase = await createSupabase();
  // RLS: insert allowed only on the caller's own projects, visibility 'client'.
  const { error } = await supabase.from("notes").insert({
    project_id: projectId,
    author_id: user.id,
    visibility: "client",
    body,
  });
  if (error) return { error: `Could not post comment: ${error.message}` };

  revalidatePath("/portal");
  return { sent: true };
}
