"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { createClient as createSupabase } from "@/lib/supabase/server";

export type ClientFormState = { error?: string };

const STATUSES = ["active", "onboarding", "paused"] as const;

export async function createClientRecord(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();
  const status = String(formData.get("status") ?? "");

  if (!name) return { error: "Client name is required." };
  if (contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail)) {
    return { error: "Contact email doesn't look valid." };
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: "Choose a valid status." };
  }

  const supabase = await createSupabase();
  const { error } = await supabase.from("clients").insert({
    name,
    contact_email: contactEmail || null,
    status,
  });
  if (error) return { error: `Could not create client: ${error.message}` };

  revalidatePath("/admin/clients");
  redirect("/admin/clients");
}
