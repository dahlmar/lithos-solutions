import type { Tone } from "@/components/ui/tones";

export type InvoiceStatus = "Draft" | "Issued" | "Paid" | "Overdue" | "Void";

export type Invoice = {
  id: string;
  number: string;
  projectId: string;
  projectName: string;
  clientName: string;
  clientEmail: string | null;
  amount: string; // formatted, e.g. "SEK 185,000"
  amountCents: number;
  currency: string;
  status: InvoiceStatus;
  statusValue: "draft" | "issued" | "paid" | "overdue" | "void";
  issuedOn: string | null; // ISO date
  dueOn: string | null;
  paidOn: string | null;
};

export const invoiceStatusTone: Record<InvoiceStatus, Tone> = {
  Draft: "muted",
  Issued: "warning",
  Paid: "positive",
  Overdue: "danger",
  Void: "muted",
};
