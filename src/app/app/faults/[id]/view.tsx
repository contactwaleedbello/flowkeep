"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronDown, ChevronUp, Eye, Megaphone, Phone, RotateCcw, UserRoundCog } from "lucide-react";
import { cn } from "@/lib/cn";
import { FAULT_STATUS } from "@/lib/fault-status";
import {
  currentEstimate,
  currentStep,
  faultById,
  fmtMoney,
  isOpen,
  label,
  fmtDate,
  latestOf,
  needsRevision,
  reopenedCount,
  userById,
  usersWithRole,
  waitingOn,
  wpById,
} from "@/lib/demo/logic";
import { closedAt, daysToRestore, pace, stepStays, useQueue } from "@/lib/demo/officer";
import { PERSONA, useDemo } from "@/lib/demo/store";
import { CellSelect, fmtDays } from "@/components/app/admin-ui";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { Menu, OfficerActionDialog, type MenuItem, type OfficerAction } from "@/components/app/officer-ui";
import { SignalsPanel, toTimeline } from "@/components/app/fault-bits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banner, EmptyState } from "@/components/ui/feedback";
import { LifecycleStepper } from "@/components/ui/lifecycle";
import { StatusPill } from "@/components/ui/status-pill";
import { Timeline } from "@/components/ui/timeline";

