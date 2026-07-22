import "server-only";

import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import type { Invoice, InvoiceStatus } from "./types";

type InvoiceRow = {
  id: string;
  project_id: string;
  number: string;
  amount_cents: number;
  currency: string;
  status: "draft" | "issued" | "paid" | "overdue" | "void";
  issued_on: string | null;
  due_on: string | null;
  paid_on: string | null;
  projects: {
    name: string;
    clients: { name: string; contact_email: string | null } | null;
  } | null;
};

const STATUS_LABELS: Record<InvoiceRow["status"], InvoiceStatus> = {
  draft: "Draft",
  issued: "Issued",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

const INVOICE_SELECT =
  "id, project_id, number, amount_cents, currency, status, issued_on, due_on, paid_on, projects(name, clients(name, contact_email))";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,
    number: row.number,
    projectId: row.project_id,
    projectName: row.projects?.name ?? "—",
    clientName: row.projects?.clients?.name ?? "—",
    clientEmail: row.projects?.clients?.contact_email ?? null,
    amount: formatMoney(row.amount_cents, row.currency.trim()),
    amountCents: row.amount_cents,
    currency: row.currency.trim(),
    status: STATUS_LABELS[row.status],
    statusValue: row.status,
    issuedOn: row.issued_on,
    dueOn: row.due_on,
    paidOn: row.paid_on,
  };
}

/** RLS-scoped: clients get only their own projects' non-draft invoices. */
export async function getInvoices(filter?: {
  q?: string;
  status?: string;
}): Promise<Invoice[]> {
  const supabase = await createClient();
  let query = supabase
    .from("invoices")
    .select(INVOICE_SELECT)
    .order("issued_on", { ascending: false, nullsFirst: false });
  if (filter?.q) query = query.ilike("number", `%${filter.q}%`);
  if (filter?.status === "open") {
    query = query.in("status", ["issued", "overdue"]);
  } else if (
    filter?.status &&
    ["draft", "issued", "paid", "overdue", "void"].includes(filter.status)
  ) {
    query = query.eq("status", filter.status);
  }
  const { data, error } = await query;
  if (error) throw new Error(`Failed to load invoices: ${error.message}`);
  return (data as unknown as InvoiceRow[]).map(toInvoice);
}

export async function getInvoiceById(id: string): Promise<Invoice | undefined> {
  // Route params are user input — reject non-UUIDs before they hit Postgres.
  if (!UUID_RE.test(id)) return undefined;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select(INVOICE_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load invoice: ${error.message}`);
  return data ? toInvoice(data as unknown as InvoiceRow) : undefined;
}

/** Non-void, non-draft total for a project — the "invoiced so far" figure. */
export async function getInvoicedTotalForProject(
  projectId: string,
): Promise<{ totalCents: number; currency: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("amount_cents, currency, status")
    .eq("project_id", projectId)
    .in("status", ["issued", "paid", "overdue"]);
  if (error) throw new Error(`Failed to load invoice totals: ${error.message}`);

  type Row = { amount_cents: number; currency: string };
  const rows = data as Row[];
  return {
    totalCents: rows.reduce((sum, row) => sum + row.amount_cents, 0),
    currency: rows[0]?.currency.trim() ?? null,
  };
}
