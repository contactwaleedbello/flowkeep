import { FAULT_STATUS, type FaultStatus, type StatusTone } from "@/lib/fault-status";
import { cn } from "@/lib/cn";
import { STATUS_ICONS } from "./icons";

/**
 * Status pill. Quiet by default: neutral surface, hairline border, colour only on the icon.
 * Closed states (service verified, abandoned) are solid, so finished work reads as finished.
 * Icon + label always, so status is never colour-only.
 */
const iconTone: Record<StatusTone, string> = {
  primary: "text-primary",
  attention: "text-secondary",
  tertiary: "text-tertiary",
  neutral: "text-on-surface-variant",
  success: "text-success",
  error: "text-error",
};

const solid: Partial<Record<StatusTone, string>> = {
  success: "border-transparent bg-success text-on-success",
  error: "border-transparent bg-inverse-surface text-inverse-on-surface",
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
  const closed = def.closed ? solid[def.tone] : undefined;
  return (
    <span
      title={def.description}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border font-medium whitespace-nowrap",
        size === "sm" ? "h-6 px-1.5 text-label-md" : "h-7 px-2 text-label-lg",
        closed ?? "border-outline-variant bg-surface-container-lowest text-on-surface",
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn(size === "sm" ? "size-3.5" : "size-4", closed ? "text-current" : iconTone[def.tone])}
        strokeWidth={2.25}
      />
      {def.label}
    </span>
  );
}

const chipTone: Record<StatusTone, string> = {
  neutral: "bg-surface-container text-on-surface-variant",
  primary: "bg-surface-container text-primary",
  attention: "bg-secondary-container text-on-secondary-container",
  tertiary: "bg-surface-container text-tertiary",
  success: "bg-surface-container text-success",
  error: "bg-error-container text-on-error-container",
};

/** Small label for roles and tags. Neutral unless it carries a warning. */
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
    <span className={cn("inline-flex h-6 items-center gap-1 rounded-sm px-2 text-label-md font-medium", chipTone[tone], className)}>
      {children}
    </span>
  );
}

const dotTone: Record<StatusTone, string> = {
  primary: "bg-primary",
  attention: "bg-secondary",
  tertiary: "bg-tertiary",
  neutral: "bg-outline",
  success: "bg-success",
  error: "bg-error",
};

/**
 * Dense status for list rows: a coloured dot and the label. Quieter than a pill,
 * so a long list reads as text, with colour only where the eye needs it.
 */
export function StatusDot({ status, className }: { status: FaultStatus; className?: string }) {
  const def = FAULT_STATUS[status];
  return (
    <span title={def.description} className={cn("inline-flex items-center gap-2 text-label-lg whitespace-nowrap text-on-surface", className)}>
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", dotTone[def.tone])} />
      {def.label}
    </span>
  );
}

export function CountBadge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-xs bg-surface-container-high px-1 font-mono text-[11px] leading-none font-medium text-on-surface-variant tabular-nums",
        className,
      )}
    >
      {count}
    </span>
  );
}
