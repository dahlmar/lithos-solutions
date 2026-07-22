"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { createClient as createSupabase } from "@/lib/supabase/server";

export type InvoiceFormState = { error?: string };

const STATUSES = ["draft", "issued", "paid", "overdue", "void"] as const;
const CURRENCIES = ["SEK", "EUR", "USD", "GBP", "NOK", "DKK"] as const;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createInvoice(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const projectId = String(formData.get("project_id") ?? "");
  const number = String(formData.get("number") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").replace(",", ".");
  const currency = String(formData.get("currency") ?? "");
  const status = String(formData.get("status") ?? "");
  const issuedOn = String(formData.get("issued_on") ?? "");
  const dueOn = String(formData.get("due_on") ?? "");

  if (!UUID_RE.test(projectId)) return { error: "Choose a project." };
  if (!number) return { error: "Invoice number is required." };

  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) {
    return { error: "Amount must be a non-negative number." };
  }
  const amountCents = Math.round(amount * 100);

  if (!CURRENCIES.includes(currency as (typeof CURRENCIES)[number])) {
    return { error: "Choose a valid currency." };
  }
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    return { error: "Choose a valid status." };
  }
  if (issuedOn && Number.isNaN(new Date(issuedOn).getTime())) {
    return { error: "Issue date doesn't look valid." };
  }
  if (dueOn && Number.isNaN(new Date(dueOn).getTime())) {
    return { error: "Due date doesn't look valid." };
  }

  const supabase = await createSupabase();
  const { error } = await supabase.from("invoices").insert({
    project_id: projectId,
    number,
    amount_cents: amountCents,
    currency,
    status,
    issued_on: issuedOn || null,
    due_on: dueOn || null,
  });
  if (error) {
    if (error.code === "23505") {
      return { error: `Invoice number ${number} already exists.` };
    }
    return { error: `Could not create invoice: ${error.message}` };
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin");
  redirect("/admin/invoices");
}
