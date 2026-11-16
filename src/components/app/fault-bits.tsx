"use client";

import Link from "next/link";
import { CloudUpload } from "lucide-react";
import { FAULT_STATUS, WAITING_ON_LABEL, WAITING_ON_ORDER } from "@/lib/fault-status";
import { cn } from "@/lib/cn";
import {
  currentEstimate,
  enteredStatusAt,
  fmtDateTime,
  fmtMoney,
  label,
  latestOf,
  signals,
  userById,
  waitingOn,
  wpById,
} from "@/lib/demo/logic";
import { useDemo } from "@/lib/demo/store";
import type { DemoState, Fault, FaultEvent } from "@/lib/demo/types";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import type { StepState } from "@/components/ui/lifecycle";
import { StatusDot } from "@/components/ui/status-pill";
import type { TimelineEvent } from "@/components/ui/timeline";

export const ROLE_LABEL: Record<string, string> = {
  custodian: "Custodian",
  assisting_user: "Assisting user",
  technician: "Technician",
  approver: "Approver",
  programme_officer: "Programme officer",
  admin: "Admin",
};

/** Plain-language sentence for one recorded event. */
export function describe(state: DemoState, f: Fault, e: FaultEvent): string {
  switch (e.kind) {
    case "reported": {
      const forWhom = e.actorId !== f.custodianId ? ` for ${userById(state, f.custodianId)?.name}` : "";
      return `reported "${label(state.faultTypes, f.faultType).toLowerCase()}"${forWhom}`;
    }
    case "diagnosed":
      return `recorded a diagnosis: ${label(state.diagnosisCategories, e.diagnosis?.category).toLowerCase()}. Parts: ${e.diagnosis?.parts}. Estimate ${fmtMoney(e.diagnosis?.amount)}.`;
    case "decided":
      return e.decision?.decision === "approved" ? `approved funding from ${e.decision.funderSource}` : "rejected the estimate";
    case "disbursed":
      return `recorded a disbursement of ${fmtMoney(e.disbursement?.amount)}`;
    case "awaiting_parts":
      return "recorded that parts are not available";
    case "repair_outcome":
      return e.outcome === "complete" ? "marked the repair complete" : e.outcome === "partial" ? "marked the repair as partial" : "marked the repair as failed";
    case "confirmation":
      return e.waterFlowing ? "confirmed water is flowing" : "said water is not flowing. The fault reopened.";
    case "abandoned":
      return "closed the fault as abandoned";
    case "reassigned":
      return `reassigned the ${e.reassigned?.roleOnFault} from ${userById(state, e.reassigned?.fromId)?.name} to ${userById(state, e.reassigned?.toId)?.name}`;
    case "revision_requested":
      return "asked the technician for a revised estimate";
    case "escalated":
      return "escalated the fault";
  }
}

export function toTimeline(state: DemoState, f: Fault): TimelineEvent[] {
  return [...f.events].reverse().map((e) => {
    const u = userById(state, e.actorId);
    return {
      actor: u?.name ?? "Unknown",
      role: ROLE_LABEL[u?.role ?? ""] ?? "",
      action: describe(state, f, e),
      from: e.from,
      to: e.to,
      note: e.note,
      eventTime: fmtDateTime(e.eventTime),
      syncedAt: e.syncedAt ? fmtDateTime(e.syncedAt) : undefined,
      superseded: e.superseded,
    };
  });
}

/** Phone record view: six steps with who and when. */
export function phoneSteps(state: DemoState, f: Fault): Array<{ title: string; meta?: string; state: StepState; body?: string }> {
  const who = (e?: FaultEvent) => (e ? `${fmtDateTime(e.eventTime)} · ${userById(state, e.actorId)?.name}` : undefined);
  const rep = latestOf(f, "reported");
  const dia = currentEstimate(f);
  const dec = latestOf(f, "decided");
  const dis = latestOf(f, "disbursed");
  const out = latestOf(f, "repair_outcome");
  const con = latestOf(f, "confirmation");
  const st = f.status;
  const idx = (() => {
    if (st === "service_verified" || st === "abandoned") return 6;
    if (st === "reported") return 1;
    if (st === "estimate_submitted" || st === "funding_rejected") return 2;
    if (st === "funding_approved") return 3;
    if (st === "funding_disbursed" || st === "awaiting_parts") return 4;
    return 5;
  })();
  const s = (i: number): StepState => (i < idx ? "done" : i === idx ? "current" : "upcoming");
  const steps = [
    { title: "Reported", meta: who(rep) },
    { title: dia ? `Estimate ${fmtMoney(dia.diagnosis?.amount)}` : "Diagnosis and estimate", meta: idx > 1 ? who(dia) : "Waiting on technician" },
    {
      title: st === "funding_rejected" ? "Funding rejected" : dec?.decision?.decision === "approved" && idx > 2 ? "Funding approved" : "Funding decision",
      meta: idx > 2 || st === "funding_rejected" ? who(dec) : "Waiting on approver",
    },
    { title: "Money disbursed", meta: idx > 3 ? who(dis) : undefined },
    {
      title: st === "awaiting_parts" ? "Awaiting parts" : out ? `Repair ${out.outcome === "complete" ? "complete" : out.outcome}` : "Repair",
      meta: idx > 4 ? who(out) : st === "awaiting_parts" ? who(latestOf(f, "awaiting_parts")) : undefined,
    },
    {
      title: st === "service_verified" ? "Water flowing" : "Water flowing?",
      meta: st === "service_verified" ? who(con) : idx === 5 ? "Waiting on custodian" : undefined,
    },
  ];
  return steps.map((x, i) => ({ ...x, state: s(i) }));
}

