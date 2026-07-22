import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import StatCard from "@/components/ui/StatCard";
import { getDashboard } from "@/features/dashboard/data";

export default async function AdminDashboard() {
  const { stats, uploads, deadlines } = await getDashboard();

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-[18px] grid grid-cols-2 gap-[18px]">
        <Panel className="p-6">
          <MonoLabel className="mb-4">RECENT UPLOADS</MonoLabel>
          <div className="flex flex-col gap-[13px]">
            {uploads.map((upload) => (
              <div key={upload.name} className="flex items-center gap-3">
                <span className="h-4 w-3.5 shrink-0 rounded-[3px] border border-white/25" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{upload.name}</div>
                  <div className="text-[11px] text-muted">
                    {upload.who} · {upload.project}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-muted">{upload.time}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <MonoLabel className="mb-4">UPCOMING DEADLINES</MonoLabel>
          <div className="flex flex-col gap-[13px]">
            {deadlines.map((deadline) => (
              <div key={deadline.name} className="flex items-center gap-3">
                <span
                  className={`h-[7px] w-[7px] shrink-0 rounded-full ${
                    deadline.urgent ? "bg-danger" : "bg-muted"
                  }`}
                />
                <div className="flex-1">
                  <div className="text-[13px] font-medium">{deadline.name}</div>
                  <div className="text-[11px] text-muted">{deadline.project}</div>
                </div>
                <span
                  className={`shrink-0 text-xs ${
                    deadline.urgent ? "text-danger" : "text-muted"
                  }`}
                >
                  {deadline.date}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  );
}
