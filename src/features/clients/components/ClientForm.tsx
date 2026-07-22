"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  ghostButton,
  labelClasses,
} from "@/components/ui/fieldStyles";
import { createClientRecord, type ClientFormState } from "../actions";

export default function ClientForm() {
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(
    createClientRecord,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <label className="block">
        <span className={labelClasses}>Client name</span>
        <input type="text" name="name" required className={fieldClasses} />
      </label>

      <label className="block">
        <span className={labelClasses}>Contact email (optional)</span>
        <input type="email" name="contact_email" className={fieldClasses} />
      </label>

      <label className="block">
        <span className={labelClasses}>Status</span>
        <select name="status" defaultValue="onboarding" className={fieldClasses}>
          <option value="onboarding">Onboarding</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>
      </label>

      {state.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="mt-1.5 flex items-center gap-2.5">
        <button type="submit" disabled={pending} className={accentButton}>
          {pending ? "Creating…" : "Create client"}
        </button>
        <Link href="/admin/clients" className={ghostButton}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
