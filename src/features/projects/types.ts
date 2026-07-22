import type { Tone } from "@/components/ui/tones";

export type ProjectStatus = "On Track" | "At Risk" | "Planning" | "Delivered";

export type Project = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  manager: string;
  managerId: string | null;
  type: "Creative" | "Infrastructure";
  progress: number; // 0–100
  status: ProjectStatus;
  startedOn: string | null; // ISO date
};

export const projectStatusTone: Record<ProjectStatus, Tone> = {
  "On Track": "positive",
  "At Risk": "danger",
  Planning: "info",
  Delivered: "muted",
};

/** Display label → database enum value (for form defaults). */
export const projectStatusValue: Record<
  ProjectStatus,
  "planning" | "on_track" | "at_risk" | "delivered"
> = {
  Planning: "planning",
  "On Track": "on_track",
  "At Risk": "at_risk",
  Delivered: "delivered",
};
