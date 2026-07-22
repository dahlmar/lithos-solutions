"use client";

import { useState, useActionState } from "react";
import { accentButton, fieldClasses, ghostButton } from "@/components/ui/fieldStyles";
import { reviewDeliverable, type ReviewState } from "../portalActions";

/** Approve / request-changes controls shown to clients on "In review" work. */
export default function ReviewControls({ deliverableId }: { deliverableId: string }) {
  const [mode, setMode] = useState<"idle" | "changes">("idle");
  const [state, formAction, pending] = useActionState<ReviewState, FormData>(
    reviewDeliverable,
    {},
  );

  if (state.done === "approved") {
    return (
      <p className="mt-4 border-t border-white/6 pt-3.5 text-[12.5px] text-accent">
        Approved — thank you, the team has been notified.
      </p>
    );
  }
  if (state.done === "changes") {
    return (
      <p className="mt-4 border-t border-white/6 pt-3.5 text-[12.5px] text-soft">
        Change request sent — the team will follow up.
      </p>
    );
  }

  return (
    <div className="mt-4 border-t border-white/6 pt-3.5">
      {mode === "idle" ? (
        <div className="flex flex-wrap items-center gap-2.5">
          <form action={formAction}>
            <input type="hidden" name="deliverable_id" value={deliverableId} />
            <input type="hidden" name="decision" value="approve" />
            <button type="submit" disabled={pending} className={accentButton}>
              {pending ? "Sending…" : "Approve"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setMode("changes")}
            className={ghostButton}
          >
            Request changes
          </button>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-2.5">
          <input type="hidden" name="deliverable_id" value={deliverableId} />
          <input type="hidden" name="decision" value="changes" />
          <textarea
            name="comment"
            rows={3}
            required
            autoFocus
            placeholder="What would you like changed?"
            className={`${fieldClasses} mt-0 resize-none`}
          />
          <div className="flex items-center gap-2.5">
            <button type="submit" disabled={pending} className={accentButton}>
              {pending ? "Sending…" : "Send request"}
            </button>
            <button
              type="button"
              onClick={() => setMode("idle")}
              className={ghostButton}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      {state.error ? (
        <p className="mt-2 text-[12.5px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
