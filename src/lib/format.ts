/** Shared display formatting — pure functions, safe on server and client. */

/** "Jul 18" */
export function shortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
  });
}

/** "Aug 04, 2026" */
export function longDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

/** "in 15 days" | "due today" | "overdue by 3 days" */
export function dueLabel(value: string): string {
  const days = Math.round(
    (new Date(value).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );
  if (days > 1) return `in ${days} days`;
  if (days === 1) return "tomorrow";
  if (days >= 0) return "due today";
  if (days === -1) return "overdue by 1 day";
  return `overdue by ${-days} days`;
}

/** cents + ISO currency → "SEK 185,000" */
export function formatMoney(amountCents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amountCents / 100);
}

/** "Aveline Studio" → "AS" */
export function initials(name: string): string {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
