import Panel from "@/components/ui/Panel";
import ProgressBar from "@/components/ui/ProgressBar";
import { toneText } from "@/components/ui/tones";
import { projectStatusTone, type Project } from "../types";

const COLS = "grid grid-cols-[2.2fr_1.3fr_1.2fr_1.4fr_0.9fr] items-center px-6";

export default function ProjectTable({ projects }: { projects: Project[] }) {
  return (
    <Panel className="overflow-hidden">
      <div className={`${COLS} border-b border-white/8 py-3.5 font-mono text-[10px] tracking-[0.18em] text-muted`}>
        <span>PROJECT</span>
        <span>CLIENT</span>
        <span>MANAGER</span>
        <span>PROGRESS</span>
        <span>STATUS</span>
      </div>
      {projects.map((project) => {
        const tone = projectStatusTone[project.status];
        return (
          <div
            key={project.id}
            className={`${COLS} border-b border-white/5 py-[17px] transition-colors hover:bg-white/3`}
          >
            <div>
              <div className="text-[13.5px] font-medium">{project.name}</div>
              <div className="text-[11px] text-muted">{project.type}</div>
            </div>
            <span className="text-[12.5px] text-soft">{project.clientName}</span>
            <span className="text-[12.5px] text-muted">{project.manager}</span>
            <ProgressBar value={project.progress} tone={tone} />
            <span className={`text-xs ${toneText[tone]}`}>{project.status}</span>
          </div>
        );
      })}
    </Panel>
  );
}
