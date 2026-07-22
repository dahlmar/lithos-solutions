import Link from "next/link";
import { accentButton } from "@/components/ui/fieldStyles";
import ClientTable from "@/features/clients/components/ClientTable";
import { getClients } from "@/features/clients/data";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link href="/admin/clients/new" className={accentButton}>
          + New client
        </Link>
      </div>
      <ClientTable clients={clients} />
    </>
  );
}
