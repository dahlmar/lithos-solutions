import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import InvoiceForm from "@/features/invoices/components/InvoiceForm";
import { getProjects } from "@/features/projects/data";

export default async function NewInvoicePage() {
  const projects = await getProjects();

  return (
    <Panel className="max-w-[560px] p-7">
      <MonoLabel className="mb-6">NEW INVOICE</MonoLabel>
      <InvoiceForm
        projects={projects.map((p) => ({
          id: p.id,
          name: `${p.name} — ${p.clientName}`,
        }))}
      />
    </Panel>
  );
}
