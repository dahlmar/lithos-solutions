import { fieldClasses, ghostButton } from "./fieldStyles";

type FilterBarProps = {
  /** Current search text (from searchParams). */
  q?: string;
  /** Current status filter value. */
  status?: string;
  statusOptions: { value: string; label: string }[];
  placeholder?: string;
};

/**
 * Server-rendered GET filter form — no client JS. Submitting updates the URL
 * search params, which the page reads to filter its query.
 */
export default function FilterBar({
  q,
  status,
  statusOptions,
  placeholder = "Search…",
}: FilterBarProps) {
  return (
    <form method="GET" className="flex flex-wrap items-center gap-2.5">
      <input
        type="search"
        name="q"
        defaultValue={q ?? ""}
        placeholder={placeholder}
        className={`${fieldClasses} mt-0 w-full sm:w-[220px]`}
      />
      <select
        name="status"
        defaultValue={status ?? ""}
        className={`${fieldClasses} mt-0 w-auto`}
      >
        <option value="">All statuses</option>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button type="submit" className={ghostButton}>
        Filter
      </button>
    </form>
  );
}
