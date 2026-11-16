import { useMemo, useSyncExternalStore } from "react";
import type { FaultStatus } from "@/lib/fault-status";
import { median } from "./analytics";
import { daysSince, enteredStatusAt, isOpen } from "./logic";
import type { DemoState, Fault } from "./types";

/**
 * Programme officer signals (PRD §13: signals, not statistics, no invented targets).
 *
 * "Slower than usual" compares a fault's time in its current step with the portfolio's own
 * baseline: the median time past faults spent in that same step. No target is set by anyone.
 */

const DAY = 86_400_000;
const MIN_SAMPLES = 3;

/** Days each fault spent in each status, for stays that have ended. */
export function stepStays(s: DemoState) {
  const stays = new Map<FaultStatus, number[]>();
  for (const f of s.faults) {
    if (f.mergedInto) continue;
    let status: FaultStatus = "reported";
    let since = new Date(f.eventTime).getTime();
    for (const e of f.events) {
      if (!e.to || e.kind === "reported") continue;
      const t = new Date(e.eventTime).getTime();
      const list = stays.get(status) ?? [];
      list.push(Math.max(0, (t - since) / DAY));
      stays.set(status, list);
      status = e.to;
      since = t;
    }
  }
  return stays;
}

/** The usual (median) days in a step, when there are enough past examples to say. */
export function usualDays(stays: Map<FaultStatus, number[]>, status: FaultStatus) {
  const xs = stays.get(status) ?? [];
  if (xs.length < MIN_SAMPLES) return undefined;
  return { days: median(xs)!, n: xs.length };
}

/**
 * Slower than usual: at least half as long again as the usual time for this step, and at
 * least two days over it, so a fault is not flagged for being a few hours past a short median.
 */
export function pace(stays: Map<FaultStatus, number[]>, f: Fault, now: number) {
  const days = daysSince(enteredStatusAt(f), now);
  const usual = usualDays(stays, f.status);
  const slow = !!usual && isOpen(f) && days >= usual.days * 1.5 && days - usual.days >= 2;
  return { days, usual, slow };
}

export const isClosed = (f: Fault) => !f.mergedInto && (f.status === "service_verified" || f.status === "abandoned");

/** When the fault closed: the custodian's confirmation, or the abandonment. */
export function closedAt(f: Fault) {
  return [...f.events].reverse().find((e) => e.to === f.status)?.eventTime;
}

/** Days from report to the custodian confirming water flows. Only for restored faults. */
export function daysToRestore(f: Fault) {
  if (f.status !== "service_verified") return undefined;
  const at = closedAt(f);
  return at ? (new Date(at).getTime() - new Date(f.eventTime).getTime()) / DAY : undefined;
}

/** Money that actually moved for a fault (sum of its disbursements). */
export const disbursed = (f: Fault) => f.events.reduce((sum, e) => sum + (e.kind === "disbursed" ? (e.disbursement?.amount ?? 0) : 0), 0);

export function waterPointSummary(s: DemoState, wpId: string) {
  const faults = s.faults.filter((f) => f.waterPointId === wpId && !f.mergedInto);
  const restore = faults.map(daysToRestore).filter((d): d is number => d !== undefined);
  const repaired = faults.filter((f) => f.events.some((e) => e.kind === "repair_outcome"));
  const open = faults.find(isOpen);
  return {
    faults,
    open,
    spent: faults.reduce((a, f) => a + disbursed(f), 0),
    medianRestore: median(restore),
    restoredN: restore.length,
    confirmed: { x: repaired.filter((f) => f.events.some((e) => e.kind === "confirmation")).length, n: repaired.length },
  };
}

/** Month buckets (YYYY-MM) for the last `months` months, ending with the month of `now`. */
export function monthlySums(items: Array<{ at: string; value: number }>, now: number, months = 6) {
  const d = new Date(now);
  const keys = Array.from({ length: months }, (_, i) => {
    const m = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - (months - 1 - i), 1));
    return { key: m.toISOString().slice(0, 7), label: m.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }), value: 0 };
  });
  for (const it of items) {
    const k = keys.find((x) => x.key === it.at.slice(0, 7));
    if (k) k.value += it.value;
  }
  return keys;
}

/** The officer queue's order, remembered so a record can offer "3 of 7" with next and previous. */
const QUEUE_KEY = "flowkeep-officer-queue";
export function rememberQueue(ids: string[]) {
  try {
    sessionStorage.setItem(QUEUE_KEY, JSON.stringify(ids));
  } catch {}
}
const readQueue = () => {
  try {
    return sessionStorage.getItem(QUEUE_KEY);
  } catch {
    return null;
  }
};
const noSubscribe = () => () => {};
/** The remembered queue, read after hydration (null on the server and on first paint). */
export function useQueue(): string[] | null {
  const raw = useSyncExternalStore(noSubscribe, readQueue, () => null);
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as string[]) : null;
    } catch {
      return null;
    }
  }, [raw]);
}
