import Link from "next/link";
import Panel from "@/components/ui/Panel";
import { toneText } from "@/components/ui/tones";
import { clientStatusTone, type ClientWithCounts } from "../types";

const COLS = "grid grid-cols-[1.6fr_1fr_2fr_1fr] items-center px-6";

export default function ClientTable({ clients }: { clients: ClientWithCounts[] }) {
  return (
    <Panel className="overflow-hidden">
      <div className={`${COLS} border-b border-white/8 py-3.5 font-mono text-[10px] tracking-[0.18em] text-muted`}>
        <span>CLIENT</span>
        <span>PROJECTS</span>
        <span>CONTACT</span>
        <span>STATUS</span>
      </div>
      {clients.map((client) => (
        <Link
          key={client.id}
          href={`/admin/clients/${client.id}`}
          className={`${COLS} border-b border-white/5 py-[17px] transition-colors hover:bg-white/3`}
        >
          <span className="flex items-center gap-3 text-[13.5px] font-medium">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/6 text-[10px] text-muted">
              {client.activeProjects}
            </span>
            {client.name}
          </span>
          <span className="text-[12.5px] text-muted">{client.activeProjects} active</span>
          <span className="text-[12.5px] text-muted">{client.contact}</span>
          <span className={`text-xs ${toneText[clientStatusTone[client.status]]}`}>
            {client.status}
          </span>
        </Link>
      ))}
    </Panel>
  );
}
