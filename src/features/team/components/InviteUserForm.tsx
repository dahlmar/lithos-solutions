"use client";

import { useState, useActionState } from "react";
import {
  accentButton,
  fieldClasses,
  labelClasses,
} from "@/components/ui/fieldStyles";
import { inviteUser, type UserFormState } from "../actions";

type Option = { id: string; name: string };

export default function InviteUserForm({ clients }: { clients: Option[] }) {
  const [role, setRole] = useState<"client" | "admin">("client");
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    inviteUser,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClasses}>Email</span>
          <input type="email" name="email" required className={fieldClasses} />
        </label>

        <label className="block">
          <span className={labelClasses}>Full name</span>
          <input type="text" name="full_name" className={fieldClasses} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelClasses}>Role</span>
          <select
            name="role"
            value={role}
            onChange={(event) => setRole(event.target.value as "client" | "admin")}
            className={fieldClasses}
          >
            <option value="client">Client — portal access only</option>
            <option value="admin">Admin — full access</option>
          </select>
        </label>

        {role === "client" ? (
          <label className="block">
            <span className={labelClasses}>Client workspace</span>
            <select name="client_id" required defaultValue="" className={fieldClasses}>
              <option value="" disabled>
                Choose a client…
              </option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {state.error ? (
        <p className="text-[13px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.done ? (
        <p className="text-[13px] text-accent">{state.done}</p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className={`${accentButton} self-start`}
      >
        {pending ? "Inviting…" : "Invite user"}
      </button>
    </form>
  );
}
