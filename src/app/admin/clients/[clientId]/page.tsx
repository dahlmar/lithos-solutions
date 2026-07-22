import Link from "next/link";
import { notFound } from "next/navigation";
import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import { getClientById } from "@/features/clients/data";
import { clientStatusTone } from "@/features/clients/types";
import ProjectTable from "@/features/projects/components/ProjectTable";
import { getProjectsForClient } from "@/features/projects/data";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClientById(clientId);
  if (!client) notFound();

  const projects = await getProjectsForClient(clientId);
  const active = projects.filter((p) => p.status !== "Delivered");

  return (
    <>
      <Panel className="flex flex-wrap items-start justify-between gap-6 p-7">
        <div>
          <MonoLabel>
            <Link href="/admin/clients" className="transition-colors hover:text-foreground">
              CLIENTS
            </Link>{" "}
            · {client.name.toUpperCase()}
          </MonoLabel>
          <h1 className="mt-3 text-2xl font-medium tracking-[-0.015em]">{client.name}</h1>
          <div className="mt-2 text-[13px] text-muted">
            {client.contact} · {active.length} active{" "}
            {active.length === 1 ? "project" : "projects"}
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <StatusBadge tone={clientStatusTone[client.status]}>{client.status}</StatusBadge>
          <button className="cursor-pointer rounded-[10px] bg-accent px-4 py-[9px] text-[12.5px] font-medium text-[#06120d]">
            + New project
          </button>
        </div>
      </Panel>

      <MonoLabel className="mb-3.5 mt-7">PROJECTS</MonoLabel>
      {projects.length > 0 ? (
        <ProjectTable projects={projects} />
      ) : (
        <Panel className="p-6 text-[13px] text-muted">No projects yet.</Panel>
      )}
    </>
  );
}
