import { getProjects } from "@/features/projects/data";
import type { Client, ClientWithCounts } from "./types";

// Mock data ported from the prototype (index.html adminClients).
const CLIENTS: Client[] = [
  { id: "aveline-studio", name: "Aveline Studio", contact: "client@aveline.studio", status: "Active" },
  { id: "meridian-group", name: "Meridian Group", contact: "ops@meridian.com", status: "Active" },
  { id: "northwind-co", name: "Northwind Co", contact: "hello@northwind.co", status: "Active" },
  { id: "lumen-co", name: "Lumen Co", contact: "admin@lumen.co", status: "Onboarding" },
  { id: "atlas-labs", name: "Atlas Labs", contact: "team@atlaslabs.io", status: "Active" },
];

export async function getClients(): Promise<ClientWithCounts[]> {
  const projects = await getProjects();
  return CLIENTS.map((client) => ({
    ...client,
    activeProjects: projects.filter(
      (p) => p.clientId === client.id && p.status !== "Delivered",
    ).length,
  }));
}

export async function getClientById(id: string): Promise<Client | undefined> {
  return CLIENTS.find((c) => c.id === id);
}
