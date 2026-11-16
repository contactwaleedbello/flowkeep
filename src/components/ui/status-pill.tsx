import { FAULT_STATUS, type FaultStatus, type StatusTone } from "@/lib/fault-status";
import { cn } from "@/lib/cn";
import { STATUS_ICONS } from "./icons";

/** Open states: tinted container. Closed states: solid fill (Fresha pattern, see design-system/patterns.md). */
const tinted: Record<StatusTone, string> = {
  primary: "bg-primary-container text-on-primary-container",
  attention: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-tertiary-container text-on-tertiary-container",
  neutral: "bg-surface-container-highest text-on-surface",
  success: "bg-success-container text-on-success-container",
  error: "bg-error-container text-on-error-container",
};

const solid: Record<StatusTone, string> = {
  primary: "bg-primary text-on-primary",
  attention: "bg-secondary text-on-secondary",
  tertiary: "bg-tertiary text-on-tertiary",
  neutral: "bg-inverse-surface text-inverse-on-surface",
  success: "bg-success text-on-success",
  error: "bg-error text-on-error",
};

export function StatusPill({
  status,
  size = "md",
  className,
}: {
  status: FaultStatus;
  size?: "sm" | "md";
  className?: string;
}) {
  const def = FAULT_STATUS[status];
  const Icon = STATUS_ICONS[def.icon];
  return (
    <span
      title={def.description}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "h-6 px-2 text-label-md" : "h-7 px-2.5 text-label-lg",
        def.closed ? solid[def.tone] : tinted[def.tone],
        className,
      )}
    >
      <Icon aria-hidden className={size === "sm" ? "size-3.5" : "size-4"} strokeWidth={2.25} />
      {def.label}
    </span>
  );
}

/** Generic tone chip for non-status labels (roles, counts, tags). */
export function Chip({
  tone = "neutral",
  children,
  className,
}: {
  tone?: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-sm px-2 text-label-md font-medium",
        tinted[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-container-highest px-1.5 text-label-sm font-semibold text-on-surface-variant",
        className,
      )}
    >
      {count}
    </span>
  );
}
