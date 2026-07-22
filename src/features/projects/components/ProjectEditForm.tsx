"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  ghostButton,
  labelClasses,
} from "@/components/ui/fieldStyles";
import { updateProject, type ProjectFormState } from "../actions";

type Option = { id: string; name: string };

type ProjectEditFormProps = {
  projectId: string;
  defaultName: string;
  defaultStatus: "planning" | "on_track" | "at_risk" | "delivered";
  defaultProgress: number;
  defaultManagerId: string | null;
  defaultStartedOn: string | null; // ISO date
  team: Option[];
};

export default function ProjectEditForm({
  projectId,
  defaultName,
  defaultStatus,
  defaultProgress,
  defaultManagerId,
  defaultStartedOn,
  team,
}: ProjectEditFormProps) {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(
    updateProject,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <input type="hidden" name="id" value={projectId} />

      <label className="block">
        <span className={labelClasses}>Project name</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={defaultName}
          className={fieldClasses}
        />
      </label>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClasses}>Status</span>
          <select name="status" defaultValue={defaultStatus} className={fieldClasses}>
            <option value="planning">Planning</option>
            <option value="on_track">On Track</option>
            <option value="at_risk">At Risk</option>
            <option value="delivered">Delivered</option>
          </select>
        </label>

        <label className="block">
          <span className={labelClasses}>Progress (%)</span>
          <input
            type="number"
            name="progress"
            min={0}
            max={100}
            defaultValue={defaultProgress}
            className={fieldClasses}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClasses}>Manager</span>
          <select
            name="manager_id"
            defaultValue={defaultManagerId ?? ""}
            className={fieldClasses}
          >
            <option value="">Unassigned</option>
            {team.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className={labelClasses}>Start date</span>
          <input
            type="date"
            name="started_on"
            defaultValue={defaultStartedOn ?? ""}
            className={fieldClasses}
          />
        </label>
      </div>

      {state.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-1.5 flex items-center gap-2.5">
        <button type="submit" disabled={pending} className={accentButton}>
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link href={`/admin/projects/${projectId}`} className={ghostButton}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
