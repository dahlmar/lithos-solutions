type MonoLabelProps = {
  children: React.ReactNode;
  className?: string;
};

/** Letter-spaced monospace eyebrow label ("RECENT UPLOADS", "OPERATIONS", …). */
export default function MonoLabel({ children, className = "" }: MonoLabelProps) {
  return (
    <div className={`font-mono text-[10px] tracking-[0.24em] text-muted ${className}`}>
      {children}
    </div>
  );
}
