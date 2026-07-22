import type { Tone } from "@/components/ui/tones";

export type InvoiceStatus = "Draft" | "Issued" | "Paid" | "Overdue" | "Void";

export type Invoice = {
  id: string;
  number: string;
  projectName: string;
  amount: string; // formatted, e.g. "SEK 185,000"
  status: InvoiceStatus;
  issuedOn: string | null; // ISO date
  dueOn: string | null;
};

export const invoiceStatusTone: Record<InvoiceStatus, Tone> = {
  Draft: "muted",
  Issued: "warning",
  Paid: "positive",
  Overdue: "danger",
  Void: "muted",
};
