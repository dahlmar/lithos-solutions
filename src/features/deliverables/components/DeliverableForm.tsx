"use client";

import { useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  labelClasses,
} from "@/components/ui/fieldStyles";
import { createDeliverable, type DeliverableFormState } from "../actions";

export default function DeliverableForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState<
    DeliverableFormState,
    FormData
  >(createDeliverable, {});

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <input type="hidden" name="project_id" value={projectId} />

      <label className="block">
        <span className={labelClasses}>Name</span>
        <input type="text" name="name" required className={fieldClasses} />
      </label>

      <label className="block">
        <span className={labelClasses}>Description (optional)</span>
        <textarea
          name="description"
          rows={2}
          className={`${fieldClasses} resize-none`}
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className={labelClasses}>Status</span>
          <select name="status" defaultValue="upcoming" className={fieldClasses}>
            <option value="upcoming">Upcoming</option>
            <option value="in_progress">In progress</option>
            <option value="in_review">In review</option>
            <option value="approved">Approved</option>
            <option value="delivered">Delivered</option>
          </select>
        </label>

        <label className="block">
          <span className={labelClasses}>Due (optional)</span>
          <input type="date" name="due_on" className={fieldClasses} />
        </label>

        <label className="block">
          <span className={labelClasses}>Version (optional)</span>
          <input
            type="text"
            name="version"
            placeholder="v1.0"
            className={fieldClasses}
          />
        </label>
      </div>

      {state.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={`${accentButton} self-start`}
      >
        {pending ? "Adding…" : "+ Add deliverable"}
      </button>
    </form>
  );
}
