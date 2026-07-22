import type { Tone } from "@/components/ui/tones";

export type DeliverableStatus =
  | "Upcoming"
  | "In progress"
  | "In review"
  | "Approved"
  | "Delivered";

export type Deliverable = {
  id: string;
  name: string;
  description: string;
  projectId: string;
  projectName: string;
  status: DeliverableStatus;
  statusValue: "upcoming" | "in_progress" | "in_review" | "approved" | "delivered";
  version: string | null;
  dueOn: string | null; // ISO date
};

export type DeliverableFile = {
  id: string;
  deliverableId: string;
  name: string;
  path: string;
  sizeBytes: number;
  /** Time-limited signed download URL (null if signing failed). */
  url: string | null;
};

export const deliverableStatusTone: Record<DeliverableStatus, Tone> = {
  Upcoming: "muted",
  "In progress": "neutral",
  "In review": "warning",
  Approved: "positive",
  Delivered: "positive",
};

/** Still being worked toward — counts for deadlines. */
export function isOpen(status: DeliverableStatus): boolean {
  return status !== "Approved" && status !== "Delivered";
}
