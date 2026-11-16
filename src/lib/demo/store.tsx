"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { FaultStatus } from "@/lib/fault-status";
import { canTransition, faultById } from "./logic";
import { createSeed } from "./seed";
import type { DemoState, Fault, FaultEvent, User, WaterPoint } from "./types";

/**
 * Front-end demo store. No backend: state lives in React and is saved to localStorage.
 * It behaves like the offline-first app in PRD §9: when "offline", new records have no
 * syncedAt until "Sync now" runs.
 */

const KEY = "flowkeep-demo-v1";

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
  addWaterPoint(wp: Omit<WaterPoint, "id">): void;
  inviteUser(u: Pick<User, "name" | "role" | "phone">): void;
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
let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}${(seq++).toString(36)}`;

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(createSeed);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [now, setNow] = useState(DEMO_NOW);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const stateRef = useRef(state);
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
        if (parsed.version === 1) setState(parsed);
      }
    } catch {}
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
        setState((s) => ({ ...s, waterPoints: [...s.waterPoints, { ...wp, id: uid("wp") }] }));
        notify("Water point added");
      },
      inviteUser(u) {
        setState((s) => ({ ...s, users: [...s.users, { ...u, id: uid("u"), status: "invited" }] }));
        notify("Invitation recorded", "No message is sent in the demo");
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
