import "server-only";

import { createClient } from "@/lib/supabase/server";
import { formatMoney, shortDate } from "@/lib/format";
import type { Tone } from "@/components/ui/tones";

export type Stat = {
  label: string;
  value: string;
  delta: string;
  tone: Tone;
  href: string;
};

export type AgingBucket = { label: string; amounts: string[]; tone: Tone };

export type ActivityEvent = {
  id: number;
  actor: string;
  action: string;
  summary: string;
  createdAt: string;
};
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

export async function getDashboard() {
  const supabase = await createClient();

  const [projectsRes, deliverablesRes, invoicesRes, auditRes] = await Promise.all([
    supabase.from("projects").select("status"),
    supabase
      .from("deliverables")
      .select("id, name, status, due_on, updated_at, projects(name, clients(name))"),
    supabase.from("invoices").select("status, amount_cents, currency, due_on"),
    supabase
      .from("audit_log")
      .select("id, action, table_name, summary, created_at, profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  // audit_log is tolerated missing (migration 0003 not applied yet).
  const failed = projectsRes.error ?? deliverablesRes.error ?? invoicesRes.error;
  if (failed) throw new Error(`Failed to load dashboard: ${failed.message}`);

  const projectStatuses = (projectsRes.data as { status: string }[]).map(
    (p) => p.status,
  );
  const deliverables = deliverablesRes.data as unknown as DeliverableRow[];
  type InvoiceLite = {
    status: string;
    amount_cents: number;
    currency: string;
    due_on: string | null;
  };
  const invoices = invoicesRes.data as InvoiceLite[];
  const invoiceStatuses = invoices.map((i) => i.status);

  const activeCount = projectStatuses.filter((s) => s !== "delivered").length;
  const deliveredCount = projectStatuses.filter((s) => s === "delivered").length;
  const atRiskCount = projectStatuses.filter((s) => s === "at_risk").length;
  const openInvoices = invoiceStatuses.filter(
    (s) => s === "issued" || s === "overdue",
  ).length;

  const stats: Stat[] = [
    { label: "Active Projects", value: String(activeCount), delta: "in delivery", tone: "neutral", href: "/admin/projects" },
    { label: "Delivered Projects", value: String(deliveredCount), delta: "all time", tone: "positive", href: "/admin/projects?status=delivered" },
    { label: "At Risk", value: String(atRiskCount), delta: atRiskCount > 0 ? "needs attention" : "all clear", tone: atRiskCount > 0 ? "danger" : "muted", href: "/admin/projects?status=at_risk" },
    { label: "Open Invoices", value: String(openInvoices), delta: "issued & overdue", tone: openInvoices > 0 ? "warning" : "muted", href: "/admin/invoices?status=open" },
  ];

  // Outstanding receivables, bucketed by how overdue they are.
  const DAY = 24 * 60 * 60 * 1000;
  const today = Date.now();
  const open = invoices.filter((i) => i.status === "issued" || i.status === "overdue");
  const bucketDefs: { label: string; tone: Tone; match: (days: number | null) => boolean }[] = [
    { label: "Not due yet", tone: "neutral", match: (d) => d === null || d <= 0 },
    { label: "1–30 days overdue", tone: "warning", match: (d) => d !== null && d > 0 && d <= 30 },
    { label: "31–60 days overdue", tone: "warning", match: (d) => d !== null && d > 30 && d <= 60 },
    { label: "60+ days overdue", tone: "danger", match: (d) => d !== null && d > 60 },
  ];
  const aging: AgingBucket[] = bucketDefs
    .map(({ label, tone, match }) => {
      const rows = open.filter((i) => {
        const days = i.due_on
          ? Math.floor((today - new Date(i.due_on).getTime()) / DAY)
          : null;
        return match(days);
      });
      const byCurrency = new Map<string, number>();
      for (const row of rows) {
        const cur = row.currency.trim();
        byCurrency.set(cur, (byCurrency.get(cur) ?? 0) + row.amount_cents);
      }
      return {
        label,
        tone,
        amounts: [...byCurrency.entries()].map(([cur, cents]) =>
          formatMoney(cents, cur),
        ),
      };
    })
    .filter((bucket) => bucket.amounts.length > 0);

  type AuditRow = {
    id: number;
    action: string;
    table_name: string;
    summary: string;
    created_at: string;
    profiles: { full_name: string } | null;
  };
  const ACTION_LABELS: Record<string, string> = {
    INSERT: "created",
    UPDATE: "updated",
    DELETE: "deleted",
  };
  const activity: ActivityEvent[] = auditRes.error
    ? []
    : (auditRes.data as unknown as AuditRow[]).map((row) => ({
        id: row.id,
        actor: row.profiles?.full_name || "System",
        action: `${ACTION_LABELS[row.action] ?? row.action.toLowerCase()} ${row.table_name.replace(/s$/, "")}`,
        summary: row.summary,
        createdAt: row.created_at,
      }));

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

  return { stats, recent, deadlines, aging, activity };
}
