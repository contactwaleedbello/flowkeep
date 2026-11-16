"use client";

import Link from "next/link";
import { use, useState } from "react";
import { ArrowUpRight, Ban, Eye, Megaphone, RotateCcw } from "lucide-react";
import { FAULT_STATUS } from "@/lib/fault-status";
import {
  currentEstimate,
  currentStep,
  faultById,
  fmtDateTime,
  fmtMoney,
  isOpen,
  label,
  reopenedCount,
  userById,
  usersWithRole,
  wpById,
} from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import { DesktopShell, Dialog, PageHeader } from "@/components/app/chrome";
import { SignalsPanel, toTimeline } from "@/components/app/fault-bits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Banner, EmptyState } from "@/components/ui/feedback";
import { LifecycleStepper } from "@/components/ui/lifecycle";
import { StatusPill } from "@/components/ui/status-pill";
import { SelectField, TextArea } from "@/components/ui/text-field";
import { Timeline } from "@/components/ui/timeline";

export function FaultRecordView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const demo = useDemo();
  const { state } = demo;
  const me = PERSONA.officer;
  const f = faultById(state, id);
  const [dialog, setDialog] = useState<null | "abandon" | "revise" | "escalate" | "reassign">(null);
  const [text, setText] = useState("");
  const [toId, setToId] = useState("");
  const [shownPhone, setShownPhone] = useState(false);

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

  const close = () => {
    setDialog(null);
    setText("");
    setToId("");
  };

  return (
    <DesktopShell role="officer">
      <PageHeader
        back={{ href: "/app/officer", label: "Open faults" }}
        title={wp?.name ?? "Fault"}
        sub={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="font-mono">{f.number}</span>
            <span>{wp?.community}, {wp?.lga}</span>
            <StatusPill status={f.status} size="sm" />
          </span>
        }
        actions={
          open && (
            <>
              <Button variant="outlined" onClick={() => setDialog("reassign")}>Reassign</Button>
              <Button variant="outlined" onClick={() => setDialog("abandon")} leadingIcon={<Ban aria-hidden className="size-4" />}>
                Abandon
              </Button>
            </>
          )
        }
      />

      {f.status === "funding_rejected" && (
        <Banner tone="attention" title="Funding was rejected. This fault needs you." className="mb-6">
          <p>{[...f.events].reverse().find((e) => e.kind === "decided")?.note ?? "No reason was recorded."}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setDialog("revise")} leadingIcon={<RotateCcw aria-hidden className="size-4" />}>Ask for revised estimate</Button>
            <Button size="sm" variant="outlined" onClick={() => setDialog("escalate")} leadingIcon={<Megaphone aria-hidden className="size-4" />}>Escalate</Button>
            <Button size="sm" variant="outlined" onClick={() => setDialog("abandon")}>Abandon</Button>
          </div>
        </Banner>
      )}

      <Card className="mb-6 px-2 py-5 sm:px-6">
        <LifecycleStepper current={currentStep(f)} reopened={reopenedCount(f)} />
        <p className="mt-4 text-center text-body-sm text-on-surface-variant">{FAULT_STATUS[f.status].description}</p>
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
              <dt className="text-on-surface-variant">Custodian</dt>
              <dd className="text-on-surface">
                {custodian?.name}
                {custodian?.phone && custodian.phoneConsentAt ? (
                  shownPhone ? (
                    <span className="block text-body-sm text-on-surface-variant">{custodian.phone} · view logged</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        demo.revealPhone(me, custodian.id, f.waterPointId);
                        setShownPhone(true);
                      }}
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
              <dt className="text-on-surface-variant">Technician</dt>
              <dd className="text-on-surface">{tech?.name}</dd>
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

      {/* ---- dialogs ---- */}
      <Dialog open={dialog === "abandon"} onClose={close} title="Abandon this fault">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            demo.abandon(f.id, me, text.trim());
            close();
          }}
        >
          <p className="text-body-md text-on-surface-variant">The fault closes without a repair. It stays on the record with your reason.</p>
          <TextArea label="Reason" required value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="text" onClick={close}>Cancel</Button>
            <Button type="submit" variant="danger" disabled={!text.trim()}>Abandon fault</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={dialog === "revise" || dialog === "escalate"} onClose={close} title={dialog === "revise" ? "Ask for a revised estimate" : "Escalate"}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (dialog === "revise") demo.requestRevision(f.id, me, text.trim());
            else demo.escalate(f.id, me, text.trim());
            close();
          }}
        >
          <p className="text-body-md text-on-surface-variant">
            {dialog === "revise"
              ? `${tech?.name} sees this on the fault and can submit a new estimate. The rejected one stays on the record.`
              : "Recorded on the fault. In version one, Flowkeep sends no messages, so follow up directly."}
          </p>
          <TextArea label="Note" required value={text} onChange={(e) => setText(e.target.value)} />
          <div className="flex justify-end gap-2">
            <Button variant="text" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={!text.trim()}>Save</Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={dialog === "reassign"} onClose={close} title="Reassign">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const [role, uid] = toId.split(":");
            demo.reassign(f.id, me, role as "technician" | "custodian", uid);
            close();
          }}
        >
          <SelectField label="Assign to" required value={toId} onChange={(e) => setToId(e.target.value)}>
            <option value="" disabled>Choose a person</option>
            <optgroup label="Technician">
              {usersWithRole(state, "technician").filter((u) => u.id !== f.technicianId).map((u) => (
                <option key={u.id} value={`technician:${u.id}`}>{u.name}</option>
              ))}
            </optgroup>
            <optgroup label="Custodian">
              {usersWithRole(state, "custodian").filter((u) => u.id !== f.custodianId && u.status === "active").map((u) => (
                <option key={u.id} value={`custodian:${u.id}`}>{u.name}</option>
              ))}
            </optgroup>
          </SelectField>
          <p className="text-body-sm text-on-surface-variant">
            Now: technician {tech?.name}, custodian {custodian?.name}. Last change {fmtDateTime(f.events[f.events.length - 1]?.eventTime)}.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="text" onClick={close}>Cancel</Button>
            <Button type="submit" disabled={!toId}>Reassign</Button>
          </div>
        </form>
      </Dialog>
    </DesktopShell>
  );
}
