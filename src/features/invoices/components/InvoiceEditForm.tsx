"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  ghostButton,
  labelClasses,
} from "@/components/ui/fieldStyles";
import type { Invoice } from "../types";
import { updateInvoice, type InvoiceFormState } from "../actions";

export default function InvoiceEditForm({ invoice }: { invoice: Invoice }) {
  const [state, formAction, pending] = useActionState<InvoiceFormState, FormData>(
    updateInvoice,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <input type="hidden" name="id" value={invoice.id} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClasses}>Invoice number</span>
          <input
            type="text"
            name="number"
            required
            defaultValue={invoice.number}
            className={fieldClasses}
          />
        </label>

        <label className="block">
          <span className={labelClasses}>Status</span>
          <select name="status" defaultValue={invoice.statusValue} className={fieldClasses}>
            <option value="draft">Draft — hidden from client</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="void">Void</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClasses}>Amount</span>
          <input
            type="number"
            name="amount"
            required
            min={0}
            step="0.01"
            defaultValue={invoice.amountCents / 100}
            className={fieldClasses}
          />
        </label>

        <label className="block">
          <span className={labelClasses}>Currency</span>
          <select name="currency" defaultValue={invoice.currency} className={fieldClasses}>
            <option value="SEK">SEK</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="NOK">NOK</option>
            <option value="DKK">DKK</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={labelClasses}>Issue date</span>
          <input
            type="date"
            name="issued_on"
            defaultValue={invoice.issuedOn ?? ""}
            className={fieldClasses}
          />
        </label>

        <label className="block">
          <span className={labelClasses}>Due date</span>
          <input
            type="date"
            name="due_on"
            defaultValue={invoice.dueOn ?? ""}
            className={fieldClasses}
          />
        </label>

        <label className="block">
          <span className={labelClasses}>Paid date</span>
          <input
            type="date"
            name="paid_on"
            defaultValue={invoice.paidOn ?? ""}
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
        <Link href={`/admin/invoices/${invoice.id}`} className={ghostButton}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
