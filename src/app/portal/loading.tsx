export default function PortalLoading() {
  return (
    <div className="flex flex-col gap-[18px]" aria-busy="true" aria-label="Loading">
      <div className="h-[180px] animate-pulse rounded-2xl border border-white/8 bg-white/3" />
      <div className="h-[220px] animate-pulse rounded-2xl border border-white/8 bg-white/3" />
    </div>
  );
}
