import "server-only";

import { createClient } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/format";
import type { Invoice, InvoiceStatus } from "./types";

type InvoiceRow = {
  id: string;
  number: string;
  amount_cents: number;
  currency: string;
  status: "draft" | "issued" | "paid" | "overdue" | "void";
  issued_on: string | null;
  due_on: string | null;
  projects: { name: string } | null;
};

const STATUS_LABELS: Record<InvoiceRow["status"], InvoiceStatus> = {
  draft: "Draft",
  issued: "Issued",
  paid: "Paid",
  overdue: "Overdue",
  void: "Void",
};

/** RLS-scoped: clients get only their own projects' non-draft invoices. */
export async function getInvoices(): Promise<Invoice[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id, number, amount_cents, currency, status, issued_on, due_on, projects(name)")
    .order("issued_on", { ascending: false, nullsFirst: false });
  if (error) throw new Error(`Failed to load invoices: ${error.message}`);

  return (data as unknown as InvoiceRow[]).map((row) => ({
    id: row.id,
    number: row.number,
    projectName: row.projects?.name ?? "—",
    amount: formatMoney(row.amount_cents, row.currency.trim()),
    status: STATUS_LABELS[row.status],
    issuedOn: row.issued_on,
    dueOn: row.due_on,
  }));
}
