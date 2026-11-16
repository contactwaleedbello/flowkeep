import { cn } from "@/lib/cn";

/**
 * Flowkeep mark: a droplet with a water line, the level being kept.
 * Drawn in role colours on an inverse tile, so it inverts cleanly in dark mode.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="8" fill="var(--md-inverse-surface)" />
      <path
        d="M9.6 18.6 Q12.8 16.9 16 18.6 T22.4 18.6 A6.5 6.5 0 0 1 9.6 18.6 Z"
        fill="var(--md-inverse-primary)"
      />
      <path
        d="M16 6.2c-3.5 4.4-6.5 8.1-6.5 12a6.5 6.5 0 0 0 13 0c0-3.9-3-7.6-6.5-12Z"
        fill="none"
        stroke="var(--md-inverse-on-surface)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-7" />
      <span className="font-display text-[1.125rem] leading-none font-semibold tracking-[-0.03em] text-on-surface">Flowkeep</span>
    </span>
  );
}
