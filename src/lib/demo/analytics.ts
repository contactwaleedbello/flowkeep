import { isOpen, signals, userById, wpById } from "./logic";
import type { DemoState, Fault } from "./types";

/**
 * Admin analytics. Everything here is a SIGNAL, not a statistic (PRD §13):
 * at ten water points the numbers are small, so each one carries its sample size (n).
 */

const DAY = 86_400_000;

export function median(xs: number[]) {
  if (!xs.length) return undefined;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

const live = (s: DemoState) => s.faults.filter((f) => !f.mergedInto);

/** Median days for each step of the lifecycle, from the named timestamps. */
export function stageMedians(s: DemoState) {
  const stages = [
    { key: "diagnosis", label: "Report → diagnosis", from: "Reported", to: "Diagnosed" },
    { key: "decision", label: "Diagnosis → decision", from: "Diagnosed", to: "Funding decided" },
    { key: "disbursement", label: "Decision → disbursement", from: "Funding decided", to: "Disbursed" },
    { key: "repair", label: "Disbursement → repair", from: "Disbursed", to: "Repair reported" },
    { key: "confirm", label: "Repair → water confirmed", from: "Repair reported", to: "Water confirmed" },
  ] as const;
  const rows = live(s).map((f) => Object.fromEntries(signals(f).map((x) => [x.label, x.at])));
  return stages.map((st) => {
    const gaps = rows
      .filter((r) => r[st.from] && r[st.to])
      .map((r) => (new Date(r[st.to]!).getTime() - new Date(r[st.from]!).getTime()) / DAY)
      .filter((d) => d >= 0);
    return { ...st, days: median(gaps), n: gaps.length };
  });
}

/** Share of reported repairs that the custodian has answered (confirmed or denied). */
export function confirmationRate(s: DemoState) {
  const repaired = live(s).filter((f) => f.events.some((e) => e.kind === "repair_outcome"));
  const answered = repaired.filter((f) => f.events.some((e) => e.kind === "confirmation"));
  return { x: answered.length, n: repaired.length };
}

export function pointsWithFault(s: DemoState) {
  const pts = s.waterPoints.filter((w) => !w.archived);
  const withFault = pts.filter((w) => live(s).some((f) => f.waterPointId === w.id));
  return { x: withFault.length, n: pts.length };
}

/** Required fields for a fault record (our definition, to confirm with the partner). */
export function missingFields(s: DemoState, f: Fault): string[] {
  const out: string[] = [];
  if (!wpById(s, f.waterPointId)) out.push("water point");
  if (!f.faultType) out.push("fault type");
  if (!userById(s, f.custodianId)) out.push("custodian");
  if (!userById(s, f.technicianId)) out.push("technician");
  for (const e of f.events) {
    if (e.kind === "diagnosed" && (!e.diagnosis?.amount || !e.diagnosis.category || !e.diagnosis.parts)) out.push("diagnosis details");
    if (e.kind === "decided" && !e.decision?.funderSource) out.push("funder source");
    if (e.kind === "disbursed" && !e.disbursement?.amount) out.push("disbursed amount");
  }
  return Array.from(new Set(out));
}

export function completeness(s: DemoState) {
  const fs = live(s);
  const complete = fs.filter((f) => missingFields(s, f).length === 0);
  return { x: complete.length, n: fs.length };
}

export function opensLast7Days(s: DemoState, now: number) {
  const since = now - 7 * DAY;
  const prevSince = now - 14 * DAY;
  const t = s.officerListOpens.map((x) => new Date(x).getTime());
  return { thisWeek: t.filter((x) => x >= since).length, lastWeek: t.filter((x) => x >= prevSince && x < since).length };
}

/** Two open faults at the same water point reported within 72 hours: probably the same fault. */
export function possibleDuplicates(s: DemoState) {
  const open = s.faults.filter(isOpen);
  const pairs: Array<{ keep: Fault; merge: Fault }> = [];
  for (let i = 0; i < open.length; i++)
    for (let j = i + 1; j < open.length; j++) {
      const a = open[i];
      const b = open[j];
      if (a.waterPointId !== b.waterPointId) continue;
      if (Math.abs(new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()) > 3 * DAY) continue;
      const [keep, merge] = a.eventTime <= b.eventTime ? [a, b] : [b, a];
      pairs.push({ keep, merge });
    }
  return pairs;
}

/** Things the admin can fix, each pointing at where to fix it. */
export function attention(s: DemoState) {
  const pts = s.waterPoints.filter((w) => !w.archived);
  const has = (wp: string, role: string) => s.assignments.some((a) => a.waterPointId === wp && a.roleOnPoint === role && s.users.find((u) => u.id === a.userId)?.status !== "deactivated");
  return {
    noCustodian: pts.filter((w) => !has(w.id, "custodian")),
    noTechnician: pts.filter((w) => !has(w.id, "technician")),
    consentMissing: s.users.filter((u) => u.role === "custodian" && u.phone && !u.phoneConsentAt && u.status !== "deactivated"),
    invitesPending: s.users.filter((u) => u.status === "invited"),
    duplicates: possibleDuplicates(s),
  };
}

/** Events per ISO week (Monday start) for the last `weeks` weeks. */
export function weeklyCounts(dates: string[], now: number, weeks = 8) {
  const startOfWeek = (t: number) => {
    const d = new Date(t);
    const day = (d.getUTCDay() + 6) % 7;
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day);
  };
  const current = startOfWeek(now);
  const buckets = Array.from({ length: weeks }, (_, i) => ({ start: current - (weeks - 1 - i) * 7 * DAY, count: 0 }));
  for (const iso of dates) {
    const w = startOfWeek(new Date(iso).getTime());
    const b = buckets.find((x) => x.start === w);
    if (b) b.count++;
  }
  return buckets;
}

export const pct = (x: number, n: number) => (n ? Math.round((x / n) * 100) : 0);

export const openFaultAt = (s: DemoState, wpId: string) => s.faults.find((f) => f.waterPointId === wpId && isOpen(f));
