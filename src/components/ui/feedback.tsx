import { CircleCheck, CloudOff, CloudUpload, Inbox, RefreshCw, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SyncState = "offline" | "pending" | "syncing" | "synced" | "stale";

/**
 * Persistent sync bar (PRD §9). Never blocks the screen; data entry keeps working offline.
 * Docusign pattern: a slim bar plus a per-row "Sync pending" tag.
 */
export function SyncBar({
  state,
  pending = 0,
  oldestDays,
  onSync,
  showSyncButton,
  className,
}: {
  state: SyncState;
  pending?: number;
  oldestDays?: number;
  /** Only callable from client components. Server-rendered previews use showSyncButton. */
  onSync?: () => void;
  showSyncButton?: boolean;
  className?: string;
}) {
  const config: Record<SyncState, { icon: LucideIcon; text: string; cls: string }> = {
    offline: {
      icon: CloudOff,
      text: pending ? `Offline. ${pending} ${pending === 1 ? "record" : "records"} saved on this phone.` : "Offline. You can keep working.",
      cls: "bg-inverse-surface text-inverse-on-surface",
    },
    pending: {
      icon: CloudUpload,
      text: `${pending} ${pending === 1 ? "record" : "records"} waiting to sync`,
      cls: "bg-surface-container-high text-on-surface",
    },
    syncing: { icon: RefreshCw, text: "Syncing…", cls: "bg-surface-container-high text-on-surface" },
    synced: { icon: CircleCheck, text: "All records synced", cls: "bg-surface-container text-on-surface-variant" },
    stale: {
      icon: CloudOff,
      text: `Some records are ${oldestDays ?? 10} days old. Connect to sync before day 14 or they must be re-entered.`,
      cls: "bg-secondary-container text-on-secondary-container",
    },
  };
  const c = config[state];
  const Icon = c.icon;
  return (
    <div role="status" className={cn("flex min-h-11 items-center gap-3 px-4 py-2 text-body-md", c.cls, className)}>
      <Icon aria-hidden className={cn("size-4 shrink-0", state === "syncing" && "animate-spin")} />
      <span className="flex-1">{c.text}</span>
      {(onSync || showSyncButton) && state !== "syncing" && state !== "synced" && (
        <button type="button" onClick={onSync} className="state-layer rounded-full px-3 py-1 text-label-lg font-semibold underline-offset-2">
          Sync now
        </button>
      )}
    </div>
  );
}

/** Per-record sync tag. */
export function SyncTag({ synced }: { synced: boolean }) {
  return synced ? null : (
    <span className="inline-flex items-center gap-1 text-label-md font-medium text-on-surface-variant">
      <CloudUpload aria-hidden className="size-3.5" /> Sync pending
    </span>
  );
}

/** Toast (inverse surface). Confirms the local save separately from sync state (ClickUp pattern). */
export function Toast({ title, meta, className }: { title: string; meta?: string; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-sm bg-inverse-surface px-4 py-3 text-body-md text-inverse-on-surface shadow-3",
        className,
      )}
    >
      <CircleCheck aria-hidden className="size-5 shrink-0 text-inverse-primary" />
      <span className="flex-1 font-medium">{title}</span>
      {meta && <span className="text-body-sm opacity-75">{meta}</span>}
    </div>
  );
}

export function Banner({
  tone = "info",
  title,
  children,
  icon: Icon,
  className,
}: {
  tone?: "info" | "attention" | "error" | "success";
  title: string;
  children?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  const tones = {
    info: "bg-surface-container-low text-on-surface border-outline-variant",
    attention: "bg-secondary-container text-on-secondary-container border-transparent",
    error: "bg-error-container text-on-error-container border-transparent",
    success: "bg-surface-container-low text-on-surface border-outline-variant",
  };
  return (
    <div role="note" className={cn("flex gap-3 rounded-md border p-4", tones[tone], className)}>
      {Icon && <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />}
      <div className="flex flex-col gap-1">
        <p className="text-title-sm font-semibold">{title}</p>
        {children && <div className="text-body-md">{children}</div>}
      </div>
    </div>
  );
}

/** Empty states always say what the empty thing is and what to do next. Never a blank screen (PRD §7 feature 5). */
export function EmptyState({
  title,
  body,
  action,
  icon: Icon = Inbox,
  className,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-3 px-6 py-10 text-center", className)}>
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant">
        <Icon aria-hidden className="size-6" />
      </span>
      <p className="text-title-md font-semibold text-on-surface">{title}</p>
      {body && <p className="max-w-sm text-body-md text-on-surface-variant">{body}</p>}
      {action}
    </div>
  );
}
