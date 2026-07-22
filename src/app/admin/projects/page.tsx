import ProjectTable from "@/features/projects/components/ProjectTable";
import { getProjects } from "@/features/projects/data";

export default async function ProjectsPage() {
  const projects = await getProjects();
  return <ProjectTable projects={projects} />;
}
