import { cn } from "@/lib/utils";

/** Le mark Neurom : un nœud central relié à trois synapses. */
export function NeuromMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("text-ink", className)}
      aria-hidden="true"
    >
      {/* synapses */}
      <line x1="16" y1="16" x2="5" y2="7" stroke="currentColor" strokeWidth="1.6" />
      <line x1="16" y1="16" x2="27" y2="9" stroke="currentColor" strokeWidth="1.6" />
      <line x1="16" y1="16" x2="16" y2="28" stroke="currentColor" strokeWidth="1.6" />
      {/* nœuds périphériques */}
      <circle cx="5" cy="7" r="2.4" fill="currentColor" />
      <circle cx="27" cy="9" r="2.4" fill="currentColor" />
      <circle cx="16" cy="28" r="2.4" fill="currentColor" />
      {/* noyau */}
      <circle cx="16" cy="16" r="5" fill="var(--canvas)" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}

/** Logo complet : mark + wordmark monospace. */
export function NeuromLogo({
  className,
  showWord = true,
}: {
  className?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <NeuromMark className="h-7 w-7 shrink-0" />
      {showWord && (
        <span className="font-mono text-lg font-medium tracking-tightest text-ink">
          neurom
        </span>
      )}
    </span>
  );
}
