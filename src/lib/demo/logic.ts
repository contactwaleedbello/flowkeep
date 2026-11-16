import { FAULT_STATUS, type FaultStatus, type LifecycleStepKey, type WaitingOn } from "@/lib/fault-status";
import type { DemoState, Fault, FaultEvent, User, WaterPoint } from "./types";

/* ------------------------------------------------------------------ */
/* Lifecycle rules, PRD §11                                             */
/* ------------------------------------------------------------------ */

const OPEN: FaultStatus[] = (Object.keys(FAULT_STATUS) as FaultStatus[]).filter((s) => !FAULT_STATUS[s].closed);
const REPAIR_REPORTED: FaultStatus[] = ["repair_reported_complete", "partially_repaired", "repair_failed"];

/**
 * Allowed transitions. `awaiting_parts` exits are an ASSUMPTION: the PRD gives it none.
 * Here it can go to any repair outcome (parts arrived and work done) or be abandoned.
 */
export const TRANSITIONS: Record<FaultStatus, FaultStatus[]> = {
  reported: ["estimate_submitted", "abandoned"],
  estimate_submitted: ["funding_approved", "funding_rejected", "abandoned"],
  funding_approved: ["funding_disbursed", "abandoned"],
  funding_rejected: ["estimate_submitted", "abandoned"],
  funding_disbursed: ["awaiting_parts", "repair_reported_complete", "partially_repaired", "repair_failed", "abandoned"],
  awaiting_parts: ["repair_reported_complete", "partially_repaired", "repair_failed", "abandoned"],
  repair_reported_complete: ["service_verified", "reported", "abandoned"],
  partially_repaired: ["service_verified", "reported", "abandoned"],
  repair_failed: ["service_verified", "reported", "abandoned"],
  service_verified: [],
  abandoned: [],
};

export function canTransition(from: FaultStatus, to: FaultStatus) {
  return TRANSITIONS[from].includes(to);
}

export const isOpen = (f: Fault) => OPEN.includes(f.status);
export const awaitingConfirmation = (f: Fault) => REPAIR_REPORTED.includes(f.status);
export const waitingOn = (f: Fault): WaitingOn => FAULT_STATUS[f.status].waitingOn;

/** Which of the six stepper steps is current. */
export function currentStep(f: Fault): LifecycleStepKey | "closed" {
  switch (f.status) {
    case "reported":
      return "estimate";
    case "estimate_submitted":
    case "funding_rejected":
      return "decision";
    case "funding_approved":
      return "disbursed";
    case "funding_disbursed":
    case "awaiting_parts":
      return "repair";
    case "repair_reported_complete":
    case "partially_repaired":
    case "repair_failed":
      return "verified";
    default:
      return "closed";
  }
}

/** Number of times the custodian said water was not flowing and the fault reopened. */
export const reopenedCount = (f: Fault) => f.events.filter((e) => e.kind === "confirmation" && e.waterFlowing === false).length;

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

export const userById = (s: DemoState, id?: string) => s.users.find((u) => u.id === id);
export const wpById = (s: DemoState, id?: string) => s.waterPoints.find((w) => w.id === id);
export const faultById = (s: DemoState, id?: string) => s.faults.find((f) => f.id === id);

export function lastEvent(f: Fault): FaultEvent | undefined {
  return f.events[f.events.length - 1];
}

/** When the fault entered its current status. */
export function enteredStatusAt(f: Fault) {
  return [...f.events].reverse().find((e) => e.to === f.status)?.eventTime ?? f.eventTime;
}

export function currentEstimate(f: Fault) {
  return [...f.events].reverse().find((e) => e.kind === "diagnosed" && !e.superseded);
}

export function latestOf(f: Fault, kind: FaultEvent["kind"]) {
  return [...f.events].reverse().find((e) => e.kind === kind);
}

export const assignedPoints = (s: DemoState, userId: string, role?: string) =>
  s.assignments
    .filter((a) => a.userId === userId && (!role || a.roleOnPoint === role))
    .map((a) => wpById(s, a.waterPointId))
    .filter((w): w is WaterPoint => !!w && !w.archived);

export const custodianOf = (s: DemoState, wpId: string) =>
  userById(s, s.assignments.find((a) => a.waterPointId === wpId && a.roleOnPoint === "custodian")?.userId);

export const technicianOf = (s: DemoState, wpId: string) =>
  userById(s, s.assignments.find((a) => a.waterPointId === wpId && a.roleOnPoint === "technician")?.userId);

export const usersWithRole = (s: DemoState, role: User["role"]) => s.users.filter((u) => u.role === role && u.status !== "deactivated");

/** Records still in the phone's sync queue (PRD §9). */
export function pendingSync(s: DemoState) {
  let count = 0;
  let oldest: string | undefined;
  for (const f of s.faults) {
    for (const e of f.events) {
      if (!e.syncedAt) {
        count++;
        if (!oldest || e.eventTime < oldest) oldest = e.eventTime;
      }
    }
  }
  return { count, oldest };
}

/** The §13 signals for one fault: named timestamps and the gaps between them. */
export function signals(f: Fault) {
  const pick = (k: FaultEvent["kind"], pred?: (e: FaultEvent) => boolean) =>
    [...f.events].reverse().find((e) => e.kind === k && (!pred || pred(e)))?.eventTime;
  const rows = [
    { label: "Reported", at: f.eventTime },
    { label: "Diagnosed", at: pick("diagnosed", (e) => !e.superseded) },
    { label: "Funding decided", at: pick("decided") },
    { label: "Disbursed", at: pick("disbursed") },
    { label: "Repair reported", at: pick("repair_outcome") },
    { label: "Water confirmed", at: pick("confirmation", (e) => e.waterFlowing === true) },
  ];
  return rows.map((r, i) => {
    const prev = rows.slice(0, i).reverse().find((p) => p.at)?.at;
    return { ...r, gap: r.at && prev && i > 0 ? duration(prev, r.at) : undefined };
  });
}

/** A rejected estimate goes back to the technician once the officer asks for a revision. */
export function needsRevision(f: Fault) {
  if (f.status !== "funding_rejected") return false;
  const rev = latestOf(f, "revision_requested");
  const dec = latestOf(f, "decided");
  return !!rev && (!dec || rev.eventTime > dec.eventTime);
}

/* ------------------------------------------------------------------ */
/* Formatting. Fixed locale and time zone so every device shows the same. */
/* ------------------------------------------------------------------ */

const TZ = "Africa/Lagos";
const dt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TZ });
const d = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export const fmtDateTime = (iso?: string) => (iso ? dt.format(new Date(iso)) : "");
export const fmtDate = (iso?: string) => (iso ? d.format(new Date(iso)) : "");
export const fmtMoney = (n?: number) => (n === undefined ? "" : naira.format(n).replace("NGN", "₦"));

export function duration(fromIso: string, toIso: string) {
  const mins = Math.max(0, Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / 60_000));
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  if (days) return `${days} d ${hours} h`;
  if (hours) return `${hours} h ${mins % 60} m`;
  return `${mins} m`;
}

/** `now` comes from useDemo(): a fixed demo time during prerender, the real clock in the browser. */
export function daysSince(iso: string, now: number) {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86_400_000));
}

export function ago(iso: string, now: number) {
  const days = daysSince(iso, now);
  if (days === 0) return "today";
  if (days === 1) return "1 day";
  return `${days} days`;
}

export function label(options: { value: string; label: string }[], value?: string) {
  return options.find((o) => o.value === value)?.label ?? value ?? "";
}
