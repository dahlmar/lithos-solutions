import { notFound } from "next/navigation";
import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import ClientEditForm from "@/features/clients/components/ClientEditForm";
import { getClientById } from "@/features/clients/data";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClientById(clientId);
  if (!client) notFound();

  return (
    <Panel className="max-w-[560px] p-7">
      <MonoLabel className="mb-6">EDIT CLIENT</MonoLabel>
      <ClientEditForm client={client} />
    </Panel>
  );
}
