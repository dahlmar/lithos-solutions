"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  ghostButton,
  labelClasses,
} from "@/components/ui/fieldStyles";
import { createProject, type ProjectFormState } from "../actions";

type Option = { id: string; name: string };

type ProjectFormProps = {
  clients: Option[];
  team: Option[];
  defaultClientId?: string;
};

export default function ProjectForm({
  clients,
  team,
  defaultClientId,
}: ProjectFormProps) {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(
    createProject,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <label className="block">
        <span className={labelClasses}>Project name</span>
        <input type="text" name="name" required className={fieldClasses} />
      </label>

      <label className="block">
        <span className={labelClasses}>Client</span>
        <select
          name="client_id"
          required
          defaultValue={defaultClientId ?? ""}
          className={fieldClasses}
        >
          <option value="" disabled>
            Choose a client…
          </option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={labelClasses}>Type</span>
          <select name="type" defaultValue="creative" className={fieldClasses}>
            <option value="creative">Creative</option>
            <option value="infrastructure">Infrastructure</option>
          </select>
        </label>

        <label className="block">
          <span className={labelClasses}>Status</span>
          <select name="status" defaultValue="planning" className={fieldClasses}>
            <option value="planning">Planning</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="delivered">Delivered</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={labelClasses}>Manager</span>
          <select name="manager_id" defaultValue="" className={fieldClasses}>
            <option value="">Unassigned</option>
            {team.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClasses}>Start date (optional)</span>
          <input type="date" name="started_on" className={fieldClasses} />
        </label>
      </div>

      <label className="block">
        <span className={labelClasses}>Progress (%)</span>
        <input
          type="number"
          name="progress"
          min={0}
          max={100}
          defaultValue={0}
          className={fieldClasses}
        />
      </label>

      {state.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-1.5 flex items-center gap-2.5">
        <button type="submit" disabled={pending} className={accentButton}>
          {pending ? "Creating…" : "Create project"}
        </button>
        <Link href="/admin/projects" className={ghostButton}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
