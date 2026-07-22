"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  ghostButton,
  labelClasses,
} from "@/components/ui/fieldStyles";
import { createInvoice, type InvoiceFormState } from "../actions";

type Option = { id: string; name: string };

export default function InvoiceForm({ projects }: { projects: Option[] }) {
  const [state, formAction, pending] = useActionState<InvoiceFormState, FormData>(
    createInvoice,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <label className="block">
        <span className={labelClasses}>Project</span>
        <select name="project_id" required defaultValue="" className={fieldClasses}>
          <option value="" disabled>
            Choose a project…
          </option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={labelClasses}>Invoice number</span>
          <input
            type="text"
            name="number"
            required
            placeholder="INV-0144"
            className={fieldClasses}
          />
        </label>

        <label className="block">
          <span className={labelClasses}>Status</span>
          <select name="status" defaultValue="draft" className={fieldClasses}>
            <option value="draft">Draft — hidden from client</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="void">Void</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={labelClasses}>Amount</span>
          <input
            type="number"
            name="amount"
            required
            min={0}
            step="0.01"
            placeholder="185000"
            className={fieldClasses}
          />
        </label>

        <label className="block">
          <span className={labelClasses}>Currency</span>
          <select name="currency" defaultValue="SEK" className={fieldClasses}>
            <option value="SEK">SEK</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
            <option value="GBP">GBP</option>
            <option value="NOK">NOK</option>
            <option value="DKK">DKK</option>
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="block">
          <span className={labelClasses}>Issue date (optional)</span>
          <input type="date" name="issued_on" className={fieldClasses} />
        </label>

        <label className="block">
          <span className={labelClasses}>Due date (optional)</span>
          <input type="date" name="due_on" className={fieldClasses} />
        </label>
      </div>

      {state.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-1.5 flex items-center gap-2.5">
        <button type="submit" disabled={pending} className={accentButton}>
          {pending ? "Creating…" : "Create invoice"}
        </button>
        <Link href="/admin/invoices" className={ghostButton}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
