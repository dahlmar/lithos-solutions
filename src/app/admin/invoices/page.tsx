import Link from "next/link";
import { accentButton } from "@/components/ui/fieldStyles";
import FilterBar from "@/components/ui/FilterBar";
import InvoiceTable from "@/features/invoices/components/InvoiceTable";
import { getInvoices } from "@/features/invoices/data";

export default async function AdminInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const invoices = await getInvoices({ q, status });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          q={q}
          status={status}
          placeholder="Search invoice number…"
          statusOptions={[
            { value: "open", label: "Open (issued + overdue)" },
            { value: "draft", label: "Draft" },
            { value: "issued", label: "Issued" },
            { value: "paid", label: "Paid" },
            { value: "overdue", label: "Overdue" },
            { value: "void", label: "Void" },
          ]}
        />
        <Link href="/admin/invoices/new" className={accentButton}>
          + New invoice
        </Link>
      </div>
      <InvoiceTable invoices={invoices} hrefBase="/admin/invoices" />
    </>
  );
}
