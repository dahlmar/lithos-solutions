import ClientTable from "@/features/clients/components/ClientTable";
import { getClients } from "@/features/clients/data";

export default async function ClientsPage() {
  const clients = await getClients();
  return <ClientTable clients={clients} />;
}
