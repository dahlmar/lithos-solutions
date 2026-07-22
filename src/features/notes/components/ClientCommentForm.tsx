"use client";

import { useActionState } from "react";
import { accentButton, fieldClasses } from "@/components/ui/fieldStyles";
import {
  addClientComment,
  type CommentState,
} from "@/features/deliverables/portalActions";

/** Lets a client post a message to the team from their portal dashboard. */
export default function ClientCommentForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState<CommentState, FormData>(
    addClientComment,
    {},
  );

  return (
    <form action={formAction} className="mt-5 border-t border-white/6 pt-4">
      <input type="hidden" name="project_id" value={projectId} />
      <textarea
        name="body"
        rows={2}
        required
        placeholder="Send a message to the team…"
        className={`${fieldClasses} mt-0 resize-none`}
      />
      {state.error ? (
        <p className="mt-2 text-[12.5px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.sent ? (
        <p className="mt-2 text-[12.5px] text-accent">Sent — the team will see it.</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className={`${accentButton} mt-2.5`}
      >
        {pending ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
