import type { Metadata } from "next";
import InvoiceTable from "@/features/invoices/components/InvoiceTable";
import { getInvoices } from "@/features/invoices/data";

export const metadata: Metadata = {
  title: "Invoices",
};

export default async function InvoicesPage() {
  const invoices = await getInvoices();
  return <InvoiceTable invoices={invoices} />;
}