/** Named timestamps and the gaps between them (PRD §13 signals). */
export function SignalsPanel({ fault }: { fault: Fault }) {
  return (
    <dl className="flex flex-col gap-3">
      {signals(fault).map((r) => (
        <div key={r.label} className="flex items-baseline justify-between gap-3">
          <dt className="text-body-sm text-on-surface-variant">{r.label}</dt>
          <dd className={cn("text-right text-body-md tabular-nums", r.at ? "font-medium text-on-surface" : "text-on-surface-variant")}>
            {r.at ? fmtDateTime(r.at) : "Not recorded"}
            {r.gap && <span className="block text-body-sm font-normal text-on-surface-variant">+{r.gap}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function hasPending(f: Fault) {
  return f.events.some((e) => !e.syncedAt);
}

/** Compact age, e.g. "3d", "today". */
function age(iso: string, now: number) {
  const d = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86_400_000));
  return d === 0 ? "today" : `${d}d`;
}

/** One row in a fault list: dense, scannable, colour only on the status dot. */
export function FaultListRow({ state, fault, href }: { state: DemoState; fault: Fault; href: string }) {
  const { now } = useDemo();
  const wp = wpById(state, fault.waterPointId);
  const est = currentEstimate(fault);
  const waited = age(enteredStatusAt(fault), now);
  return (
    <li>
      <Link
        href={href}
        className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-surface-container-low sm:grid-cols-[56px_1fr_190px_96px_56px] sm:py-2.5"
      >
        <span className="hidden font-mono text-[12px] text-on-surface-variant sm:block">{fault.number}</span>
        <span className="min-w-0">
          <span className="block truncate text-label-lg font-medium text-on-surface">{wp?.name}</span>
          <span className="block truncate text-body-sm text-on-surface-variant">
            <span className="font-mono sm:hidden">{fault.number} · </span>
            {label(state.faultTypes, fault.faultType)} · {wp?.community}
          </span>
        </span>
        <StatusDot status={fault.status} className="col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto" />
        <span className="hidden text-right text-label-lg text-on-surface num sm:block">{est ? fmtMoney(est.diagnosis?.amount) : <span className="text-on-surface-variant">—</span>}</span>
        <span className="col-start-2 row-span-2 row-start-1 flex items-center justify-end gap-2 font-mono text-[12px] text-on-surface-variant sm:col-start-auto sm:row-span-1 sm:row-start-auto">
          {hasPending(fault) && <CloudUpload aria-label="Sync pending" className="size-3.5 text-secondary" />}
          <span title="Time in this state">{waited}</span>
        </span>
      </Link>
    </li>
  );
}

/** Open faults grouped by who acts next, in one list with sticky group rows. */
export function GroupedFaults({ state, faults, hrefFor }: { state: DemoState; faults: Fault[]; hrefFor: (f: Fault) => string }) {
  if (!faults.length)
    return (
      <Card>
        <EmptyState title="No open faults" body="When a custodian reports a fault, it appears here, grouped by who has to act next." />
      </Card>
    );
  return (
    <Card className="overflow-clip">
      <div className="hidden grid-cols-[56px_1fr_190px_96px_56px] gap-x-4 border-b border-outline-variant/70 px-4 py-2 font-mono text-[11px] tracking-wide text-on-surface-variant uppercase sm:grid">
        <span>ID</span>
        <span>Water point</span>
        <span>Status</span>
        <span className="text-right">Estimate</span>
        <span className="text-right">Age</span>
      </div>
      {WAITING_ON_ORDER.map((g) => {
        const rows = faults.filter((f) => waitingOn(f) === g).sort((a, b) => enteredStatusAt(a).localeCompare(enteredStatusAt(b)));
        if (!rows.length) return null;
        return (
          <section key={g}>
            <h2 className="sticky top-14 z-10 flex items-center gap-2 border-b border-outline-variant/60 bg-surface-container-low/95 px-4 py-1.5 text-label-md font-semibold text-on-surface backdrop-blur dark:bg-surface-container/95">
              {WAITING_ON_LABEL[g]}
              <span className="font-mono text-[11px] font-normal text-on-surface-variant">{rows.length}</span>
            </h2>
            <ul className="divide-y divide-outline-variant/50">
              {rows.map((f) => (
                <FaultListRow key={f.id} state={state} fault={f} href={hrefFor(f)} />
              ))}
            </ul>
          </section>
        );
      })}
    </Card>
  );
}

export const statusLabel = (f: Fault) => FAULT_STATUS[f.status].label;
