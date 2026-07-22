import type { Tone } from "@/components/ui/tones";

export type Stat = { label: string; value: string; delta: string; tone: Tone };
export type Upload = { name: string; who: string; project: string; time: string };
export type Deadline = { name: string; project: string; date: string; urgent: boolean };

// Mock data ported from the prototype (index.html adminStats / adminUploads / adminDeadlines).
const STATS: Stat[] = [
  { label: "Active Projects", value: "12", delta: "+2 this month", tone: "neutral" },
  { label: "Completed Projects", value: "48", delta: "all time", tone: "positive" },
  { label: "Delayed Projects", value: "2", delta: "needs attention", tone: "danger" },
  { label: "Pending Client Actions", value: "7", delta: "across 5 clients", tone: "warning" },
];

const UPLOADS: Upload[] = [
  { name: "Design System v3.zip", who: "Sofia Lindqvist", project: "Aveline", time: "2h ago" },
  { name: "Site Survey — North Wing.pdf", who: "Erik Sandberg", project: "Meridian HQ", time: "5h ago" },
  { name: "Invoice #0142.pdf", who: "Finance", project: "Aveline", time: "Yesterday" },
  { name: "Network As-Built.dwg", who: "Erik Sandberg", project: "Meridian HQ", time: "2 days ago" },
];

const DEADLINES: Deadline[] = [
  { name: "Design System Handoff", project: "Aveline", date: "Aug 04", urgent: false },
  { name: "Structural Sign-off", project: "Meridian HQ", date: "Jul 28", urgent: true },
  { name: "Phase 2 Invoice", project: "Northwind", date: "Jul 25", urgent: true },
  { name: "Brand Guidelines v2", project: "Lumen Co", date: "Aug 11", urgent: false },
];

export async function getDashboard() {
  return { stats: STATS, uploads: UPLOADS, deadlines: DEADLINES };
}
