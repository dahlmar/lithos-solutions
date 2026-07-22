"use client";

import { accentButton } from "@/components/ui/fieldStyles";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-6 text-foreground">
      <div className="max-w-[420px] text-center">
        <div className="font-mono text-[10px] tracking-[0.24em] text-muted">
          SOMETHING WENT WRONG
        </div>
        <h1 className="mt-4 text-xl font-medium tracking-[-0.015em]">
          We couldn&apos;t load this page
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          A temporary error occurred. Trying again usually fixes it — if it
          keeps happening, we&apos;re on it.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-[11px] text-muted">
            Ref: {error.digest}
          </p>
        ) : null}
        <button type="button" onClick={reset} className={`${accentButton} mt-6`}>
          Try again
        </button>
      </div>
    </main>
  );
}
