import type { Tone } from "@/components/ui/tones";

export type ProjectStatus = "On Track" | "At Risk" | "Planning" | "Delivered";

export type Project = {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  manager: string;
  type: "Creative" | "Infrastructure";
  progress: number; // 0–100
  status: ProjectStatus;
};

export const projectStatusTone: Record<ProjectStatus, Tone> = {
  "On Track": "positive",
  "At Risk": "danger",
  Planning: "info",
  Delivered: "muted",
};
