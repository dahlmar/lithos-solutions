import Link from "next/link";
import { accentButton } from "@/components/ui/fieldStyles";
import FilterBar from "@/components/ui/FilterBar";
import ProjectTable from "@/features/projects/components/ProjectTable";
import { getProjects } from "@/features/projects/data";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q, status } = await searchParams;
  const projects = await getProjects({ q, status });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterBar
          q={q}
          status={status}
          placeholder="Search projects…"
          statusOptions={[
            { value: "planning", label: "Planning" },
            { value: "on_track", label: "On Track" },
            { value: "at_risk", label: "At Risk" },
            { value: "delivered", label: "Delivered" },
          ]}
        />
        <Link href="/admin/projects/new" className={accentButton}>
          + New project
        </Link>
      </div>
      <ProjectTable projects={projects} />
    </>
  );
}