export function FaultRecordView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const demo = useDemo();
  const { state } = demo;
  const me = PERSONA.officer;
  const f = faultById(state, id);
  const [action, setAction] = useState<OfficerAction | null>(null);
  const [shownPhone, setShownPhone] = useState(false);
  const router = useRouter();
  const stays = useMemo(() => stepStays(state), [state]);

  // "3 of 7": the order of the list the officer came from (remembered by the list).
  const queue = useQueue();
  const pos = queue ? queue.indexOf(id) : -1;
  const prevId = pos > 0 ? queue![pos - 1] : undefined;
  const nextId = pos >= 0 && pos < queue!.length - 1 ? queue![pos + 1] : undefined;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.metaKey || e.ctrlKey || e.altKey || t.closest("input, textarea, select, dialog[open]")) return;
      if (e.key === "j" && nextId) router.push(`/app/faults/${nextId}`);
      if (e.key === "k" && prevId) router.push(`/app/faults/${prevId}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextId, prevId, router]);

  if (!f) {
    return (
      <DesktopShell role="officer">
        <Card>
          <EmptyState title="Fault not found" body="It may have been created in another browser. Demo data lives in each browser separately." action={<Link className="text-label-lg font-medium text-primary" href="/app/officer">Back to open faults</Link>} />
        </Card>
      </DesktopShell>
    );
  }

  const wp = wpById(state, f.waterPointId);
  const custodian = userById(state, f.custodianId);
  const tech = userById(state, f.technicianId);
  const est = currentEstimate(f);
  const open = isOpen(f);
  const p = pace(stays, f, demo.now);
  const canPhone = !!(custodian?.phone && custodian.phoneConsentAt);
  const showPhone = () => {
    if (!custodian || shownPhone) return;
    demo.revealPhone(me, custodian.id, f.waterPointId);
    setShownPhone(true);
  };

  // One obvious next step for the officer; the rest sits in "⋯" (incident.io, Linear).
  const primary: { label: string; icon: React.ReactNode; run: () => void } | null =
    !open || f.status === "funding_rejected"
      ? null
      : waitingOn(f) === "custodian" && canPhone && !shownPhone
        ? { label: "Show custodian phone", icon: <Phone aria-hidden className="size-4" />, run: showPhone }
        : p.slow && waitingOn(f) === "technician"
          ? { label: "Reassign technician", icon: <UserRoundCog aria-hidden className="size-4" />, run: () => setAction("reassign-technician") }
          : null;
  const more: MenuItem[] = open
    ? [
        { label: "Reassign technician", onSelect: () => setAction("reassign-technician") },
        { label: "Reassign custodian", onSelect: () => setAction("reassign-custodian") },
        { label: "Escalate", hint: "Recorded on the fault", onSelect: () => setAction("escalate") },
        { label: "Abandon…", danger: true, onSelect: () => setAction("abandon") },
      ]
    : [];

  return (
    <DesktopShell role="officer">
      <PageHeader
        back={{ href: "/app/officer", label: open ? "Open faults" : "Faults" }}
        eyebrow={`${f.number} · ${wp?.externalId} · ${wp?.state}`}
        title={wp?.name ?? "Fault"}
        sub={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <StatusPill status={f.status} size="sm" />
            <span>
              {label(state.faultTypes, f.faultType)} · {wp?.community}, {wp?.lga}
            </span>
          </span>
        }
        actions={
          <>
            {pos >= 0 && queue && queue.length > 1 && (
              <div className="flex items-center gap-1" aria-label="Move through the list">
                <span className="mr-1 font-mono text-[12px] text-on-surface-variant num">
                  {pos + 1} of {queue.length}
                </span>
                <QueueLink href={prevId && `/app/faults/${prevId}`} label="Previous fault (k)">
                  <ChevronUp aria-hidden className="size-4" />
                </QueueLink>
                <QueueLink href={nextId && `/app/faults/${nextId}`} label="Next fault (j)">
                  <ChevronDown aria-hidden className="size-4" />
                </QueueLink>
              </div>
            )}
            {primary && (
              <Button onClick={primary.run} leadingIcon={primary.icon}>
                {primary.label}
              </Button>
            )}
            {more.length > 0 && (
              <span className="rounded-md border border-outline-variant">
                <Menu label="More actions" items={more} />
              </span>
            )}
          </>
        }
      />

      {f.status === "funding_rejected" && needsRevision(f) && (
        <Banner tone="info" title="Revised estimate requested" className="mb-6">
          <p>{latestOf(f, "revision_requested")?.note} The fault is with {tech?.name} until a new estimate arrives.</p>
        </Banner>
      )}
      {f.status === "funding_rejected" && !needsRevision(f) && (
        <Banner tone="attention" title="Funding was rejected. This fault needs you." className="mb-6">
          <p>{[...f.events].reverse().find((e) => e.kind === "decided")?.note ?? "No reason was recorded."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setAction("revise")} leadingIcon={<RotateCcw aria-hidden className="size-4" />}>Ask for revised estimate</Button>
            <Button size="sm" variant="outlined" onClick={() => setAction("escalate")} leadingIcon={<Megaphone aria-hidden className="size-4" />}>Escalate</Button>
            <Button size="sm" variant="outlined" onClick={() => setAction("abandon")}>Abandon</Button>
          </div>
        </Banner>
      )}

      <Card className="mb-6 px-2 pt-6 pb-5 sm:px-8">
        <LifecycleStepper current={currentStep(f)} reopened={reopenedCount(f)} />
        <div className="mt-5 flex flex-col items-center gap-1 border-t border-outline-variant/60 pt-4 text-center text-body-sm text-on-surface-variant">
          <p>{FAULT_STATUS[f.status].description}</p>
          {open ? (
            <p className={cn("num", p.slow && "font-medium text-on-secondary-container")}>
              In this step {p.days === 0 ? "since today" : `for ${p.days} day${p.days === 1 ? "" : "s"}`}
              {p.usual ? ` · usual ${fmtDays(p.usual.days)}, from ${p.usual.n} past faults` : " · not enough past faults to say what is usual yet"}
              {p.slow && " · slower than usual"}
            </p>
          ) : (
            <p className="num">
              Closed {fmtDate(closedAt(f) ?? f.eventTime)}
              {daysToRestore(f) !== undefined && ` · ${fmtDays(daysToRestore(f)!)} from report to water flowing`}
            </p>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-5 sm:p-6">
          <h2 className="mb-5 text-title-md font-semibold text-on-surface">Record</h2>
          <Timeline events={toTimeline(state, f)} />
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-5">
            <h2 className="mb-4 text-title-md font-semibold text-on-surface">Details</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 text-body-md">
              <dt className="text-on-surface-variant">Fault</dt>
              <dd className="text-on-surface">{label(state.faultTypes, f.faultType)}</dd>
              {est && (
                <>
                  <dt className="text-on-surface-variant">Estimate</dt>
                  <dd className="text-on-surface tabular-nums">{fmtMoney(est.diagnosis?.amount)}</dd>
                </>
              )}
              <dt className="pt-1.5 text-on-surface-variant">Custodian</dt>
              <dd className="text-on-surface">
                {open ? (
                  <CellSelect className="-ml-2" label="Custodian" value={f.custodianId} onChange={(v) => demo.reassign(f.id, me, "custodian", v)}>
                    {usersWithRole(state, "custodian")
                      .filter((u) => u.status === "active" || u.id === f.custodianId)
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </CellSelect>
                ) : (
                  custodian?.name
                )}
                {canPhone ? (
                  shownPhone ? (
                    <span className="block text-body-sm text-on-surface-variant">{custodian!.phone} · view logged</span>
                  ) : (
                    <button
                      type="button"
                      onClick={showPhone}
                      className="mt-0.5 flex items-center gap-1 text-label-md font-medium text-primary"
                    >
                      <Eye aria-hidden className="size-3.5" /> Show phone number
                    </button>
                  )
                ) : (
                  <span className="block text-body-sm text-on-surface-variant">No phone consent recorded</span>
                )}
              </dd>
              {f.assistedById && (
                <>
                  <dt className="text-on-surface-variant">Reported by</dt>
                  <dd className="text-on-surface">{userById(state, f.assistedById)?.name} (assisting)</dd>
                </>
              )}
              <dt className={cn("text-on-surface-variant", open && "pt-1.5")}>Technician</dt>
              <dd className="text-on-surface">
                {open ? (
                  <CellSelect className="-ml-2" label="Technician" value={f.technicianId} onChange={(v) => demo.reassign(f.id, me, "technician", v)}>
                    {usersWithRole(state, "technician").map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </CellSelect>
                ) : (
                  tech?.name
                )}
              </dd>
              <dt className="text-on-surface-variant">Water point</dt>
              <dd>
                <Link href={`/app/water-points/${f.waterPointId}`} className="inline-flex items-center gap-0.5 font-medium text-primary">
                  {wp?.externalId} history <ArrowUpRight aria-hidden className="size-3.5" />
                </Link>
              </dd>
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="mb-1 text-title-md font-semibold text-on-surface">Timestamps</h2>
            <p className="mb-4 text-body-sm text-on-surface-variant">Device time of each step, and the gap since the step before.</p>
            <SignalsPanel fault={f} />
          </Card>
        </div>
      </div>

      <OfficerActionDialog fault={action ? f : null} action={action} onClose={() => setAction(null)} />
    </DesktopShell>
  );
}

function QueueLink({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  const cls = "flex size-8 items-center justify-center rounded-md border border-outline-variant text-on-surface-variant";
  return href ? (
    <Link href={href} aria-label={label} title={label} className={cn(cls, "hover:bg-surface-container-low hover:text-on-surface")}>
      {children}
    </Link>
  ) : (
    <span aria-hidden className={cn(cls, "opacity-40")}>
      {children}
    </span>
  );
}
