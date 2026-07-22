"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  ghostButton,
  labelClasses,
} from "@/components/ui/fieldStyles";
import type { Client } from "../types";
import { updateClient, type ClientFormState } from "../actions";

export default function ClientEditForm({ client }: { client: Client }) {
  const [state, formAction, pending] = useActionState<ClientFormState, FormData>(
    updateClient,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <input type="hidden" name="id" value={client.id} />

      <label className="block">
        <span className={labelClasses}>Client name</span>
        <input
          type="text"
          name="name"
          required
          defaultValue={client.name}
          className={fieldClasses}
        />
      </label>

      <label className="block">
        <span className={labelClasses}>Contact email (optional)</span>
        <input
          type="email"
          name="contact_email"
          defaultValue={client.contactEmail ?? ""}
          className={fieldClasses}
        />
      </label>

      <label className="block">
        <span className={labelClasses}>Status</span>
        <select
          name="status"
          defaultValue={client.statusValue}
          className={fieldClasses}
        >
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
          {pending ? "Saving…" : "Save changes"}
        </button>
        <Link href={`/admin/clients/${client.id}`} className={ghostButton}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
