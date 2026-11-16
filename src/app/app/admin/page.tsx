"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Copy, MailPlus, ShieldAlert, Wrench, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  attention,
  completeness,
  confirmationRate,
  missingFields,
  opensLast7Days,
  pointsWithFault,

  stageMedians,
} from "@/lib/demo/analytics";
import { fmtDateTime, label, userById, wpById } from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import type { Fault } from "@/lib/demo/types";
import { HBars, Meter } from "@/components/app/admin-ui";
import { ConsentDialog } from "@/components/app/admin-dialogs";
import { DesktopShell, Dialog, PageHeader } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-pill";

export default function AdminOverview() {
  const { state, now } = useDemo();
  const a = attention(state);
  const [consentFor, setConsentFor] = useState<string | null>(null);
  const [merge, setMerge] = useState<{ keep: Fault; merge: Fault } | null>(null);

  const pts = state.waterPoints.filter((w) => !w.archived);
  const steps = [
    { done: pts.length > 0, label: "Add your water points", href: "/app/admin/water-points" },
    { done: pts.length > 0 && a.noCustodian.length === 0, label: "Give every water point a custodian", href: "/app/admin/water-points?filter=missing" },
    { done: pts.length > 0 && a.noTechnician.length === 0, label: "Give every water point a technician", href: "/app/admin/water-points?filter=missing" },
    { done: state.users.some((u) => u.role === "approver" && u.status === "active"), label: "Invite an approver with budget authority", href: "/app/admin/people" },
    { done: a.consentMissing.length === 0, label: "Record phone consent for every custodian with a number", href: "/app/admin/people?filter=consent" },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  type Item = { key: string; icon: LucideIcon; text: React.ReactNode; action: React.ReactNode };
  const items: Item[] = [
    ...a.duplicates.map((d) => ({
      key: `dup-${d.merge.id}`,
      icon: Copy,
      text: (
        <>
          <span className="font-mono">{d.merge.number}</span> looks like a repeat of <span className="font-mono">{d.keep.number}</span> at {wpById(state, d.keep.waterPointId)?.externalId}
        </>
      ),
      action: <Button size="sm" variant="outlined" onClick={() => setMerge(d)}>Review</Button>,
    })),
    ...a.consentMissing.map((u) => ({
      key: `consent-${u.id}`,
      icon: ShieldAlert,
      text: <>{u.name} has a phone number stored without recorded consent</>,
      action: <Button size="sm" variant="outlined" onClick={() => setConsentFor(u.id)}>Record consent</Button>,
    })),
    ...[...a.noCustodian.map((w) => ({ w, role: "custodian" })), ...a.noTechnician.map((w) => ({ w, role: "technician" }))].map(({ w, role }) => ({
      key: `assign-${w.id}-${role}`,
      icon: Wrench,
      text: <>{w.externalId} has no {role}</>,
      action: (
        <Link href="/app/admin/water-points?filter=missing" className="text-label-lg font-medium text-primary">
          Assign
        </Link>
      ),
    })),
    ...a.invitesPending.map((u) => ({
      key: `invite-${u.id}`,
      icon: MailPlus,
      text: <>{u.name} hasn&apos;t accepted their invitation</>,
      action: (
        <Link href="/app/admin/people?filter=invited" className="text-label-lg font-medium text-primary">
          View
        </Link>
      ),
    })),
  ];

  const stages = stageMedians(state);
  const conf = confirmationRate(state);
  const wpf = pointsWithFault(state);
  const comp = completeness(state);
  const opens = opensLast7Days(state, now);
  const merged = state.faults.filter((f) => f.mergedInto).length;
  const incomplete = state.faults.filter((f) => !f.mergedInto && missingFields(state, f).length);

  return (
    <DesktopShell role="admin">
      <PageHeader title="Overview" sub={state.organisation.name} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* ---- Needs attention ---- */}
        <section aria-labelledby="attention" className="flex flex-col gap-3">
          <h2 id="attention" className="flex items-center gap-2 text-title-md font-semibold text-on-surface">
            Needs attention <span className="font-mono text-[12px] font-normal text-on-surface-variant">{items.length}</span>
          </h2>
          <Card className="overflow-hidden">
            {items.length === 0 ? (
              <p className="flex items-center gap-2 px-5 py-6 text-body-md text-on-surface-variant">
                <Check aria-hidden className="size-4 text-success" /> Nothing needs you right now.
              </p>
            ) : (
              <ul className="divide-y divide-outline-variant/60">
                {items.map(({ key, icon: Icon, text, action }) => (
                  <li key={key} className="flex items-center gap-3 px-4 py-3">
                    <Icon aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
                    <span className="flex-1 text-body-md text-on-surface">{text}</span>
                    {action}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* ---- Setup (only while incomplete) ---- */}
        {doneCount < steps.length ? (
          <section aria-labelledby="setup" className="flex flex-col gap-3">
            <h2 id="setup" className="flex items-center justify-between text-title-md font-semibold text-on-surface">
              Pilot setup
              <span className="font-mono text-[12px] font-normal text-on-surface-variant">
                {doneCount} of {steps.length}
              </span>
            </h2>
            <Card className="overflow-hidden">
              <div className="h-1 bg-surface-container">
                <div className="h-full bg-primary" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
              </div>
              <ul className="divide-y divide-outline-variant/60">
                {steps.map((s) => (
                  <li key={s.label}>
                    <Link href={s.href} className={cn("group flex items-center gap-3 px-4 py-3 text-body-md hover:bg-surface-container-low", s.done ? "text-on-surface-variant" : "text-on-surface")}>
                      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", s.done ? "border-primary bg-primary text-on-primary" : "border-outline")}>
                        {s.done && <Check aria-hidden className="size-3" strokeWidth={3} />}
                      </span>
                      <span className={cn("flex-1", s.done && "line-through decoration-outline-variant")}>{s.label}</span>
                      {!s.done && <ArrowRight aria-hidden className="size-4 text-on-surface-variant transition-transform group-hover:translate-x-0.5" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        ) : (
          <div />
        )}
      </div>

      {/* ---- Signals (PRD §13) ---- */}
      <section aria-labelledby="signals" className="mt-10 flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="signals" className="text-title-md font-semibold text-on-surface">
            Signals
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            From {state.faults.filter((f) => !f.mergedInto).length} faults at {pts.length} water points. Signals, not statistics.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="p-5">
            <div className="mb-5 flex items-baseline justify-between gap-2">
              <h3 className="text-label-lg font-semibold text-on-surface">Time between steps</h3>
              <span className="text-body-sm text-on-surface-variant">Median · hover for detail</span>
            </div>
            <HBars rows={stages.map((s) => ({ label: s.label, value: s.days, n: s.n }))} unit="days" caption="Median days between lifecycle steps" />
            <p className="mt-4 text-body-sm text-on-surface-variant">n is the number of faults with both timestamps. Below 5, read it as a hint.</p>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <p className="mb-3 text-label-md text-on-surface-variant">Custodian answered after repair</p>
              <Meter x={conf.x} n={conf.n} label="Custodian confirmation rate" />
            </Card>
            <Card className="p-4">
              <p className="mb-3 text-label-md text-on-surface-variant">Water points with a fault</p>
              <Meter x={wpf.x} n={wpf.n} label="Water points with at least one fault" />
            </Card>
            <Card className="p-4">
              <p className="mb-3 text-label-md text-on-surface-variant">Complete fault records</p>
              <Meter x={comp.x} n={comp.n} label="Fault records with all required fields" />
              {incomplete.length > 0 && (
                <p className="mt-2 truncate text-body-sm text-on-surface-variant" title={incomplete.map((f) => `${f.number}: ${missingFields(state, f).join(", ")}`).join("; ")}>
                  Missing in {incomplete.map((f) => f.number).join(", ")}
                </p>
              )}
            </Card>
            <Card className="p-4">
              <p className="mb-3 text-label-md text-on-surface-variant">Officer opened the fault list</p>
              <p className="font-display text-headline-sm font-semibold text-on-surface num">{opens.thisWeek}×</p>
              <p className="mt-1 font-mono text-[11px] text-on-surface-variant">last 7 days · {opens.lastWeek}× the week before</p>
            </Card>
            <Card className="col-span-2 flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-label-md text-on-surface-variant">Corrections written</p>
                <p className="font-display text-headline-sm font-semibold text-on-surface num">{state.corrections.length}</p>
              </div>
              <div>
                <p className="text-label-md text-on-surface-variant">Duplicates merged</p>
                <p className="font-display text-headline-sm font-semibold text-on-surface num">{merged}</p>
              </div>
              <Link href="/app/admin/activity" className="text-label-lg font-medium text-primary">
                Activity
              </Link>
            </Card>
          </div>
        </div>
      </section>

      <ConsentDialog userId={consentFor} onClose={() => setConsentFor(null)} />
      <MergeDialog pair={merge} onClose={() => setMerge(null)} />
    </DesktopShell>
  );
}

/** Side-by-side duplicate review (folk, Kajabi). Keeps the earlier report (PRD §12). */
function MergeDialog({ pair, onClose }: { pair: { keep: Fault; merge: Fault } | null; onClose: () => void }) {
  const { state, mergeFaults } = useDemo();
  const [ack, setAck] = useState(false);
  const close = () => {
    setAck(false);
    onClose();
  };
  return (
    <Dialog open={!!pair} onClose={close} title="Possible duplicate">
      {pair && (
        <div className="flex flex-col gap-4">
          <p className="text-body-md text-on-surface-variant">
            Both are open at {wpById(state, pair.keep.waterPointId)?.name}, reported within three days. Merging keeps the earlier report, adds the other
            reporter to it, and writes a correction. Neither record is deleted.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[pair.keep, pair.merge].map((f, i) => (
              <div key={f.id} className={cn("flex flex-col gap-1.5 rounded-lg border p-3", i === 0 ? "border-primary ring-1 ring-primary" : "border-outline-variant")}>
                <span className="font-mono text-[11px] text-on-surface-variant uppercase">{i === 0 ? "Keep" : "Merge into it"}</span>
                <span className="font-mono text-label-lg text-on-surface">{f.number}</span>
                <span className="text-body-sm text-on-surface">{label(state.faultTypes, f.faultType)}</span>
                <StatusDot status={f.status} className="text-label-md" />
                <span className="font-mono text-[11px] text-on-surface-variant">{fmtDateTime(f.eventTime)}</span>
                <span className="text-body-sm text-on-surface-variant">by {userById(state, f.assistedById ?? f.custodianId)?.name}</span>
              </div>
            ))}
          </div>
          <label className="flex items-start gap-2 text-body-sm text-on-surface">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5 size-4 accent-[var(--md-primary)]" />
            These are the same fault.
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="text" onClick={close}>Not a duplicate</Button>
            <Button
              disabled={!ack}
              onClick={() => {
                mergeFaults(pair.keep.id, pair.merge.id, PERSONA.admin);
                close();
              }}
            >
              Merge
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

