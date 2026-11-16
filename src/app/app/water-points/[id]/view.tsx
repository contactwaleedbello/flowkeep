"use client";

import Link from "next/link";
import { use } from "react";
import { ArrowUpRight, Download, Droplet } from "lucide-react";
import {
  currentEstimate,
  custodianOf,
  fmtDate,
  fmtDateTime,
  fmtMoney,
  label,
  latestOf,
  technicianOf,
  wpById,
} from "@/lib/demo/logic";
import { downloadCsv, faultsCsv } from "@/lib/demo/csv";
import { useDemo } from "@/lib/demo/store";
import type { Fault } from "@/lib/demo/types";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { StatusPill } from "@/components/ui/status-pill";

export function WaterPointView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { state } = useDemo();
  const wp = wpById(state, id);
  if (!wp)
    return (
      <DesktopShell role="officer">
        <Card>
          <EmptyState title="Water point not found" />
        </Card>
      </DesktopShell>
    );

  const faults = state.faults.filter((f) => f.waterPointId === wp.id).sort((a, b) => b.eventTime.localeCompare(a.eventTime));

  return (
    <DesktopShell role="officer">
      <PageHeader
        back={{ href: "/app/water-points", label: "Water points" }}
        title={wp.name}
        sub={`${wp.externalId} · ${wp.kind} · ${wp.community}, ${wp.lga}, ${wp.state}`}
        actions={
          <Button
            variant="outlined"
            leadingIcon={<Download aria-hidden className="size-4" />}
            onClick={() => downloadCsv(`flowkeep-${wp.externalId}.csv`, faultsCsv(state, faults))}
            disabled={!faults.length}
          >
            Export CSV
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <section className="flex flex-col gap-3">
          <h2 className="text-title-md font-semibold text-on-surface">Fault history</h2>
          {faults.length === 0 ? (
            <Card>
              <EmptyState icon={Droplet} title="No faults recorded for this water point" body="Nothing has been reported here through Flowkeep yet. When a custodian reports a fault, its full history appears here." />
            </Card>
          ) : (
            faults.map((f) => <FaultHistoryCard key={f.id} fault={f} />)
          )}
        </section>
        <Card className="self-start p-5">
          <h2 className="mb-4 text-title-md font-semibold text-on-surface">Details</h2>
          <dl className="flex flex-col gap-3 text-body-md">
            {[
              ["Stable ID", wp.externalId],
              ["Custodian", custodianOf(state, wp.id)?.name ?? "Not assigned"],
              ["Technician", technicianOf(state, wp.id)?.name ?? "Not assigned"],
              ["Coordinates", `${wp.latitude.toFixed(4)}, ${wp.longitude.toFixed(4)}`],
              ["Sensor point", wp.installationReference],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-body-sm text-on-surface-variant">{k}</dt>
                <dd className="text-on-surface">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </DesktopShell>
  );

  function FaultHistoryCard({ fault }: { fault: Fault }) {
    const est = currentEstimate(fault);
    const dec = latestOf(fault, "decided");
    const dis = latestOf(fault, "disbursed");
    const out = latestOf(fault, "repair_outcome");
    const conf = latestOf(fault, "confirmation");
    // PRD §7 feature 5 display rules
    const funding = !dec ? "No decision" : dec.decision?.decision === "rejected" ? "Rejected" : dis ? `Disbursed ${fmtMoney(dis.disbursement?.amount)}` : "Funding approved, not disbursed";
    const restored = conf?.waterFlowing ? `Service restored · ${fmtDate(conf.eventTime)}` : conf ? "Custodian said water is not flowing" : "Not confirmed by custodian";
    return (
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-body-sm text-on-surface-variant">
              <span className="font-mono">{fault.number}</span> · reported {fmtDateTime(fault.eventTime)}
            </p>
            <p className="text-title-md font-semibold text-on-surface">{label(state.faultTypes, fault.faultType)}</p>
          </div>
          <StatusPill status={fault.status} size="sm" />
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-3 text-body-md sm:grid-cols-3">
          <Item k="Diagnosis" v={est ? label(state.diagnosisCategories, est.diagnosis?.category) : "No diagnosis"} />
          <Item k="Cost" v={est ? fmtMoney(est.diagnosis?.amount) : "No cost recorded"} />
          <Item k="Funding" v={funding} />
          <Item k="Repair" v={out ? `${out.outcome === "complete" ? "Complete" : out.outcome === "partial" ? "Partial" : "Failed"} · ${fmtDate(out.eventTime)}` : "Not recorded"} />
          <Item k="Water flow" v={restored} />
          <div>
            <dt className="text-body-sm text-on-surface-variant">Record</dt>
            <dd>
              <Link href={`/app/faults/${fault.id}`} className="inline-flex items-center gap-0.5 font-medium text-primary">
                Open <ArrowUpRight aria-hidden className="size-3.5" />
              </Link>
            </dd>
          </div>
        </dl>
      </Card>
    );
  }
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-body-sm text-on-surface-variant">{k}</dt>
      <dd className="text-on-surface">{v}</dd>
    </div>
  );
}
