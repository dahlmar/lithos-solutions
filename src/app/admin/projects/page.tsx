import Link from "next/link";
import { accentButton } from "@/components/ui/fieldStyles";
import ProjectTable from "@/features/projects/components/ProjectTable";
import { getProjects } from "@/features/projects/data";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link href="/admin/projects/new" className={accentButton}>
          + New project
        </Link>
      </div>
      <ProjectTable projects={projects} />
    </>
  );
}
