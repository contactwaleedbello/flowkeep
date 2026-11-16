import { cn } from "@/lib/cn";

/** Flowkeep mark: a droplet held inside a record bracket. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" fill="var(--md-primary)" />
      <path
        d="M16 6.5c-3.4 4.3-6.5 8.2-6.5 11.7a6.5 6.5 0 0 0 13 0c0-3.5-3.1-7.4-6.5-11.7Z"
        fill="var(--md-on-primary)"
      />
      <path d="M13 18.6l2.2 2.2 4-4.3" fill="none" stroke="var(--md-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-title-lg font-semibold tracking-tight text-on-surface">Flowkeep</span>
    </span>
  );
}
