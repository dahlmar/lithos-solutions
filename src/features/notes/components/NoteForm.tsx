"use client";

import { useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  labelClasses,
} from "@/components/ui/fieldStyles";
import { createNote, type NoteFormState } from "../actions";

export default function NoteForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState<NoteFormState, FormData>(
    createNote,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      <input type="hidden" name="project_id" value={projectId} />

      <label className="block">
        <span className={labelClasses}>Note</span>
        <textarea
          name="body"
          rows={3}
          required
          className={`${fieldClasses} resize-none`}
        />
      </label>

      <label className="block">
        <span className={labelClasses}>Visibility</span>
        <select name="visibility" defaultValue="internal" className={fieldClasses}>
          <option value="internal">Internal — team only</option>
          <option value="client">Client-visible — shows in their portal</option>
        </select>
      </label>

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
        {pending ? "Adding…" : "+ Add note"}
      </button>
    </form>
  );
}
