"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/features/auth/session";
import { invoiceIssuedEmail, invoiceReminderEmail } from "@/lib/email";
import { formatMoney, longDate } from "@/lib/format";
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

  if (status === "issued") {
    await notifyInvoiceIssued(projectId, number, amountCents, currency, dueOn || null);
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin");
  redirect("/admin/invoices");
}

/** Email the project's client that an invoice is available. Fail-soft. */
async function notifyInvoiceIssued(
  projectId: string,
  number: string,
  amountCents: number,
  currency: string,
  dueOn: string | null,
): Promise<void> {
  const supabase = await createSupabase();
  const { data } = await supabase
    .from("projects")
    .select("name, clients(contact_email)")
    .eq("id", projectId)
    .maybeSingle();
  const row = data as unknown as {
    name: string;
    clients: { contact_email: string | null } | null;
  } | null;
  const to = row?.clients?.contact_email;
  if (!to) return;
  await invoiceIssuedEmail({
    to,
    number,
    amount: formatMoney(amountCents, currency),
    projectName: row?.name ?? "your project",
    dueOn: dueOn ? longDate(dueOn) : null,
  });
}

export async function updateInvoice(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const id = String(formData.get("id") ?? "");
  const number = String(formData.get("number") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").replace(",", ".");
  const currency = String(formData.get("currency") ?? "");
  const status = String(formData.get("status") ?? "");
  const issuedOn = String(formData.get("issued_on") ?? "");
  const dueOn = String(formData.get("due_on") ?? "");
  const paidOn = String(formData.get("paid_on") ?? "");

  if (!UUID_RE.test(id)) return { error: "Invalid invoice." };
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
  for (const [label, value] of [
    ["Issue date", issuedOn],
    ["Due date", dueOn],
    ["Paid date", paidOn],
  ] as const) {
    if (value && Number.isNaN(new Date(value).getTime())) {
      return { error: `${label} doesn't look valid.` };
    }
  }

  const supabase = await createSupabase();

  // Detect the draft→issued transition so the client gets notified.
  const { data: before } = await supabase
    .from("invoices")
    .select("status, project_id")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase
    .from("invoices")
    .update({
      number,
      amount_cents: amountCents,
      currency,
      status,
      issued_on: issuedOn || null,
      due_on: dueOn || null,
      paid_on: paidOn || null,
    })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return { error: `Invoice number ${number} already exists.` };
    }
    return { error: `Could not update invoice: ${error.message}` };
  }

  if (before && before.status !== "issued" && status === "issued") {
    await notifyInvoiceIssued(
      before.project_id,
      number,
      amountCents,
      currency,
      dueOn || null,
    );
  }

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin");
  redirect(`/admin/invoices/${id}`);
}

export async function markInvoicePaid(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { error: "Invalid invoice." };

  const supabase = await createSupabase();
  const { error } = await supabase
    .from("invoices")
    .update({
      status: "paid",
      paid_on: new Date().toISOString().slice(0, 10),
    })
    .eq("id", id);
  if (error) return { error: `Could not mark as paid: ${error.message}` };

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
  revalidatePath("/admin");
  return {};
}

export type ReminderState = { error?: string; sent?: boolean };

export async function sendInvoiceReminder(
  _prevState: ReminderState,
  formData: FormData,
): Promise<ReminderState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { error: "Invalid invoice." };

  const supabase = await createSupabase();
  const { data } = await supabase
    .from("invoices")
    .select(
      "number, amount_cents, currency, status, due_on, projects(name, clients(contact_email))",
    )
    .eq("id", id)
    .maybeSingle();
  const row = data as unknown as {
    number: string;
    amount_cents: number;
    currency: string;
    status: string;
    due_on: string | null;
    projects: {
      name: string;
      clients: { contact_email: string | null } | null;
    } | null;
  } | null;

  if (!row) return { error: "Invoice not found." };
  const to = row.projects?.clients?.contact_email;
  if (!to) {
    return { error: "The client has no contact email — add one on the client page." };
  }

  const result = await invoiceReminderEmail({
    to,
    number: row.number,
    amount: formatMoney(row.amount_cents, row.currency.trim()),
    projectName: row.projects?.name ?? "your project",
    dueOn: row.due_on ? longDate(row.due_on) : null,
    overdue: row.status === "overdue",
  });
  if (!result.sent) {
    return { error: `Reminder not sent: ${result.reason ?? "unknown error"}.` };
  }
  return { sent: true };
}

export async function deleteInvoice(
  _prevState: InvoiceFormState,
  formData: FormData,
): Promise<InvoiceFormState> {
  // Server actions are public endpoints — never rely on the page's check.
  await requireUser("admin");

  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { error: "Invalid invoice." };

  const supabase = await createSupabase();
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) return { error: `Could not delete invoice: ${error.message}` };

  revalidatePath("/admin/invoices");
  revalidatePath("/admin");
  redirect("/admin/invoices");
}
