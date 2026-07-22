import Link from "next/link";
import MonoLabel from "@/components/ui/MonoLabel";
import Panel from "@/components/ui/Panel";
import StatCard from "@/components/ui/StatCard";
import { toneText } from "@/components/ui/tones";
import { getDashboard } from "@/features/dashboard/data";
import { shortDate } from "@/lib/format";

export default async function AdminDashboard() {
  const { stats, recent, deadlines, aging, activity } = await getDashboard();

  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ href, ...stat }) => (
          <Link key={stat.label} href={href} className="transition-opacity hover:opacity-80">
            <StatCard {...stat} />
          </Link>
        ))}
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] md:grid-cols-2">
        <Panel className="p-6">
          <MonoLabel className="mb-4">RECENT DELIVERABLES</MonoLabel>
          <div className="flex flex-col gap-[13px]">
            {recent.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="h-4 w-3.5 shrink-0 rounded-[3px] border border-white/25" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium">{item.name}</div>
                  <div className="text-[11px] text-muted">
                    {item.project} · {item.client}
                  </div>
                </div>
                <span className="shrink-0 text-[11px] text-muted">{item.updatedOn}</span>
              </div>
            ))}
            {recent.length === 0 ? (
              <p className="text-[13px] text-muted">No deliverables yet.</p>
            ) : null}
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
            {deadlines.length === 0 ? (
              <p className="text-[13px] text-muted">Nothing due.</p>
            ) : null}
          </div>
        </Panel>
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-[18px] md:grid-cols-2">
        <Panel className="p-6">
          <MonoLabel className="mb-4">OUTSTANDING INVOICES</MonoLabel>
          <div className="flex flex-col gap-3">
            {aging.map((bucket) => (
              <div key={bucket.label} className="flex items-baseline justify-between gap-3">
                <span className={`text-[13px] ${toneText[bucket.tone]}`}>
                  {bucket.label}
                </span>
                <span className="text-right text-[13px] font-medium">
                  {bucket.amounts.join(" + ")}
                </span>
              </div>
            ))}
            {aging.length === 0 ? (
              <p className="text-[13px] text-muted">Nothing outstanding.</p>
            ) : null}
          </div>
        </Panel>

        <Panel className="p-6">
          <MonoLabel className="mb-4">RECENT ACTIVITY</MonoLabel>
          <div className="flex flex-col gap-[11px]">
            {activity.map((event) => (
              <div key={event.id} className="flex items-baseline gap-2.5 text-[12.5px]">
                <span className="shrink-0 text-muted">{shortDate(event.createdAt)}</span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="text-soft">{event.actor}</span>{" "}
                  <span className="text-muted">{event.action}</span>{" "}
                  {event.summary}
                </span>
              </div>
            ))}
            {activity.length === 0 ? (
              <p className="text-[13px] text-muted">No activity recorded yet.</p>
            ) : null}
          </div>
        </Panel>
      </div>
    </>
  );
}
