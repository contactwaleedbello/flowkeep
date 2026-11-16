"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FaultStatus } from "@/lib/fault-status";
import { canTransition, faultById } from "./logic";
import { createSeed } from "./seed";
import { DEFAULT_SETTINGS, type Assignment, type DemoState, type Fault, type FaultEvent, type Option, type OrgSettings, type User, type WaterPoint } from "./types";

/**
 * Front-end demo store. No backend: state lives in React and is saved to localStorage.
 * It behaves like the offline-first app in PRD §9: when "offline", new records have no
 * syncedAt until "Sync now" runs.
 */

const KEY = "flowkeep-demo-v2";

type Toast = { id: number; title: string; meta?: string } | null;

interface Actions {
  report(input: { waterPointId: string; faultType: string; note?: string; actorId: string; custodianId: string }): Fault;
  diagnose(faultId: string, actorId: string, d: { category: string; parts: string; amount: number }): void;
  decide(faultId: string, actorId: string, decision: "approved" | "rejected", note: string | undefined, funderSource: string): void;
  disburse(faultId: string, actorId: string, amount: number, note?: string): void;
  awaitParts(faultId: string, actorId: string, note?: string): void;
  repairOutcome(faultId: string, actorId: string, outcome: "complete" | "partial" | "failed", note?: string): void;
  confirm(faultId: string, actorId: string, waterFlowing: boolean, note?: string): void;
  abandon(faultId: string, actorId: string, reason: string): void;
  requestRevision(faultId: string, actorId: string, note: string): void;
  escalate(faultId: string, actorId: string, note: string): void;
  reassign(faultId: string, actorId: string, roleOnFault: "technician" | "custodian", toId: string): void;
  revealPhone(viewerId: string, subjectId: string, waterPointId: string): void;
  addWaterPoint(wp: Omit<WaterPoint, "id">): WaterPoint;
  updateWaterPoint(id: string, patch: Partial<Omit<WaterPoint, "id" | "externalId">>, reason?: string): void;
  setArchived(id: string, archived: boolean, reason?: string): void;
  setAssignment(waterPointId: string, roleOnPoint: "custodian" | "technician", userId: string | null): void;
  inviteUser(u: Pick<User, "name" | "role" | "phone">, assign?: { waterPointIds: string[] }): User;
  setRole(userId: string, role: User["role"]): void;
  setUserStatus(userId: string, status: User["status"], reason?: string): void;
  mergeFaults(keepId: string, mergeId: string, actorId: string): void;
  trackOfficerListOpen(): void;
  updateSettings(patch: Partial<OrgSettings>, label: string): void;
  setOrgName(name: string): void;
  renameUser(userId: string, name: string): void;
  setOptions(list: "faultTypes" | "diagnosisCategories", options: Option[], change: string): void;
  recordConsent(userId: string, purpose: string): void;
  setOnline(online: boolean): void;
  syncNow(): void;
  reset(): void;
  notify(title: string, meta?: string): void;
}

interface Ctx extends Actions {
  state: DemoState;
  toast: Toast;
  /** Current time in ms. Fixed during prerender, then the browser clock (refreshed each minute). */
  now: number;
}

/** Reference time used while prerendering, so server output is deterministic. */
const DEMO_NOW = new Date("2026-11-16T09:00:00+01:00").getTime();

const DemoContext = createContext<Ctx | null>(null);

