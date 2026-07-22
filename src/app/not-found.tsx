import Link from "next/link";
import { accentButton } from "@/components/ui/fieldStyles";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface px-6 text-foreground">
      <div className="max-w-[420px] text-center">
        <div className="font-mono text-[10px] tracking-[0.24em] text-muted">
          404 — NOT FOUND
        </div>
        <h1 className="mt-4 text-xl font-medium tracking-[-0.015em]">
          This page doesn&apos;t exist
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The link may be outdated, or the record was removed.
        </p>
        <Link href="/" className={`${accentButton} mt-6 inline-block`}>
          Back to start
        </Link>
      </div>
    </main>
  );
}
