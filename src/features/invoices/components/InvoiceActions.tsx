"use client";

import { useActionState } from "react";
import { accentButton, ghostButton } from "@/components/ui/fieldStyles";
import {
  markInvoicePaid,
  sendInvoiceReminder,
  type InvoiceFormState,
  type ReminderState,
} from "../actions";

/** One-click "mark paid" — sets status and stamps today's date. */
export function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const [state, formAction, pending] = useActionState<InvoiceFormState, FormData>(
    markInvoicePaid,
    {},
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1.5">
      <input type="hidden" name="id" value={invoiceId} />
      <button type="submit" disabled={pending} className={accentButton}>
        {pending ? "Marking…" : "Mark as paid"}
      </button>
      {state.error ? (
        <p className="text-[12.5px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

/** Emails the client a payment reminder via Resend. */
export function SendReminderButton({ invoiceId }: { invoiceId: string }) {
  const [state, formAction, pending] = useActionState<ReminderState, FormData>(
    sendInvoiceReminder,
    {},
  );

  return (
    <form action={formAction} className="inline-flex flex-col items-start gap-1.5">
      <input type="hidden" name="id" value={invoiceId} />
      <button type="submit" disabled={pending} className={ghostButton}>
        {pending ? "Sending…" : state.sent ? "Reminder sent ✓" : "Send reminder"}
      </button>
      {state.error ? (
        <p className="text-[12.5px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
