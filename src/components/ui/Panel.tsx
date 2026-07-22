type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

/** Frosted card surface used across the dashboard (prototype: white/3 + white/8 border). */
export default function Panel({ children, className = "" }: PanelProps) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/3 ${className}`}>
      {children}
    </div>
  );
}
