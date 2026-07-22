"use client";

import { useState, useActionState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  accentButton,
  fieldClasses,
  labelClasses,
} from "@/components/ui/fieldStyles";
import type { PortalUser } from "../data";
import { updateUserAccess, type UserFormState } from "../actions";

type Option = { id: string; name: string };

export default function UserRow({
  user,
  clients,
}: {
  user: PortalUser;
  clients: Option[];
}) {
  const [editing, setEditing] = useState(false);
  const [role, setRole] = useState<"client" | "admin">(user.role);
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    updateUserAccess,
    {},
  );

  return (
    <div className="border-b border-white/5 px-6 py-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[13.5px] font-medium">{user.name}</div>
          <div className="mt-0.5 truncate text-[12px] text-muted">{user.email}</div>
        </div>
        <StatusBadge tone={user.role === "admin" ? "info" : "neutral"}>
          {user.role === "admin" ? "Admin" : "Client"}
        </StatusBadge>
        <span className="hidden text-[12px] text-muted sm:block">
          {user.clientName ?? (user.role === "admin" ? "Staff" : "Unlinked")}
        </span>
        <button
          type="button"
          onClick={() => setEditing((value) => !value)}
          className="cursor-pointer text-[12px] text-muted transition-colors hover:text-foreground"
        >
          {editing ? "Close" : "Edit"}
        </button>
      </div>

      {editing ? (
        <form
          action={formAction}
          className="mt-3.5 flex flex-col gap-3.5 rounded-[10px] border border-white/8 bg-white/2 p-4"
        >
          <input type="hidden" name="user_id" value={user.id} />

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <label className="block">
              <span className={labelClasses}>Full name</span>
              <input
                type="text"
                name="full_name"
                defaultValue={user.name === "Unnamed" ? "" : user.name}
                className={fieldClasses}
              />
            </label>

            <label className="block">
              <span className={labelClasses}>Role</span>
              <select
                name="role"
                value={role}
                onChange={(event) =>
                  setRole(event.target.value as "client" | "admin")
                }
                className={fieldClasses}
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            {role === "client" ? (
              <label className="block">
                <span className={labelClasses}>Client workspace</span>
                <select
                  name="client_id"
                  required
                  defaultValue={user.clientId ?? ""}
                  className={fieldClasses}
                >
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
            <p className="text-[12.5px] text-danger" role="alert">
              {state.error}
            </p>
          ) : null}
          {state.done ? (
            <p className="text-[12.5px] text-accent">{state.done}</p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className={`${accentButton} self-start`}
          >
            {pending ? "Saving…" : "Save"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
