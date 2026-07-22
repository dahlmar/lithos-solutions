import { notFound } from "next/navigation";
import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import ProgressBar from "@/components/ui/ProgressBar";
import ProjectEditForm from "@/features/projects/components/ProjectEditForm";
import { getProjectById } from "@/features/projects/data";
import { projectStatusTone, projectStatusValue } from "@/features/projects/types";
import { getTeamMembers } from "@/features/team/data";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [project, team] = await Promise.all([
    getProjectById(projectId),
    getTeamMembers(),
  ]);
  if (!project) notFound();

  return (
    <Panel className="max-w-[560px] p-7">
      <MonoLabel>
        EDIT · {project.type.toUpperCase()} · {project.clientName.toUpperCase()}
      </MonoLabel>
      <h1 className="mt-3 text-xl font-medium tracking-[-0.015em]">
        {project.name}
      </h1>
      <div className="mt-3 max-w-[240px]">
        <ProgressBar value={project.progress} tone={projectStatusTone[project.status]} />
      </div>

      <div className="mt-7 border-t border-white/6 pt-6">
        <ProjectEditForm
          projectId={project.id}
          defaultName={project.name}
          defaultStatus={projectStatusValue[project.status]}
          defaultProgress={project.progress}
          defaultManagerId={project.managerId}
          defaultStartedOn={project.startedOn}
          defaultBudget={project.budgetCents === null ? null : project.budgetCents / 100}
          team={team}
        />
      </div>
    </Panel>
  );
}
