"use client";

import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import {
  currentEstimate,
  ago,
  enteredStatusAt,
  fmtDateTime,
  fmtMoney,
  label,
  latestOf,
  userById,
  wpById,
} from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import type { Fault } from "@/lib/demo/types";
import { DesktopShell, Dialog, PageHeader } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { CountBadge, StatusPill } from "@/components/ui/status-pill";
import { SelectField, TextArea, TextField } from "@/components/ui/text-field";

const FUNDERS = ["Maintenance budget 2026", "Emergency repair fund", "Community contribution", "LGA counterpart funding"];

type Tab = "decide" | "disburse" | "done";

export default function ApproverHome() {
  const demo = useDemo();
  const { state } = demo;
  const me = PERSONA.approver;
  const [tab, setTab] = useState<Tab>("decide");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<null | "approve" | "reject" | "disburse">(null);

  const lists = useMemo(() => {
    const decide = state.faults.filter((f) => f.status === "estimate_submitted");
    const disburse = state.faults.filter((f) => f.status === "funding_approved");
    const done = state.faults
      .filter((f) => f.events.some((e) => e.kind === "disbursed" || (e.kind === "decided" && e.decision?.decision === "rejected")))
      .filter((f) => !decide.includes(f) && !disburse.includes(f))
      .sort((a, b) => (latestOf(b, "disbursed")?.eventTime ?? "").localeCompare(latestOf(a, "disbursed")?.eventTime ?? ""));
    return { decide, disburse, done };
  }, [state]);

  const items = lists[tab];
  const selected = items.find((f) => f.id === selectedId) ?? items[0];

  return (
    <DesktopShell role="approver">
      <PageHeader title="Estimates" sub="Decide on estimates, then record when the money actually moves. Approval and disbursement are separate steps." />

      <div role="tablist" aria-label="Queue" className="mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface-container p-1">
        {(
          [
            ["decide", "To decide", lists.decide.length],
            ["disburse", "To disburse", lists.disburse.length],
            ["done", "Decided and paid", lists.done.length],
          ] as const
        ).map(([key, text, count]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              setSelectedId(null);
            }}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-4 text-label-lg whitespace-nowrap",
              tab === key ? "bg-surface-container-lowest font-medium text-on-surface shadow-1 dark:bg-surface-container-high" : "text-on-surface-variant",
            )}
          >
            {text} <CountBadge count={count} />
          </button>
        ))}
      </div>

      {!items.length ? (
        <Card>
          <EmptyState
            title={tab === "decide" ? "No estimates waiting for a decision" : tab === "disburse" ? "Nothing waiting to be disbursed" : "No decisions yet"}
            body={tab === "decide" ? "When a technician submits an estimate, it appears here." : undefined}
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <Card className="overflow-hidden self-start">
            <ul className="divide-y divide-outline-variant/70">
              {items.map((f) => (
                <QueueRow key={f.id} fault={f} active={selected?.id === f.id} onSelect={() => setSelectedId(f.id)} />
              ))}
            </ul>
          </Card>
          {selected && <DecisionPanel fault={selected} tab={tab} onAction={setDialog} />}
        </div>
      )}

      {selected && (
        <>
          <ApproveDialog
            open={dialog === "approve"}
            onClose={() => setDialog(null)}
            onSubmit={(funder, note) => {
              demo.decide(selected.id, me, "approved", note || undefined, funder);
              setDialog(null);
            }}
          />
          <RejectDialog
            open={dialog === "reject"}
            onClose={() => setDialog(null)}
            onSubmit={(reason) => {
              demo.decide(selected.id, me, "rejected", reason, latestOf(selected, "decided")?.decision?.funderSource ?? FUNDERS[0]);
              setDialog(null);
            }}
          />
          <DisburseDialog
            open={dialog === "disburse"}
            amount={currentEstimate(selected)?.diagnosis?.amount ?? 0}
            onClose={() => setDialog(null)}
            onSubmit={(amount, note) => {
              demo.disburse(selected.id, me, amount, note || undefined);
              setDialog(null);
            }}
          />
        </>
      )}
    </DesktopShell>
  );

  function QueueRow({ fault, active, onSelect }: { fault: Fault; active: boolean; onSelect: () => void }) {
    const wp = wpById(state, fault.waterPointId);
    const est = currentEstimate(fault);
    return (
      <li>
        <button
          type="button"
          onClick={onSelect}
          aria-current={active || undefined}
          className={cn(
            "flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-surface-container-low",
            active && "bg-surface-container-low shadow-[inset_2px_0_0_var(--md-primary)]",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-body-md font-semibold text-on-surface">{wp?.name}</span>
            <span className="truncate text-body-sm text-on-surface-variant">
              <span className="font-mono">{fault.number}</span> · {label(state.diagnosisCategories, est?.diagnosis?.category)} · waiting {ago(enteredStatusAt(fault), demo.now)}
            </span>
          </div>
          <span className="text-title-md font-semibold text-on-surface tabular-nums">{fmtMoney(est?.diagnosis?.amount)}</span>
          <ChevronRight aria-hidden className="size-4 text-on-surface-variant" />
        </button>
      </li>
    );
  }

  function DecisionPanel({ fault, tab, onAction }: { fault: Fault; tab: Tab; onAction: (d: "approve" | "reject" | "disburse") => void }) {
    const wp = wpById(state, fault.waterPointId);
    const est = currentEstimate(fault);
    const dec = latestOf(fault, "decided");
    const dis = latestOf(fault, "disbursed");
    const prior = fault.events.filter((e) => e.kind === "diagnosed" && e.superseded);
    return (
      <Card className="flex flex-col self-start lg:sticky lg:top-6">
        <div className="flex flex-col gap-2 border-b border-outline-variant/70 p-6">
          <StatusPill status={fault.status} size="sm" className="w-fit" />
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {fault.number} · {wp?.name}
          </p>
          <p className="text-display-sm font-semibold text-on-surface tabular-nums">{fmtMoney(est?.diagnosis?.amount)}</p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 p-6 text-body-md">
          <dt className="text-on-surface-variant">Diagnosis</dt>
          <dd className="text-on-surface">{label(state.diagnosisCategories, est?.diagnosis?.category)}</dd>
          <dt className="text-on-surface-variant">Parts</dt>
          <dd className="text-on-surface">{est?.diagnosis?.parts}</dd>
          <dt className="text-on-surface-variant">Technician</dt>
          <dd className="text-on-surface">
            {userById(state, est?.actorId)?.name} · {fmtDateTime(est?.eventTime)}
          </dd>
          <dt className="text-on-surface-variant">Reported</dt>
          <dd className="text-on-surface">{fmtDateTime(fault.eventTime)}</dd>
          {prior.length > 0 && (
            <>
              <dt className="text-on-surface-variant">Earlier</dt>
              <dd className="text-on-surface-variant">
                {prior.map((p) => `${fmtMoney(p.diagnosis?.amount)} (superseded)`).join(", ")}
              </dd>
            </>
          )}
          {dec && tab !== "decide" && (
            <>
              <dt className="text-on-surface-variant">Decision</dt>
              <dd className="text-on-surface">
                {dec.decision?.decision === "approved" ? "Approved" : "Rejected"} · {fmtDateTime(dec.eventTime)}
                {dec.note && <span className="block text-on-surface-variant">{dec.note}</span>}
              </dd>
            </>
          )}
          {dis && (
            <>
              <dt className="text-on-surface-variant">Disbursed</dt>
              <dd className="text-on-surface">
                {fmtMoney(dis.disbursement?.amount)} · {fmtDateTime(dis.eventTime)}
              </dd>
            </>
          )}
        </dl>
        <div className="mx-6 mb-6 flex items-center gap-2 rounded-md bg-surface-container-low px-3 py-2.5 text-body-sm">
          <span className={tab === "decide" ? "font-semibold text-primary" : "text-on-surface"}>Decide</span>
          <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant" />
          <span className={tab === "disburse" ? "font-semibold text-primary" : tab === "done" ? "text-on-surface" : "text-on-surface-variant"}>Disburse</span>
          <ChevronRight aria-hidden className="size-3.5 text-on-surface-variant" />
          <span className="text-on-surface-variant">Repair</span>
        </div>
        {tab !== "done" && (
          <div className="flex gap-2 border-t border-outline-variant/70 p-4">
            {tab === "decide" ? (
              <>
                <Button variant="outlined" className="flex-1" onClick={() => onAction("reject")}>Reject with reason</Button>
                <Button className="flex-1" onClick={() => onAction("approve")}>Approve</Button>
              </>
            ) : (
              <Button className="flex-1" onClick={() => onAction("disburse")}>Record disbursement</Button>
            )}
          </div>
        )}
      </Card>
    );
  }
}

function ApproveDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (funder: string, note: string) => void }) {
  const [funder, setFunder] = useState(FUNDERS[0]);
  const [note, setNote] = useState("");
  return (
    <Dialog open={open} onClose={onClose} title="Approve funding">
      <form className="flex flex-col gap-4" onSubmit={(e) => (e.preventDefault(), onSubmit(funder, note))}>
        <SelectField label="Funder source" value={funder} onChange={(e) => setFunder(e.target.value)}>
          {FUNDERS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </SelectField>
        <TextArea label="Note" optional value={note} onChange={(e) => setNote(e.target.value)} />
        <p className="text-body-sm text-on-surface-variant">Approval does not move money. Record the disbursement when it happens.</p>
        <div className="flex justify-end gap-2">
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button type="submit">Approve</Button>
        </div>
      </form>
    </Dialog>
  );
}

function RejectDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return (
    <Dialog open={open} onClose={onClose} title="Reject estimate">
      <form className="flex flex-col gap-4" onSubmit={(e) => (e.preventDefault(), onSubmit(reason.trim()))}>
        <TextArea
          label="Reason"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          helper="The programme officer uses this to resubmit, escalate or abandon. The fault stays open."
        />
        <div className="flex justify-end gap-2">
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="danger" disabled={!reason.trim()}>Reject</Button>
        </div>
      </form>
    </Dialog>
  );
}

function DisburseDialog({ open, amount, onClose, onSubmit }: { open: boolean; amount: number; onClose: () => void; onSubmit: (amount: number, note: string) => void }) {
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const num = Number((value || String(amount)).replace(/[^\d]/g, ""));
  return (
    <Dialog open={open} onClose={onClose} title="Record disbursement">
      <form className="flex flex-col gap-4" onSubmit={(e) => (e.preventDefault(), onSubmit(num, note))}>
        <TextField label="Amount disbursed (₦)" inputMode="numeric" value={value || String(amount)} onChange={(e) => setValue(e.target.value)} helper={`Approved estimate: ${fmtMoney(amount)}`} />
        <TextArea label="Note" optional value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Paid to technician by transfer" />
        <p className="text-body-sm text-on-surface-variant">Flowkeep records that money moved. It does not make the payment.</p>
        <div className="flex justify-end gap-2">
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!num}>Record</Button>
        </div>
      </form>
    </Dialog>
  );
}
