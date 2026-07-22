"use client";

import { useActionState } from "react";
import { deleteNote, type NoteFormState } from "../actions";

export default function NoteDeleteButton({
  noteId,
  projectId,
}: {
  noteId: string;
  projectId: string;
}) {
  const [state, formAction, pending] = useActionState<NoteFormState, FormData>(
    deleteNote,
    {},
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this note?")) event.preventDefault();
      }}
      className="inline"
    >
      <input type="hidden" name="id" value={noteId} />
      <input type="hidden" name="project_id" value={projectId} />
      <button
        type="submit"
        disabled={pending}
        aria-label="Delete note"
        className="cursor-pointer text-[11px] text-muted transition-colors hover:text-danger disabled:opacity-60"
      >
        {pending ? "…" : "✕"}
      </button>
      {state.error ? (
        <span className="ml-2 text-[11px] text-danger" role="alert">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}
