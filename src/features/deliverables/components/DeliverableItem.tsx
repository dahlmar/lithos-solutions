"use client";

import { useRef, useState, useTransition, useActionState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import {
  accentButton,
  fieldClasses,
  labelClasses,
} from "@/components/ui/fieldStyles";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import { longDate } from "@/lib/format";
import type { Deliverable, DeliverableFile } from "../types";
import { deliverableStatusTone } from "../types";
import {
  deleteDeliverable,
  deleteDeliverableFile,
  recordDeliverableFile,
  updateDeliverable,
  type DeliverableFormState,
  type FileState,
} from "../actions";

type DeliverableItemProps = {
  deliverable: Deliverable;
  files: DeliverableFile[];
  /** Owning client id — first folder of every storage path. */
  clientId: string;
};

export default function DeliverableItem({
  deliverable,
  files,
  clientId,
}: DeliverableItemProps) {
  const [editing, setEditing] = useState(false);
  const [editState, editAction, editPending] = useActionState<
    DeliverableFormState,
    FormData
  >(updateDeliverable, {});
  const [deleteState, deleteAction, deletePending] = useActionState<
    DeliverableFormState,
    FormData
  >(deleteDeliverable, {});

  return (
    <div className="border-b border-white/5 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-[13px]">
          {deliverable.name}
          <span className="text-muted">
            {deliverable.dueOn ? ` · ${longDate(deliverable.dueOn)}` : ""}
            {deliverable.version ? ` · ${deliverable.version}` : ""}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge tone={deliverableStatusTone[deliverable.status]}>
            {deliverable.status}
          </StatusBadge>
          <button
            type="button"
            onClick={() => setEditing((value) => !value)}
            className="cursor-pointer text-[11.5px] text-muted transition-colors hover:text-foreground"
          >
            {editing ? "Close" : "Edit"}
          </button>
          <form
            action={deleteAction}
            onSubmit={(event) => {
              if (!window.confirm(`Delete "${deliverable.name}" and its files?`))
                event.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={deliverable.id} />
            <button
              type="submit"
              disabled={deletePending}
              className="cursor-pointer text-[11.5px] text-danger/80 transition-colors hover:text-danger disabled:opacity-60"
            >
              {deletePending ? "…" : "Delete"}
            </button>
          </form>
        </div>
      </div>

      {deleteState.error ? (
        <p className="mt-1.5 text-[12px] text-danger" role="alert">
          {deleteState.error}
        </p>
      ) : null}

      <FileList files={files} projectId={deliverable.projectId} />
      <FileUpload deliverable={deliverable} clientId={clientId} />

      {editing ? (
        <form
          action={editAction}
          className="mt-3 flex flex-col gap-3 rounded-[10px] border border-white/8 bg-white/2 p-3.5"
        >
          <input type="hidden" name="id" value={deliverable.id} />
          <input type="hidden" name="project_id" value={deliverable.projectId} />

          <label className="block">
            <span className={labelClasses}>Name</span>
            <input
              type="text"
              name="name"
              required
              defaultValue={deliverable.name}
              className={fieldClasses}
            />
          </label>

          <label className="block">
            <span className={labelClasses}>Description</span>
            <textarea
              name="description"
              rows={2}
              defaultValue={deliverable.description}
              className={`${fieldClasses} resize-none`}
            />
          </label>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="block">
              <span className={labelClasses}>Status</span>
              <select
                name="status"
                defaultValue={deliverable.statusValue}
                className={fieldClasses}
              >
                <option value="upcoming">Upcoming</option>
                <option value="in_progress">In progress</option>
                <option value="in_review">In review</option>
                <option value="approved">Approved</option>
                <option value="delivered">Delivered</option>
              </select>
            </label>

            <label className="block">
              <span className={labelClasses}>Due</span>
              <input
                type="date"
                name="due_on"
                defaultValue={deliverable.dueOn ?? ""}
                className={fieldClasses}
              />
            </label>

            <label className="block">
              <span className={labelClasses}>Version</span>
              <input
                type="text"
                name="version"
                defaultValue={deliverable.version ?? ""}
                className={fieldClasses}
              />
            </label>
          </div>

          {editState.error ? (
            <p className="text-[12.5px] text-danger" role="alert">
              {editState.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={editPending}
            className={`${accentButton} self-start`}
          >
            {editPending ? "Saving…" : "Save"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function FileList({
  files,
  projectId,
}: {
  files: DeliverableFile[];
  projectId: string;
}) {
  const [state, formAction] = useActionState<FileState, FormData>(
    deleteDeliverableFile,
    {},
  );

  if (files.length === 0) return null;
  return (
    <div className="mt-2 flex flex-col gap-1">
      {files.map((file) => (
        <div key={file.id} className="flex items-center gap-2 text-[12px]">
          <span className="h-3.5 w-3 shrink-0 rounded-[2px] border border-muted" />
          {file.url ? (
            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="truncate text-soft transition-colors hover:text-accent"
            >
              {file.name}
            </a>
          ) : (
            <span className="truncate text-muted">{file.name}</span>
          )}
          <span className="text-muted">{formatSize(file.sizeBytes)}</span>
          <form
            action={formAction}
            onSubmit={(event) => {
              if (!window.confirm(`Remove ${file.name}?`)) event.preventDefault();
            }}
            className="ml-auto"
          >
            <input type="hidden" name="id" value={file.id} />
            <input type="hidden" name="project_id" value={projectId} />
            <button
              type="submit"
              className="cursor-pointer text-[11px] text-muted transition-colors hover:text-danger"
            >
              ✕
            </button>
          </form>
        </div>
      ))}
      {state.error ? (
        <p className="text-[12px] text-danger" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}

function FileUpload({
  deliverable,
  clientId,
}: {
  deliverable: Deliverable;
  clientId: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [recordState, recordAction] = useActionState<FileState, FormData>(
    recordDeliverableFile,
    {},
  );

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      // Straight to Storage from the browser (RLS-gated), no server body limit.
      const supabase = createBrowserSupabase();
      const safeName = file.name.replace(/[^\w.\-()+ ]/g, "_");
      const path = `${clientId}/${deliverable.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("deliverables")
        .upload(path, file, { contentType: file.type || undefined });
      if (uploadError) {
        setError(`Upload failed: ${uploadError.message}`);
        return;
      }

      const formData = new FormData();
      formData.set("deliverable_id", deliverable.id);
      formData.set("project_id", deliverable.projectId);
      formData.set("path", path);
      formData.set("name", file.name);
      formData.set("size_bytes", String(file.size));
      formData.set("content_type", file.type);
      startTransition(() => recordAction(formData));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="mt-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer text-[11.5px] text-muted transition-colors hover:text-accent disabled:opacity-60"
      >
        {uploading ? "Uploading…" : "+ Attach file"}
      </button>
      {error || recordState.error ? (
        <p className="mt-1 text-[12px] text-danger" role="alert">
          {error ?? recordState.error}
        </p>
      ) : null}
    </div>
  );
}

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}
