import { ChevronRight, Droplet, MapPin, Phone, Signal, Wifi, BatteryMedium } from "lucide-react";
import type { ReactNode } from "react";
import {
  FAULT_STATUS,
  WAITING_ON_LABEL,
  WAITING_ON_ORDER,
} from "@/lib/fault-status";
import { FAULT_TYPES, SAMPLE_FAULTS, SAMPLE_TIMELINE, SAMPLE_TIMESTAMPS, type SampleFault } from "@/lib/sample-data";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceList } from "@/components/ui/choice-list";
import { SyncBar, SyncTag } from "@/components/ui/feedback";
import { LifecycleStepper } from "@/components/ui/lifecycle";
import { CountBadge, StatusPill } from "@/components/ui/status-pill";
import { Timeline } from "@/components/ui/timeline";

/* ------------------------------------------------------------------ */
/* Screen layer: compositions of components. Sample data only.         */
/* ------------------------------------------------------------------ */

export function FaultRow({ fault }: { fault: SampleFault }) {
  return (
    <li className="state-layer flex items-start gap-3 px-4 py-3 text-on-surface sm:items-center">
      <span className="w-12 shrink-0 pt-0.5 font-mono text-body-sm text-on-surface-variant sm:pt-0">{fault.id}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:gap-0">
        <span className="truncate text-body-md font-semibold">{fault.waterPoint}</span>
        <span className="truncate text-body-sm text-on-surface-variant">
          {fault.community} · {fault.faultType}
        </span>
        <div className="flex flex-wrap items-center gap-2 pt-1 sm:hidden">
          <StatusPill status={fault.status} size="sm" />
          <span className="text-body-sm text-on-surface-variant">{fault.daysInState}d</span>
          <SyncTag synced={fault.synced} />
        </div>
      </div>
      <div className="hidden flex-col items-end gap-1 sm:flex">
        <StatusPill status={fault.status} size="sm" />
        <span className="text-body-sm text-on-surface-variant">
          {fault.daysInState} {fault.daysInState === 1 ? "day" : "days"} in this state
        </span>
      </div>
      <span className="hidden sm:inline">
        <SyncTag synced={fault.synced} />
      </span>
    </li>
  );
}

/** Programme officer's first screen: open faults grouped by who acts next (PRD §6 story 11, §14 risk 2). */
export function OpenFaultsList({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-outline-variant px-4 py-3">
        <div>
          <p className="text-title-md font-semibold text-on-surface">Open faults</p>
          <p className="text-body-sm text-on-surface-variant">{SAMPLE_FAULTS.length} open across 10 water points</p>
        </div>
        <Button size="sm" variant="outlined">Export CSV</Button>
      </div>
      {WAITING_ON_ORDER.map((group) => {
        const rows = SAMPLE_FAULTS.filter((f) => FAULT_STATUS[f.status].waitingOn === group);
        if (!rows.length) return null;
        return (
          <section key={group}>
            <h3 className="flex items-center gap-2 bg-surface-container-low px-4 py-2 text-label-lg font-semibold text-on-surface-variant">
              {WAITING_ON_LABEL[group]} <CountBadge count={rows.length} />
            </h3>
            <ul className="divide-y divide-outline-variant">
              {rows.map((f) => (
                <FaultRow key={f.id} fault={f} />
              ))}
            </ul>
          </section>
        );
      })}
    </Card>
  );
}

