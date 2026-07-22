import Panel from "@/components/ui/Panel";
import { toneText } from "@/components/ui/tones";
import { shortDate } from "@/lib/format";
import { invoiceStatusTone, type Invoice } from "../types";

const COLS = "grid min-w-[680px] grid-cols-[1.1fr_2fr_0.9fr_0.9fr_1.1fr_0.8fr] items-center px-6";

export default function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <Panel className="p-8 text-center text-sm text-muted">
        No invoices yet.
      </Panel>
    );
  }

  return (
    <Panel className="overflow-x-auto">
      <div className={`${COLS} border-b border-white/8 py-3.5 font-mono text-[10px] tracking-[0.18em] text-muted`}>
        <span>INVOICE</span>
        <span>PROJECT</span>
        <span>ISSUED</span>
        <span>DUE</span>
        <span>AMOUNT</span>
        <span>STATUS</span>
      </div>
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className={`${COLS} border-b border-white/5 py-4 transition-colors hover:bg-white/2`}
        >
          <span className="font-mono text-[12.5px]">{invoice.number}</span>
          <span className="text-[12.5px] text-soft">{invoice.projectName}</span>
          <span className="text-[12.5px] text-muted">
            {invoice.issuedOn ? shortDate(invoice.issuedOn) : "—"}
          </span>
          <span className="text-[12.5px] text-muted">
            {invoice.dueOn ? shortDate(invoice.dueOn) : "—"}
          </span>
          <span className="text-[13px] font-medium">{invoice.amount}</span>
          <span className={`text-xs ${toneText[invoiceStatusTone[invoice.status]]}`}>
            {invoice.status}
          </span>
        </div>
      ))}
    </Panel>
  );
}
