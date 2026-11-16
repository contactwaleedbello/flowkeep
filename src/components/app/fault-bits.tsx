"use client";

import Link from "next/link";
import { ChevronRight, CloudUpload } from "lucide-react";
import { FAULT_STATUS, WAITING_ON_LABEL, WAITING_ON_ORDER } from "@/lib/fault-status";
import { cn } from "@/lib/cn";
import {
  ago,
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
import { CountBadge, StatusPill } from "@/components/ui/status-pill";
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

/** One row in a fault list. */
export function FaultListRow({ state, fault, href }: { state: DemoState; fault: Fault; href: string }) {
  const { now } = useDemo();
  const wp = wpById(state, fault.waterPointId);
  const est = currentEstimate(fault);
  return (
    <li>
      <Link href={href} className="group flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-surface-container-low">
        <span className="hidden w-14 shrink-0 font-mono text-body-sm text-on-surface-variant sm:block">{fault.number}</span>
        <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-0.5">
          <span className="truncate text-body-md font-semibold text-on-surface">
            <span className="mr-2 font-mono text-body-sm font-normal text-on-surface-variant sm:hidden">{fault.number}</span>
            {wp?.name}
          </span>
          <span className="truncate text-body-sm text-on-surface-variant">
            {label(state.faultTypes, fault.faultType)}
            {est && ` · ${fmtMoney(est.diagnosis?.amount)}`}
          </span>
          <span className="flex flex-wrap items-center gap-2 pt-1 sm:hidden">
            <StatusPill status={fault.status} size="sm" />
          </span>
        </div>
        <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <StatusPill status={fault.status} size="sm" />
          <span className="text-body-sm text-on-surface-variant">{ago(enteredStatusAt(fault), now)} in this state</span>
        </div>
        {hasPending(fault) ? (
          <CloudUpload aria-label="Sync pending" className="size-4 shrink-0 text-on-surface-variant" />
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <ChevronRight aria-hidden className="size-4 shrink-0 text-on-surface-variant transition-transform group-hover:translate-x-0.5" />
      </Link>
    </li>
  );
}

/** Open faults grouped by who acts next. */
export function GroupedFaults({ state, faults, hrefFor }: { state: DemoState; faults: Fault[]; hrefFor: (f: Fault) => string }) {
  if (!faults.length)
    return (
      <Card>
        <EmptyState title="No open faults" body="When a custodian reports a fault, it appears here, grouped by who has to act next." />
      </Card>
    );
  return (
    <div className="flex flex-col gap-6">
      {WAITING_ON_ORDER.map((g) => {
        const rows = faults.filter((f) => waitingOn(f) === g).sort((a, b) => enteredStatusAt(a).localeCompare(enteredStatusAt(b)));
        if (!rows.length) return null;
        return (
          <section key={g} className="flex flex-col gap-2">
            <h2 className="flex items-center gap-2 px-1 text-label-lg font-semibold text-on-surface-variant">
              {WAITING_ON_LABEL[g]} <CountBadge count={rows.length} />
            </h2>
            <Card className="overflow-hidden">
              <ul className="divide-y divide-outline-variant/70">
                {rows.map((f) => (
                  <FaultListRow key={f.id} state={state} fault={f} href={hrefFor(f)} />
                ))}
              </ul>
            </Card>
          </section>
        );
      })}
    </div>
  );
}

export const statusLabel = (f: Fault) => FAULT_STATUS[f.status].label;