const nowIso = () => new Date().toISOString();
const ADMIN = "u-yakubu";
let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}${(seq++).toString(36)}`;

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(createSeed);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [now, setNow] = useState(DEMO_NOW);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stateRef = useRef(state);
  const readyRef = useRef(false);
  const pendingOpens = useRef<string[]>([]);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /* load once, then save on every change */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from storage
        if (parsed.version === 2) setState({ ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } });
      }
    } catch {}
    readyRef.current = true;
    if (pendingOpens.current.length) {
      const queued = pendingOpens.current;
      pendingOpens.current = [];
      setState((s) => ({ ...s, officerListOpens: [...s.officerListOpens, ...queued].slice(-200) }));
    }
    setReady(true);
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(tick);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {}
  }, [state, ready]);

  const notify = useCallback((title: string, meta?: string) => {
    clearTimeout(toastTimer.current);
    setToast((t) => ({ id: (t?.id ?? 0) + 1, title, meta }));
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const actions = useMemo<Actions>(() => {
    /** Append an event to a fault, enforcing the §11 transition table when the status changes. */
    function push(faultId: string, ev: Omit<FaultEvent, "id" | "eventTime" | "syncedAt" | "from">, mutate?: (f: Fault) => Fault) {
      setState((s) => {
        const f = faultById(s, faultId);
        if (!f) return s;
        if (ev.to && !canTransition(f.status, ev.to)) {
          console.warn(`Blocked transition ${f.status} → ${ev.to}`);
          return s;
        }
        const t = nowIso();
        const event: FaultEvent = { ...ev, id: uid("e"), from: ev.to ? f.status : undefined, eventTime: t, syncedAt: s.online ? t : undefined };
        let next: Fault = { ...f, events: [...f.events, event], status: ev.to ?? f.status };
        if (mutate) next = mutate(next);
        return { ...s, faults: s.faults.map((x) => (x.id === faultId ? next : x)) };
      });
    }

    const syncedNote = (online: boolean) => (online ? "Synced" : "Saved on this phone. Syncs when online");

    return {
      notify,
      report({ waterPointId, faultType, note, actorId, custodianId }) {
        const s = stateRef.current;
        const t = nowIso();
        const tech = s.assignments.find((a) => a.waterPointId === waterPointId && a.roleOnPoint === "technician")?.userId ?? "";
        const created: Fault = {
          id: uid("f"),
          number: `F-${String(s.nextFaultNumber).padStart(3, "0")}`,
          waterPointId,
          faultType,
          note,
          status: "reported",
          custodianId,
          assistedById: actorId !== custodianId ? actorId : undefined,
          technicianId: tech,
          eventTime: t,
          syncedAt: s.online ? t : undefined,
          events: [{ id: uid("e"), kind: "reported", actorId, to: "reported", note, eventTime: t, syncedAt: s.online ? t : undefined }],
        };
        const next = { ...s, faults: [created, ...s.faults], nextFaultNumber: s.nextFaultNumber + 1 };
        stateRef.current = next;
        setState(next);
        notify("Fault reported", syncedNote(s.online));
        return created;
      },
      diagnose(faultId, actorId, d) {
        push(
          faultId,
          { kind: "diagnosed", actorId, to: "estimate_submitted", diagnosis: { ...d, currency: "NGN" } },
          // a new diagnosis supersedes earlier ones; they stay on the record
          (f) => ({
            ...f,
            events: f.events.map((e, i) => (e.kind === "diagnosed" && i < f.events.length - 1 ? { ...e, superseded: true } : e)),
          }),
        );
        notify("Diagnosis and estimate saved", syncedNote(state.online));
      },
      decide(faultId, actorId, decision, note, funderSource) {
        const to: FaultStatus = decision === "approved" ? "funding_approved" : "funding_rejected";
        push(faultId, { kind: "decided", actorId, to, note, decision: { decision, funderSource } });
        notify(decision === "approved" ? "Funding approved" : "Funding rejected", "Recorded with your name and the time");
      },
      disburse(faultId, actorId, amount, note) {
        push(faultId, { kind: "disbursed", actorId, to: "funding_disbursed", note, disbursement: { amount, currency: "NGN" } });
        notify("Disbursement recorded");
      },
      awaitParts(faultId, actorId, note) {
        push(faultId, { kind: "awaiting_parts", actorId, to: "awaiting_parts", note });
        notify("Marked as awaiting parts", syncedNote(state.online));
      },
      repairOutcome(faultId, actorId, outcome, note) {
        const to: FaultStatus = outcome === "complete" ? "repair_reported_complete" : outcome === "partial" ? "partially_repaired" : "repair_failed";
        push(faultId, { kind: "repair_outcome", actorId, to, outcome, note });
        notify("Repair outcome recorded", syncedNote(state.online));
      },
      confirm(faultId, actorId, waterFlowing, note) {
        push(faultId, { kind: "confirmation", actorId, to: waterFlowing ? "service_verified" : "reported", waterFlowing, note });
        notify(waterFlowing ? "Thank you. Water is flowing." : "Fault reopened for a new diagnosis", syncedNote(state.online));
      },
      abandon(faultId, actorId, reason) {
        push(faultId, { kind: "abandoned", actorId, to: "abandoned", note: reason });
        notify("Fault closed as abandoned", "The reason is on the record");
      },
      requestRevision(faultId, actorId, note) {
        push(faultId, { kind: "revision_requested", actorId, note });
        notify("Revised estimate requested");
      },
      escalate(faultId, actorId, note) {
        push(faultId, { kind: "escalated", actorId, note });
        notify("Escalation recorded");
      },
      reassign(faultId, actorId, roleOnFault, toId) {
        setState((s) => {
          const f = faultById(s, faultId);
          if (!f) return s;
          const fromId = roleOnFault === "technician" ? f.technicianId : f.custodianId;
          const t = nowIso();
          const ev: FaultEvent = { id: uid("e"), kind: "reassigned", actorId, eventTime: t, syncedAt: s.online ? t : undefined, reassigned: { roleOnFault, fromId, toId } };
          const next: Fault = { ...f, events: [...f.events, ev], ...(roleOnFault === "technician" ? { technicianId: toId } : { custodianId: toId }) };
          return { ...s, faults: s.faults.map((x) => (x.id === faultId ? next : x)) };
        });
        notify(roleOnFault === "technician" ? "Technician reassigned" : "Custodian reassigned");
      },
      revealPhone(viewerId, subjectId, waterPointId) {
        setState((s) => ({
          ...s,
          phoneAccessLog: [{ id: uid("p"), viewerId, subjectId, waterPointId, purpose: "Fault follow-up", accessedAt: nowIso() }, ...s.phoneAccessLog],
        }));
      },
      addWaterPoint(wp) {
        const created: WaterPoint = { ...wp, id: uid("wp") };
        setState((s) => ({ ...s, waterPoints: [...s.waterPoints, created] }));
        notify("Water point added", created.externalId);
        return created;
      },
      updateWaterPoint(id, patch, reason) {
        setState((s) => {
          const wp = s.waterPoints.find((w) => w.id === id);
          if (!wp) return s;
          const at = nowIso();
          const changes = (Object.keys(patch) as Array<keyof typeof patch>).filter((k) => String(patch[k] ?? "") !== String(wp[k] ?? ""));
          if (!changes.length) return s;
          const corr = changes.map((k) => ({
            id: uid("c"),
            entityType: "water_point" as const,
            entityId: id,
            fieldName: String(k),
            previousValue: String(wp[k] ?? ""),
            newValue: String(patch[k] ?? ""),
            reason: reason || "Updated by admin",
            correctedById: ADMIN,
            correctedAt: at,
          }));
          return { ...s, waterPoints: s.waterPoints.map((w) => (w.id === id ? { ...w, ...patch } : w)), corrections: [...corr, ...s.corrections] };
        });
        notify("Water point saved", "Changes are in the activity log");
      },
      setArchived(id, archived, reason) {
        setState((s) => ({
          ...s,
          waterPoints: s.waterPoints.map((w) => (w.id === id ? { ...w, archived } : w)),
          corrections: [
            { id: uid("c"), entityType: "water_point", entityId: id, fieldName: "archived", previousValue: String(!archived), newValue: String(archived), reason: reason || (archived ? "Archived by admin" : "Restored by admin"), correctedById: ADMIN, correctedAt: nowIso() },
            ...s.corrections,
          ],
        }));
        notify(archived ? "Water point archived" : "Water point restored", "Its fault history is kept");
      },
      setAssignment(waterPointId, roleOnPoint, userId) {
        setState((s) => {
          const prev = s.assignments.find((a) => a.waterPointId === waterPointId && a.roleOnPoint === roleOnPoint);
          if ((prev?.userId ?? null) === userId) return s;
          const name = (id?: string) => s.users.find((u) => u.id === id)?.name ?? "Not assigned";
          const rest = s.assignments.filter((a) => !(a.waterPointId === waterPointId && a.roleOnPoint === roleOnPoint));
          return {
            ...s,
            assignments: userId ? [...rest, { waterPointId, userId, roleOnPoint }] : rest,
            corrections: [
              { id: uid("c"), entityType: "assignment", entityId: waterPointId, fieldName: roleOnPoint, previousValue: name(prev?.userId), newValue: name(userId ?? undefined), reason: "Assignment changed by admin", correctedById: ADMIN, correctedAt: nowIso() },
              ...s.corrections,
            ],
          };
        });
        notify(roleOnPoint === "custodian" ? "Custodian assigned" : "Technician assigned", "Open faults keep their current people");
      },
      inviteUser(u, assign) {
        const created: User = { ...u, id: uid("u"), status: "invited" };
        setState((s) => {
          const role: Assignment["roleOnPoint"] = u.role === "technician" ? "technician" : u.role === "assisting_user" ? "assisting_user" : "custodian";
          const ids = assign?.waterPointIds ?? [];
          // custodian and technician are one per water point: replace; assisting users add
          const assignments =
            role === "assisting_user"
              ? [...s.assignments, ...ids.map((w) => ({ waterPointId: w, userId: created.id, roleOnPoint: role }))]
              : [...s.assignments.filter((a) => !(ids.includes(a.waterPointId) && a.roleOnPoint === role)), ...ids.map((w) => ({ waterPointId: w, userId: created.id, roleOnPoint: role }))];
          return { ...s, users: [...s.users, created], assignments: ["custodian", "technician", "assisting_user"].includes(u.role) ? assignments : s.assignments };
        });
        notify("Invitation recorded", "No message is sent in the demo");
        return created;
      },
      setRole(userId, role) {
        setState((s) => {
          const u = s.users.find((x) => x.id === userId);
          if (!u || u.role === role) return s;
          return {
            ...s,
            users: s.users.map((x) => (x.id === userId ? { ...x, role } : x)),
            corrections: [{ id: uid("c"), entityType: "user", entityId: userId, fieldName: "role", previousValue: u.role, newValue: role, reason: "Role changed by admin", correctedById: ADMIN, correctedAt: nowIso() }, ...s.corrections],
          };
        });
        notify("Role updated");
      },
      setUserStatus(userId, status, reason) {
        setState((s) => {
          const u = s.users.find((x) => x.id === userId);
          if (!u || u.status === status) return s;
          return {
            ...s,
            users: s.users.map((x) => (x.id === userId ? { ...x, status } : x)),
            corrections: [{ id: uid("c"), entityType: "user", entityId: userId, fieldName: "status", previousValue: u.status, newValue: status, reason: reason || "Changed by admin", correctedById: ADMIN, correctedAt: nowIso() }, ...s.corrections],
          };
        });
        notify(status === "deactivated" ? "Person deactivated" : "Person reactivated", "Their past records stay");
      },
      mergeFaults(keepId, mergeId, actorId) {
        setState((s) => {
          const keep = faultById(s, keepId);
          const drop = faultById(s, mergeId);
          if (!keep || !drop) return s;
          const t = nowIso();
          const reporters = Array.from(new Set([...(keep.extraReporterIds ?? []), drop.assistedById ?? drop.custodianId, ...(drop.extraReporterIds ?? [])]));
          const kept: Fault = {
            ...keep,
            extraReporterIds: reporters,
            events: [...keep.events, { id: uid("e"), kind: "merged", actorId, eventTime: t, syncedAt: s.online ? t : undefined, note: `${drop.number} merged into this fault. Its reporters are listed on this record.` }],
          };
          const merged: Fault = {
            ...drop,
            mergedInto: keepId,
            events: [...drop.events, { id: uid("e"), kind: "merged", actorId, eventTime: t, syncedAt: s.online ? t : undefined, note: `Merged into ${keep.number}.` }],
          };
          return {
            ...s,
            faults: s.faults.map((f) => (f.id === keepId ? kept : f.id === mergeId ? merged : f)),
            corrections: [{ id: uid("c"), entityType: "fault", entityId: mergeId, fieldName: "merged_into", previousValue: "", newValue: keep.number, reason: "Duplicate report of the same fault", correctedById: actorId, correctedAt: t }, ...s.corrections],
          };
        });
        notify("Duplicates merged", "The earlier report date is kept");
      },
      updateSettings(patch, label) {
        setState((s) => {
          const changed = (Object.keys(patch) as Array<keyof OrgSettings>).filter((k) => JSON.stringify(patch[k]) !== JSON.stringify(s.settings[k]));
          if (!changed.length) return s;
          const fmt = (v: unknown) => (Array.isArray(v) ? v.join(", ") : String(v));
          return {
            ...s,
            settings: { ...s.settings, ...patch },
            corrections: [
              ...changed.map((k) => ({ id: uid("c"), entityType: "setting" as const, entityId: "org", fieldName: k, previousValue: fmt(s.settings[k]), newValue: fmt(patch[k]), reason: label, correctedById: ADMIN, correctedAt: nowIso() })),
              ...s.corrections,
            ],
          };
        });
        notify("Saved", label);
      },
      setOrgName(name) {
        setState((s) =>
          name === s.organisation.name
            ? s
            : {
                ...s,
                organisation: { ...s.organisation, name },
                corrections: [{ id: uid("c"), entityType: "setting", entityId: "org", fieldName: "organisation_name", previousValue: s.organisation.name, newValue: name, reason: "Organisation renamed", correctedById: ADMIN, correctedAt: nowIso() }, ...s.corrections],
              },
        );
        notify("Saved", "Organisation name");
      },
      renameUser(userId, name) {
        setState((s) => {
          const u = s.users.find((x) => x.id === userId);
          if (!u || u.name === name) return s;
          return {
            ...s,
            users: s.users.map((x) => (x.id === userId ? { ...x, name } : x)),
            corrections: [{ id: uid("c"), entityType: "user", entityId: userId, fieldName: "name", previousValue: u.name, newValue: name, reason: "Name updated in settings", correctedById: ADMIN, correctedAt: nowIso() }, ...s.corrections],
          };
        });
        notify("Saved", "Your name");
      },
      setOptions(list, options, change) {
        setState((s) => ({
          ...s,
          [list]: options,
          corrections: [{ id: uid("c"), entityType: "setting", entityId: list, fieldName: list === "faultTypes" ? "fault_types" : "diagnosis_categories", previousValue: "", newValue: change, reason: "List updated in settings", correctedById: ADMIN, correctedAt: nowIso() }, ...s.corrections],
        }));
        notify("Saved", change);
      },
      trackOfficerListOpen() {
        // Child effects run before the provider has loaded saved data; queue until then.
        if (!readyRef.current) {
          pendingOpens.current.push(nowIso());
          return;
        }
        setState((s) => ({ ...s, officerListOpens: [...s.officerListOpens, nowIso()].slice(-200) }));
      },
      recordConsent(userId, purpose) {
        setState((s) => ({ ...s, users: s.users.map((u) => (u.id === userId ? { ...u, phoneConsentAt: nowIso(), phoneConsentPurpose: purpose } : u)) }));
        notify("Consent recorded");
      },
      setOnline(online) {
        setState((s) => ({ ...s, online }));
      },
      syncNow() {
        setState((s) => {
          if (!s.online) return s;
          const t = nowIso();
          return {
            ...s,
            lastSyncAt: t,
            faults: s.faults.map((f) => ({
              ...f,
              syncedAt: f.syncedAt ?? t,
              events: f.events.map((e) => (e.syncedAt ? e : { ...e, syncedAt: t })),
            })),
          };
        });
        notify("All records synced");
      },
      reset() {
        try {
          localStorage.removeItem(KEY);
        } catch {}
        setState(createSeed());
        notify("Demo data reset");
      },
    };
  }, [notify, state.online]);

  const value = useMemo(() => ({ state, toast, now, ...actions }), [state, toast, now, actions]);

  // Render from the seed on the server so every route has a static shell; hide it until the
  // browser's saved copy has loaded, so there is no flash of seed data.
  return (
    <DemoContext.Provider value={value}>
      <div className={ready ? undefined : "invisible"} aria-busy={!ready || undefined}>
        {children}
      </div>
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used inside <DemoProvider>");
  return ctx;
}

/** Demo personas: who you act as in each role. */
export const PERSONA: Record<string, string> = {
  officer: "u-fatima",
  approver: "u-halima",
  technician: "u-sani",
  custodian: "u-amina",
  assist: "u-zainab",
  admin: "u-yakubu",
};
