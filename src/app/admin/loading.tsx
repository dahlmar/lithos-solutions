export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-[18px]" aria-busy="true" aria-label="Loading">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-[120px] animate-pulse rounded-2xl border border-white/8 bg-white/3"
          />
        ))}
      </div>
      <div className="h-[280px] animate-pulse rounded-2xl border border-white/8 bg-white/3" />
    </div>
  );
}
