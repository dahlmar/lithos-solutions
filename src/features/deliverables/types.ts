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
  projectName: string;
  status: DeliverableStatus;
  version: string | null;
  dueOn: string | null; // ISO date
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
