import Link from "next/link";
import { accentButton } from "@/components/ui/fieldStyles";
import FilterBar from "@/components/ui/FilterBar";
import ClientTable from "@/features/clients/components/ClientTable";
import { getClients } from "@/features/clients/data";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const clients = await getClients({ q, status });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          q={q}
          status={status}
          placeholder="Search clients…"
          statusOptions={[
            { value: "active", label: "Active" },
            { value: "onboarding", label: "Onboarding" },
            { value: "paused", label: "Paused" },
          ]}
        />
        <Link href="/admin/clients/new" className={accentButton}>
          + New client
        </Link>
      </div>
      <ClientTable clients={clients} />
    </>
  );
}
