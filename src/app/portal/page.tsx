import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import ProgressRing from "@/components/ui/ProgressRing";
import { getDeliverables } from "@/features/deliverables/data";
import { isOpen } from "@/features/deliverables/types";
import { getRecentNotes } from "@/features/notes/data";
import { getProjects } from "@/features/projects/data";
import { dueLabel, longDate, shortDate } from "@/lib/format";

export default async function PortalDashboard() {
  // All three queries are RLS-scoped to the signed-in user's client.
  const [projects, deliverables, notes] = await Promise.all([
    getProjects(),
    getDeliverables(),
    getRecentNotes(4),
  ]);

  const active = projects.filter((p) => p.status !== "Delivered");
  const current = active[0] ?? projects[0];
  const nextUp = deliverables.find((d) => d.dueOn !== null && isOpen(d.status));

  if (!current) {
    return (
      <Panel className="p-8 text-center">
        <MonoLabel className="justify-center">CURRENT PROJECT</MonoLabel>
        <p className="mt-4 text-sm text-muted">
          No projects yet — your engagement will appear here once it kicks off.
        </p>
      </Panel>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-[1.4fr_1fr]">
        <Panel className="p-7">
          <MonoLabel>CURRENT PROJECT</MonoLabel>
          <div className="mt-3.5 text-[26px] font-medium tracking-[-0.015em]">
            {current.name}
          </div>
          <div className="mt-6 flex flex-wrap gap-10">
            <div>
              <div className="text-[11px] text-muted">Project Manager</div>
              <div className="mt-1.5 text-sm font-medium">{current.manager}</div>
            </div>
            <div>
              <div className="text-[11px] text-muted">Type</div>
              <div className="mt-1.5 text-sm font-medium">{current.type}</div>
            </div>
            <div>
              <div className="text-[11px] text-muted">Status</div>
              <div className="mt-1.5 text-sm font-medium">{current.status}</div>
            </div>
          </div>
          {active.length > 1 ? (
            <div className="mt-5 text-xs text-muted">
              + {active.length - 1} more active{" "}
              {active.length === 2 ? "project" : "projects"}
            </div>
          ) : null}
        </Panel>

        <Panel className="flex items-center gap-6 p-7">
          <ProgressRing value={current.progress} />
          <div>
            <div className="text-[13px] text-muted">Overall progress</div>
            <div className="mt-2 text-sm leading-6">
              {current.status === "On Track"
                ? "On schedule"
                : current.status === "At Risk"
                  ? "Schedule under review"
                  : current.status}
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] md:grid-cols-[1fr_1.4fr]">
        <Panel className="p-[26px]">
          <MonoLabel>UPCOMING MILESTONE</MonoLabel>
          {nextUp ? (
            <>
              <div className="mt-4 text-[19px] font-medium">{nextUp.name}</div>
              <div className="mt-2 text-[13px] text-muted">
                Due {longDate(nextUp.dueOn!)} · {dueLabel(nextUp.dueOn!)}
              </div>
              <div className="mt-4 text-[13px] leading-relaxed text-soft">
                {nextUp.description}
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-muted">Nothing scheduled right now.</p>
          )}
        </Panel>

        <Panel className="p-[26px]">
          <MonoLabel>RECENT ACTIVITY</MonoLabel>
          <div className="mt-4 flex flex-col gap-[15px]">
            {notes.map((note) => (
              <div key={note.id} className="flex items-start gap-3">
                <span className="mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />
                <div className="flex-1">
                  <div className="text-[13px] leading-snug">{note.body}</div>
                  <div className="mt-[3px] text-[11px] text-muted">
                    {note.projectName} · {shortDate(note.createdAt)}
                  </div>
                </div>
              </div>
            ))}
            {notes.length === 0 ? (
              <p className="text-sm text-muted">No updates yet.</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </>
  );
}
