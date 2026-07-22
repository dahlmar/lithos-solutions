"use client";

import { useActionState } from "react";

export type DeleteState = { error?: string };

type DeleteFormProps = {
  action: (prevState: DeleteState, formData: FormData) => Promise<DeleteState>;
  id: string;
  /** Button label, e.g. "Delete client". */
  label: string;
  confirmMessage: string;
  className?: string;
};

/** Danger-styled delete button with a native confirm gate and error display. */
export default function DeleteForm({
  action,
  id,
  label,
  confirmMessage,
  className = "",
}: DeleteFormProps) {
  const [state, formAction, pending] = useActionState<DeleteState, FormData>(
    action,
    {},
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      className={className}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer rounded-[10px] border border-danger/30 px-4 py-[9px] text-[12.5px] text-danger transition-colors hover:border-danger/60 hover:bg-danger/10 disabled:cursor-default disabled:opacity-60"
      >
        {pending ? "Deleting…" : label}
      </button>
      {state.error ? (
        <p className="mt-2 text-[12.5px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
