import Link from "next/link";
import { notFound } from "next/navigation";
import { accentButton } from "@/components/ui/fieldStyles";
import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import ProgressBar from "@/components/ui/ProgressBar";
import StatusBadge from "@/components/ui/StatusBadge";
import DeliverableForm from "@/features/deliverables/components/DeliverableForm";
import { getDeliverablesForProject } from "@/features/deliverables/data";
import { deliverableStatusTone } from "@/features/deliverables/types";
import NoteForm from "@/features/notes/components/NoteForm";
import { getNotesForProject } from "@/features/notes/data";
import { getProjectById } from "@/features/projects/data";
import { projectStatusTone } from "@/features/projects/types";
import { longDate, shortDate } from "@/lib/format";

const NOTE_STYLES = {
  internal: {
    card: "border-danger/20 bg-danger/8",
    label: "text-danger",
    text: "INTERNAL",
  },
  client: {
    card: "border-accent/20 bg-accent/8",
    label: "text-accent",
    text: "CLIENT-VISIBLE",
  },
} as const;

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  if (!project) notFound();

  const [deliverables, notes] = await Promise.all([
    getDeliverablesForProject(project.id),
    getNotesForProject(project.id),
  ]);

  return (
    <>
      <Panel className="flex flex-wrap items-start justify-between gap-6 p-7">
        <div>
          <MonoLabel>
            <Link
              href="/admin/projects"
              className="transition-colors hover:text-foreground"
            >
              PROJECTS
            </Link>{" "}
            · {project.type.toUpperCase()} · {project.clientName.toUpperCase()}
          </MonoLabel>
          <h1 className="mt-3 text-2xl font-medium tracking-[-0.015em]">
            {project.name}
          </h1>
          <div className="mt-2 text-[13px] text-muted">PM {project.manager}</div>
          <div className="mt-3 max-w-[240px]">
            <ProgressBar
              value={project.progress}
              tone={projectStatusTone[project.status]}
            />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <StatusBadge tone={projectStatusTone[project.status]}>
            {project.status}
          </StatusBadge>
          <Link
            href={`/admin/projects/${project.id}/edit`}
            className={accentButton}
          >
            Edit status
          </Link>
        </div>
      </Panel>

      <div className="mt-[18px] grid grid-cols-[1.5fr_1fr] items-start gap-[18px]">
        <Panel className="p-6">
          <div className="mb-4 text-sm font-medium">Deliverables</div>
          <div className="flex flex-col">
            {deliverables.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between gap-3 border-b border-white/5 py-[11px]"
              >
                <div className="text-[13px]">
                  {d.name}
                  <span className="text-muted">
                    {d.dueOn ? ` · ${longDate(d.dueOn)}` : ""}
                    {d.version ? ` · ${d.version}` : ""}
                  </span>
                </div>
                <StatusBadge tone={deliverableStatusTone[d.status]}>
                  {d.status}
                </StatusBadge>
              </div>
            ))}
            {deliverables.length === 0 ? (
              <p className="pb-2 text-[13px] text-muted">No deliverables yet.</p>
            ) : null}
          </div>
          <div className="mt-5 border-t border-white/6 pt-5">
            <MonoLabel className="mb-4">ADD DELIVERABLE</MonoLabel>
            <DeliverableForm projectId={project.id} />
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="mb-4 text-sm font-medium">Notes</div>
          <div className="flex flex-col gap-2.5">
            {notes.map((note) => {
              const style = NOTE_STYLES[note.visibility];
              return (
                <div
                  key={note.id}
                  className={`rounded-[10px] border p-3 ${style.card}`}
                >
                  <div
                    className={`font-mono text-[9px] tracking-[0.2em] ${style.label}`}
                  >
                    {style.text}
                  </div>
                  <div className="mt-1.5 text-[12.5px] leading-relaxed text-soft">
                    {note.body}
                  </div>
                  <div className="mt-2 text-[11px] text-muted">
                    {note.authorName} · {shortDate(note.createdAt)}
                  </div>
                </div>
              );
            })}
            {notes.length === 0 ? (
              <p className="text-[13px] text-muted">No notes yet.</p>
            ) : null}
          </div>
          <div className="mt-5 border-t border-white/6 pt-5">
            <MonoLabel className="mb-4">ADD NOTE</MonoLabel>
            <NoteForm projectId={project.id} />
          </div>
        </Panel>
      </div>
    </>
  );
}
