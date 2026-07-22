import type { Project } from "./types";

// Mock data ported from the prototype (index.html adminProjects).
// Replace with real queries when the backend lands — signatures stay the same.
const PROJECTS: Project[] = [
  {
    id: "aveline-brand-web",
    name: "Aveline Brand & Web Platform",
    clientId: "aveline-studio",
    clientName: "Aveline Studio",
    manager: "Sofia Lindqvist",
    type: "Creative",
    progress: 68,
    status: "On Track",
  },
  {
    id: "meridian-hq-fitout",
    name: "Meridian HQ Fit-out",
    clientId: "meridian-group",
    clientName: "Meridian Group",
    manager: "Erik Sandberg",
    type: "Infrastructure",
    progress: 42,
    status: "At Risk",
  },
  {
    id: "meridian-network-backbone",
    name: "Meridian Network Backbone",
    clientId: "meridian-group",
    clientName: "Meridian Group",
    manager: "Erik Sandberg",
    type: "Infrastructure",
    progress: 8,
    status: "Planning",
  },
  {
    id: "northwind-rebrand",
    name: "Northwind Rebrand",
    clientId: "northwind-co",
    clientName: "Northwind Co",
    manager: "Sofia Lindqvist",
    type: "Creative",
    progress: 90,
    status: "On Track",
  },
  {
    id: "lumen-facilities-upgrade",
    name: "Lumen Facilities Upgrade",
    clientId: "lumen-co",
    clientName: "Lumen Co",
    manager: "Erik Sandberg",
    type: "Infrastructure",
    progress: 15,
    status: "Planning",
  },
  {
    id: "atlas-product-launch",
    name: "Atlas Product Launch",
    clientId: "atlas-labs",
    clientName: "Atlas Labs",
    manager: "Marcus Vall",
    type: "Creative",
    progress: 100,
    status: "Delivered",
  },
  {
    id: "atlas-design-support",
    name: "Atlas Design Support",
    clientId: "atlas-labs",
    clientName: "Atlas Labs",
    manager: "Marcus Vall",
    type: "Creative",
    progress: 30,
    status: "On Track",
  },
];

export async function getProjects(): Promise<Project[]> {
  return PROJECTS;
}

export async function getProjectsForClient(clientId: string): Promise<Project[]> {
  return PROJECTS.filter((p) => p.clientId === clientId);
}
