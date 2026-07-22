import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import { getClients } from "@/features/clients/data";
import ProjectForm from "@/features/projects/components/ProjectForm";
import { getTeamMembers } from "@/features/team/data";

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const [{ client }, clients, team] = await Promise.all([
    searchParams,
    getClients(),
    getTeamMembers(),
  ]);

  return (
    <Panel className="max-w-[560px] p-7">
      <MonoLabel className="mb-6">NEW PROJECT</MonoLabel>
      <ProjectForm
        clients={clients.map(({ id, name }) => ({ id, name }))}
        team={team}
        defaultClientId={client}
      />
    </Panel>
  );
}
