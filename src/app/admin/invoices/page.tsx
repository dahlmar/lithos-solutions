import Link from "next/link";
import { accentButton } from "@/components/ui/fieldStyles";
import InvoiceTable from "@/features/invoices/components/InvoiceTable";
import { getInvoices } from "@/features/invoices/data";

export default async function AdminInvoicesPage() {
  const invoices = await getInvoices();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link href="/admin/invoices/new" className={accentButton}>
          + New invoice
        </Link>
      </div>
      <InvoiceTable invoices={invoices} />
    </>
  );
}
