import { ArrowRight, CloudUpload } from "lucide-react";
import type { ReactNode } from "react";
import type { FaultStatus } from "@/lib/fault-status";
import { cn } from "@/lib/cn";
import { StatusDot } from "./status-pill";

export interface TimelineEvent {
  actor: string;
  role: string;
  action: string;
  from?: FaultStatus;
  to?: FaultStatus;
  note?: string;
  /** Set on the device when the user acted. */
  eventTime: string;
  /** Set by the server on arrival. Missing = still in the phone's sync queue. */
  syncedAt?: string;
  superseded?: boolean;
}

/** Initials avatar. Tinted by role so the eye can follow who acted. */
export function Avatar({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[11px] font-semibold text-on-surface ring-4 ring-surface-container-lowest dark:ring-surface-container-low",
        className,
      )}
    >
      {initials}
    </span>
  );
}

/**
 * One event in the fault record. Phrased as "<name> (<role>) <action>", with old → new status
 * (Plane/Jira pattern) and both timestamps (PRD §9: every record shows event_time and synced_at).
 */
export function TimelineItem({ event, last }: { event: TimelineEvent; last?: boolean }) {
  return (
    <li className="relative flex gap-3 pb-5">
      {!last && <span aria-hidden className="absolute top-8 bottom-0 left-3.5 w-px bg-outline-variant" />}
      <Avatar name={event.actor} />
      <div className={cn("flex min-w-0 flex-1 flex-col gap-1.5", event.superseded && "opacity-60")}>
        <p className="text-body-md text-on-surface">
          <span className="font-semibold">{event.actor}</span>{" "}
          <span className="text-on-surface-variant">({event.role})</span> {event.action}
          {event.superseded && <span className="ml-1.5 text-label-md text-on-surface-variant">· superseded</span>}
        </p>
        {(event.from || event.to) && (
          <div className="flex flex-wrap items-center gap-2">
            {event.from && <StatusDot status={event.from} className="text-label-md text-on-surface-variant" />}
            {event.from && event.to && <ArrowRight aria-label="to" className="size-3 text-on-surface-variant" />}
            {event.to && <StatusDot status={event.to} className="text-label-md font-medium" />}
          </div>
        )}
        {event.note && (
          <p className="border-l-2 border-outline-variant py-0.5 pl-3 text-body-md text-on-surface-variant">{event.note}</p>
        )}
        <Timestamps eventTime={event.eventTime} syncedAt={event.syncedAt} />
      </div>
    </li>
  );
}

export function Timestamps({ eventTime, syncedAt }: { eventTime: string; syncedAt?: string }) {
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11.5px] text-on-surface-variant">
      <span>
        <span className="opacity-70">happened</span> {eventTime}
      </span>
      {syncedAt ? (
        <span>
          <span className="opacity-70">synced</span> {syncedAt}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 text-secondary">
          <CloudUpload aria-hidden className="size-3.5" /> not synced yet
        </span>
      )}
    </p>
  );
}

export function Timeline({ events, children }: { events: TimelineEvent[]; children?: ReactNode }) {
  return (
    <ol className="flex flex-col">
      {events.map((e, i) => (
        <TimelineItem key={i} event={e} last={i === events.length - 1 && !children} />
      ))}
      {children}
    </ol>
  );
}
