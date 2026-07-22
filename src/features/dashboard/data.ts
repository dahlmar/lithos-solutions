import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tone } from "@/components/ui/tones";

export type Stat = { label: string; value: string; delta: string; tone: Tone };
export type RecentDeliverable = {
  name: string;
  project: string;
  client: string;
  updatedOn: string;
};
export type Deadline = {
  name: string;
  project: string;
  date: string;
  urgent: boolean;
};

type DeliverableRow = {
  id: string;
  name: string;
  status: "upcoming" | "in_progress" | "in_review" | "approved" | "delivered";
  due_on: string | null;
  updated_at: string;
  projects: { name: string; clients: { name: string } | null } | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

export async function getDashboard() {
  const supabase = await createClient();

  const [projectsRes, deliverablesRes, invoicesRes] = await Promise.all([
    supabase.from("projects").select("status"),
    supabase
      .from("deliverables")
      .select("id, name, status, due_on, updated_at, projects(name, clients(name))"),
    supabase.from("invoices").select("status"),
  ]);

  const failed = projectsRes.error ?? deliverablesRes.error ?? invoicesRes.error;
  if (failed) throw new Error(`Failed to load dashboard: ${failed.message}`);

  const projectStatuses = (projectsRes.data as { status: string }[]).map(
    (p) => p.status,
  );
  const deliverables = deliverablesRes.data as unknown as DeliverableRow[];
  const invoiceStatuses = (invoicesRes.data as { status: string }[]).map(
    (i) => i.status,
  );

  const activeCount = projectStatuses.filter((s) => s !== "delivered").length;
  const deliveredCount = projectStatuses.filter((s) => s === "delivered").length;
  const atRiskCount = projectStatuses.filter((s) => s === "at_risk").length;
  const openInvoices = invoiceStatuses.filter(
    (s) => s === "issued" || s === "overdue",
  ).length;

  const stats: Stat[] = [
    { label: "Active Projects", value: String(activeCount), delta: "in delivery", tone: "neutral" },
    { label: "Delivered Projects", value: String(deliveredCount), delta: "all time", tone: "positive" },
    { label: "At Risk", value: String(atRiskCount), delta: atRiskCount > 0 ? "needs attention" : "all clear", tone: atRiskCount > 0 ? "danger" : "muted" },
    { label: "Open Invoices", value: String(openInvoices), delta: "issued & overdue", tone: openInvoices > 0 ? "warning" : "muted" },
  ];

  const recent: RecentDeliverable[] = [...deliverables]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .slice(0, 4)
    .map((d) => ({
      name: d.name,
      project: d.projects?.name ?? "—",
      client: d.projects?.clients?.name ?? "—",
      updatedOn: shortDate(d.updated_at),
    }));

  const now = Date.now();
  const deadlines: Deadline[] = deliverables
    .filter(
      (d) =>
        d.due_on !== null && d.status !== "approved" && d.status !== "delivered",
    )
    .sort((a, b) => a.due_on!.localeCompare(b.due_on!))
    .slice(0, 4)
    .map((d) => ({
      name: d.name,
      project: d.projects?.name ?? "—",
      date: shortDate(d.due_on!),
      urgent: new Date(d.due_on!).getTime() - now < 7 * DAY_MS,
    }));

  return { stats, recent, deadlines };
}
