import Link from "next/link";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import { toneText } from "@/components/ui/tones";
import { shortDate } from "@/lib/format";
import { invoiceStatusTone, type Invoice } from "../types";

const COLS = "grid min-w-[680px] grid-cols-[1.1fr_2fr_0.9fr_0.9fr_1.1fr_0.8fr] items-center px-6";

type InvoiceTableProps = {
  invoices: Invoice[];
  /** When set, rows link to `${hrefBase}/${id}` (admin detail view). */
  hrefBase?: string;
};

export default function InvoiceTable({ invoices, hrefBase }: InvoiceTableProps) {
  if (invoices.length === 0) {
    return (
      <Panel className="p-8 text-center text-sm text-muted">
        No invoices yet.
      </Panel>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards — no sideways scrolling on a phone. */}
      <div className="flex flex-col gap-3 md:hidden">
        {invoices.map((invoice) => {
          const inner = (
            <>
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[13px]">{invoice.number}</span>
                <StatusBadge tone={invoiceStatusTone[invoice.status]}>
                  {invoice.status}
                </StatusBadge>
              </div>
              <div className="mt-2 text-[12.5px] text-muted">{invoice.projectName}</div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <span className="text-[15px] font-medium">{invoice.amount}</span>
                <span className="text-[11.5px] text-muted">
                  {invoice.dueOn ? `Due ${shortDate(invoice.dueOn)}` : "No due date"}
                </span>
              </div>
            </>
          );
          return hrefBase ? (
            <Link key={invoice.id} href={`${hrefBase}/${invoice.id}`}>
              <Panel className="p-5 transition-colors hover:bg-white/5">{inner}</Panel>
            </Link>
          ) : (
            <Panel key={invoice.id} className="p-5">
              {inner}
            </Panel>
          );
        })}
      </div>

      {/* Desktop: dense table. */}
      <Panel className="hidden overflow-x-auto md:block">
        <div className={`${COLS} border-b border-white/8 py-3.5 font-mono text-[10px] tracking-[0.18em] text-muted`}>
          <span>INVOICE</span>
          <span>PROJECT</span>
          <span>ISSUED</span>
          <span>DUE</span>
          <span>AMOUNT</span>
          <span>STATUS</span>
        </div>
        {invoices.map((invoice) => {
          const cells = (
            <>
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
            </>
          );
          return hrefBase ? (
            <Link
              key={invoice.id}
              href={`${hrefBase}/${invoice.id}`}
              className={`${COLS} border-b border-white/5 py-4 transition-colors hover:bg-white/3`}
            >
              {cells}
            </Link>
          ) : (
            <div
              key={invoice.id}
              className={`${COLS} border-b border-white/5 py-4 transition-colors hover:bg-white/2`}
            >
              {cells}
            </div>
          );
        })}
      </Panel>
    </>
  );
}
