import { notFound } from "next/navigation";
import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import InvoiceEditForm from "@/features/invoices/components/InvoiceEditForm";
import { getInvoiceById } from "@/features/invoices/data";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const invoice = await getInvoiceById(invoiceId);
  if (!invoice) notFound();

  return (
    <Panel className="max-w-[640px] p-7">
      <MonoLabel className="mb-2">EDIT INVOICE</MonoLabel>
      <div className="mb-6 text-[13px] text-muted">
        {invoice.projectName} · {invoice.clientName}
      </div>
      <InvoiceEditForm invoice={invoice} />
    </Panel>
  );
}
