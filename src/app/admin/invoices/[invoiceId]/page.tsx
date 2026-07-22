import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteForm from "@/components/ui/DeleteForm";
import { ghostButton } from "@/components/ui/fieldStyles";
import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import { deleteInvoice } from "@/features/invoices/actions";
import {
  MarkPaidButton,
  SendReminderButton,
} from "@/features/invoices/components/InvoiceActions";
import { getInvoiceById } from "@/features/invoices/data";
import { invoiceStatusTone } from "@/features/invoices/types";
import { dueLabel, longDate } from "@/lib/format";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) notFound();

  const open = invoice.statusValue === "issued" || invoice.statusValue === "overdue";

  return (
    <>
      <Panel className="p-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <MonoLabel>
              <Link
                href="/admin/invoices"
                className="transition-colors hover:text-foreground"
              >
                INVOICES
              </Link>{" "}
              · {invoice.clientName.toUpperCase()}
            </MonoLabel>
            <h1 className="mt-3 font-mono text-2xl tracking-[-0.01em]">
              {invoice.number}
            </h1>
            <div className="mt-2 text-[13px] text-muted">
              <Link
                href={`/admin/projects/${invoice.projectId}`}
                className="transition-colors hover:text-foreground"
              >
                {invoice.projectName}
              </Link>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[30px] font-semibold tracking-[-0.02em]">
              {invoice.amount}
            </div>
            <div className="mt-2">
              <StatusBadge tone={invoiceStatusTone[invoice.status]}>
                {invoice.status}
              </StatusBadge>
            </div>
          </div>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-5 border-t border-white/6 pt-6 sm:grid-cols-4">
          <div>
            <div className="text-[11px] text-muted">Issued</div>
            <div className="mt-1.5 text-[13px]">
              {invoice.issuedOn ? longDate(invoice.issuedOn) : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted">Due</div>
            <div className="mt-1.5 text-[13px]">
              {invoice.dueOn ? longDate(invoice.dueOn) : "—"}
              {open && invoice.dueOn ? (
                <span className="ml-2 text-[11.5px] text-muted">
                  ({dueLabel(invoice.dueOn)})
                </span>
              ) : null}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted">Paid</div>
            <div className="mt-1.5 text-[13px]">
              {invoice.paidOn ? longDate(invoice.paidOn) : "—"}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-muted">Billed to</div>
            <div className="mt-1.5 text-[13px]">
              {invoice.clientEmail ?? invoice.clientName}
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-2.5 border-t border-white/6 pt-6">
          {invoice.statusValue !== "paid" && invoice.statusValue !== "void" ? (
            <MarkPaidButton invoiceId={invoice.id} />
          ) : null}
          {open ? <SendReminderButton invoiceId={invoice.id} /> : null}
          <Link href={`/admin/invoices/${invoice.id}/edit`} className={ghostButton}>
            Edit
          </Link>
          <DeleteForm
            action={deleteInvoice}
            id={invoice.id}
            label="Delete"
            confirmMessage={`Delete invoice ${invoice.number}? This cannot be undone.`}
          />
        </div>
      </Panel>
    </>
  );
}
