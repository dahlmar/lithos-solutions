import type { Metadata } from "next";
import Panel from "@/components/ui/Panel";
import StatusBadge from "@/components/ui/StatusBadge";
import ReviewControls from "@/features/deliverables/components/ReviewControls";
import {
  getDeliverables,
  getFilesForDeliverables,
} from "@/features/deliverables/data";
import { deliverableStatusTone } from "@/features/deliverables/types";
import { longDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Deliverables",
};

export default async function DeliverablesPage() {
  const deliverables = await getDeliverables();
  const filesByDeliverable = await getFilesForDeliverables(
    deliverables.map((d) => d.id),
  );

  if (deliverables.length === 0) {
    return (
      <Panel className="p-8 text-center text-sm text-muted">
        No deliverables yet — they&apos;ll appear here as your project takes shape.
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
      {deliverables.map((d) => (
        <Panel key={d.id} className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="text-[17px] font-medium">{d.name}</div>
            <StatusBadge tone={deliverableStatusTone[d.status]}>
              {d.status}
            </StatusBadge>
          </div>
          <div className="mt-2 text-[12.5px] text-muted">
            {d.projectName}
            {d.dueOn ? ` · Due ${longDate(d.dueOn)}` : ""}
          </div>
          {d.description ? (
            <div className="mt-4 text-[13px] leading-relaxed text-soft">
              {d.description}
            </div>
          ) : null}
          {d.version ? (
            <div className="mt-[18px] flex items-center gap-2 border-t border-white/6 pt-3.5 text-xs text-muted">
              <span className="h-3.5 w-3 rounded-[2px] border border-muted" />
              <span className="font-mono">{d.version}</span>
            </div>
          ) : null}
          {(filesByDeliverable.get(d.id) ?? []).length > 0 ? (
            <div className="mt-4 flex flex-col gap-1.5 border-t border-white/6 pt-3.5">
              {(filesByDeliverable.get(d.id) ?? []).map((file) => (
                <a
                  key={file.id}
                  href={file.url ?? "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[12.5px] text-soft transition-colors hover:text-accent"
                >
                  <span className="h-3.5 w-3 shrink-0 rounded-[2px] border border-muted" />
                  <span className="truncate">{file.name}</span>
                  <span className="ml-auto text-[11px] text-muted">Download</span>
                </a>
              ))}
            </div>
          ) : null}
          {d.status === "In review" ? (
            <ReviewControls deliverableId={d.id} />
          ) : null}
        </Panel>
      ))}
    </div>
  );
}