/** Fault record (PRD §7 feature 5): stepper, timeline, named timestamps panel. */
export function FaultRecord({ compact = false, className }: { compact?: boolean; className?: string }) {
  const events = compact ? SAMPLE_TIMELINE.slice(-3) : SAMPLE_TIMELINE;
  return (
    <Card variant={compact ? "elevated" : "outlined"} className={cn("overflow-hidden", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant p-4 sm:p-5">
        <div>
          <p className="text-body-sm text-on-surface-variant">F-029 · Unguwan Dutse</p>
          <p className="text-title-lg font-semibold text-on-surface">WP-02 Solar borehole</p>
        </div>
        <StatusPill status="repair_reported_complete" />
      </div>
      <div className="border-b border-outline-variant px-2 py-4 sm:px-4">
        <LifecycleStepper current="verified" />
      </div>
      <div className={cn("grid gap-0", !compact && "md:grid-cols-[1fr_260px]")}>
        <div className="p-4 sm:p-5">
          <p className="mb-3 text-label-lg font-semibold text-on-surface-variant">Record</p>
          <Timeline events={events} />
        </div>
        {!compact && (
          <aside className="border-t border-outline-variant bg-surface-container-low p-4 sm:p-5 md:border-t-0 md:border-l">
            <p className="mb-3 text-label-lg font-semibold text-on-surface-variant">Timestamps</p>
            <dl className="flex flex-col gap-2.5">
              {SAMPLE_TIMESTAMPS.map((t) => (
                <div key={t.label} className="flex flex-col">
                  <dt className="text-body-sm text-on-surface-variant">{t.label}</dt>
                  <dd className={cn("text-body-md font-medium", t.value ? "text-on-surface" : "text-on-secondary-container")}>
                    {t.value ?? "Not recorded yet"}
                    {t.gap && <span className="ml-2 text-body-sm font-normal text-on-surface-variant">+{t.gap}</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </aside>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------ Phone ------------------------------ */

export function PhoneFrame({ children, className, label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "mx-auto flex w-[300px] max-w-full flex-col overflow-hidden rounded-[2.25rem] border-[6px] border-inverse-surface bg-surface shadow-3",
        className,
      )}
    >
      <div className="flex items-center justify-between bg-surface px-5 pt-2.5 pb-1.5 text-label-md font-semibold text-on-surface">
        <span>09:41</span>
        <span className="flex items-center gap-1">
          <Signal aria-hidden className="size-3.5" />
          <Wifi aria-hidden className="size-3.5 opacity-40" />
          <BatteryMedium aria-hidden className="size-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function PhoneHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="px-5 pt-2 pb-3">
      {sub && <p className="text-body-sm text-on-surface-variant">{sub}</p>}
      <p className="text-headline-sm font-semibold text-on-surface">{title}</p>
    </div>
  );
}

/** Restoration confirmation (PRD §7 feature 4, §14 risk 3). One question, two full-sentence answers. */
export function ConfirmFlowPhone({ className }: { className?: string }) {
  return (
    <PhoneFrame className={className} label="Custodian confirmation screen: Is water flowing at WP-02?">
      <SyncBar state="offline" pending={1} className="text-body-sm" />
      <div className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-5">
        <div className="flex items-center gap-3 rounded-md bg-surface-container p-3">
          <span className="flex size-10 items-center justify-center rounded-sm bg-primary-container text-on-primary-container">
            <Droplet aria-hidden className="size-5" />
          </span>
          <div className="text-body-sm">
            <p className="font-semibold text-on-surface">WP-02 Solar borehole</p>
            <p className="text-on-surface-variant">Technician marked repair complete · 13 Nov</p>
          </div>
        </div>
        <p className="text-headline-sm font-semibold text-on-surface">Is water flowing at WP-02 now?</p>
        <div className="mt-auto flex flex-col gap-2.5">
          <Button size="lg" variant="success" block>Yes, water is flowing</Button>
          <Button size="lg" variant="outlined" block>No, water is not flowing</Button>
        </div>
        <p className="text-center text-body-sm text-on-surface-variant">This confirms water flow only, not that the water is safe to drink.</p>
      </div>
    </PhoneFrame>
  );
}

/** Report a fault, step 2 of 2 (Bird pattern): water point already chosen, fault type as full-width options. */
export function ReportFaultPhone({ className }: { className?: string }) {
  return (
    <PhoneFrame className={className} label="Report a fault screen with a list of fault types">
      <SyncBar state="offline" className="text-body-sm" />
      <PhoneHeader title="What is wrong?" sub="Report a fault · WP-02 Solar borehole" />
      <div className="flex flex-1 flex-col gap-4 px-5 pb-5">
        <ChoiceList legend="Fault type" choices={FAULT_TYPES.slice(0, 4)} defaultValue="no_water" className="[&_legend]:sr-only" />
        <Button size="lg" block>Save report</Button>
        <p className="text-center text-body-sm text-on-surface-variant">Saved on this phone. It syncs when you have data.</p>
      </div>
    </PhoneFrame>
  );
}

/** Custodian home: their water points and their reports (talabat card pattern). */
export function CustodianHomePhone({ className }: { className?: string }) {
  return (
    <PhoneFrame className={className} label="Custodian home screen with a report button and a list of reports">
      <SyncBar state="pending" pending={1} className="text-body-sm" />
      <PhoneHeader title="Your water point" sub="Amina Yusuf · Custodian" />
      <div className="flex flex-col gap-3 px-5 pb-5">
        <Button size="lg" block>Report a fault</Button>
        <p className="pt-2 text-label-lg font-semibold text-on-surface-variant">Your reports</p>
        {[
          { s: "repair_reported_complete" as const, t: "No water", d: "Reported 4 Nov, 07:12", action: true, synced: true },
          { s: "service_verified" as const, t: "Leaking pipe", d: "Reported 12 Sep, 16:30", synced: true },
          { s: "reported" as const, t: "Low flow", d: "Reported today, 08:05", synced: false },
        ].map((r) => (
          <Card key={r.d} className="flex flex-col gap-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-body-md font-semibold text-on-surface">{r.t}</p>
                <p className="text-body-sm text-on-surface-variant">{r.d}</p>
              </div>
              <ChevronRight aria-hidden className="size-4 text-on-surface-variant" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <StatusPill status={r.s} size="sm" />
              <SyncTag synced={r.synced} />
            </div>
            {r.action && <Button size="sm" variant="tonal" block>Confirm if water is flowing</Button>}
          </Card>
        ))}
      </div>
    </PhoneFrame>
  );
}

/** Technician job card (Jobber pattern): one primary next action. */
export function TechnicianJobCard({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col gap-3 p-4", className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <StatusPill status="funding_disbursed" size="sm" />
          <p className="mt-2 text-title-md font-semibold text-on-surface">WP-02 Solar borehole</p>
          <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
            <MapPin aria-hidden className="size-3.5" /> Unguwan Dutse · open 9 days
          </p>
        </div>
        <button type="button" aria-label="Call custodian" className="state-layer flex size-10 items-center justify-center rounded-full border border-outline-variant text-primary">
          <Phone aria-hidden className="size-4" />
        </button>
      </div>
      <Button size="lg" block>Record repair outcome</Button>
    </Card>
  );
}

/** Approval side panel (Aboard pattern). */
export function ApprovalPanel({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex flex-col gap-1 border-b border-outline-variant p-5">
        <StatusPill status="estimate_submitted" size="sm" className="w-fit" />
        <p className="mt-2 text-body-sm text-on-surface-variant">Estimate for F-029 · WP-02 Solar borehole</p>
        <p className="text-display-sm font-semibold text-on-surface">₦184,000</p>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 p-5 text-body-md">
        <dt className="text-on-surface-variant">Diagnosis</dt>
        <dd className="text-on-surface">Rising main cracked</dd>
        <dt className="text-on-surface-variant">Parts</dt>
        <dd className="text-on-surface">2 × 3 m galvanised pipe, couplings</dd>
        <dt className="text-on-surface-variant">Technician</dt>
        <dd className="text-on-surface">Sani Danjuma · 6 Nov</dd>
      </dl>
      <div className="mx-5 mb-5 flex items-center gap-2 rounded-md bg-surface-container p-3 text-body-sm">
        <span className="font-medium text-on-surface">Technician submitted</span>
        <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant" />
        <span className="font-semibold text-primary">You decide</span>
        <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant" />
        <span className="text-on-surface-variant">Disburse</span>
      </div>
      <div className="mt-auto flex gap-2 border-t border-outline-variant p-4">
        <Button variant="outlined" className="flex-1">Reject with reason</Button>
        <Button className="flex-1">Approve</Button>
      </div>
    </Card>
  );
}
