"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  ghostButton,
  labelClasses,
} from "@/components/ui/fieldStyles";
import { updateProjectStatus, type ProjectFormState } from "../actions";

type ProjectEditFormProps = {
  projectId: string;
  defaultStatus: "planning" | "on_track" | "at_risk" | "delivered";
  defaultProgress: number;
};

export default function ProjectEditForm({
  projectId,
  defaultStatus,
  defaultProgress,
}: ProjectEditFormProps) {
  const [state, formAction, pending] = useActionState<ProjectFormState, FormData>(
    updateProjectStatus,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <input type="hidden" name="id" value={projectId} />

      <div className="grid grid-cols-2 gap-4">
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
