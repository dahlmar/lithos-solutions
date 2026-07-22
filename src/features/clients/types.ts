import type { Tone } from "@/components/ui/tones";

export type ClientStatus = "Active" | "Onboarding" | "Paused";

export type Client = {
  id: string;
  name: string;
  contact: string;
  /** Raw email (null when unset) — for edit forms and notifications. */
  contactEmail: string | null;
  status: ClientStatus;
  /** Database enum value — for form defaults. */
  statusValue: "active" | "onboarding" | "paused";
};

/** A client joined with its project count for list views. */
export type ClientWithCounts = Client & {
  activeProjects: number;
};

export const clientStatusTone: Record<ClientStatus, Tone> = {
  Active: "positive",
  Onboarding: "warning",
  Paused: "muted",
};
