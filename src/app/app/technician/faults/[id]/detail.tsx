"use client";

import { use, useState } from "react";
import { Phone } from "lucide-react";
import { currentEstimate, faultById, fmtMoney, label, latestOf, needsRevision, userById, wpById } from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import { PhoneShell } from "@/components/app/chrome";
import { phoneSteps } from "@/components/app/fault-bits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceList } from "@/components/ui/choice-list";
import { Banner, EmptyState } from "@/components/ui/feedback";
import { VerticalSteps } from "@/components/ui/lifecycle";
import { StatusPill } from "@/components/ui/status-pill";
import { SelectField, TextArea, TextField } from "@/components/ui/text-field";

export function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const demo = useDemo();
  const { state } = demo;
  const me = PERSONA.technician;
  const f = faultById(state, id);

  const [category, setCategory] = useState("");
  const [parts, setParts] = useState("");
  const [amount, setAmount] = useState("");
  const [outcome, setOutcome] = useState("");
  const [note, setNote] = useState("");
  const [called, setCalled] = useState(false);

  if (!f)
    return (
      <PhoneShell role="technician" back="/app/technician" title="Not found">
        <EmptyState title="This fault isn't on this phone" />
      </PhoneShell>
    );

  const wp = wpById(state, f.waterPointId);
  const custodian = userById(state, f.custodianId);
  const canDiagnose = f.status === "reported" || needsRevision(f);
  const canRecordOutcome = f.status === "funding_disbursed" || f.status === "awaiting_parts";
  const est = currentEstimate(f);
  const amountNum = Number(amount.replace(/[^\d]/g, ""));

  return (
    <PhoneShell role="technician" back="/app/technician" title={wp?.name ?? ""} sub={`${f.number} · ${label(state.faultTypes, f.faultType)}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <StatusPill status={f.status} />
        {custodian?.phone && custodian.phoneConsentAt && (
          <a
            href={`tel:${custodian.phone.replace(/\s/g, "")}`}
            onClick={() => {
              if (!called) demo.revealPhone(me, custodian.id, f.waterPointId);
              setCalled(true);
            }}
            className="state-layer inline-flex h-9 items-center gap-1.5 rounded-full border border-outline-variant px-3 text-label-lg text-on-surface"
          >
            <Phone aria-hidden className="size-4" /> Call {custodian.name.split(" ")[0]}
          </a>
        )}
      </div>

      {f.note && <p className="rounded-md bg-surface-container-low px-3 py-2.5 text-body-md text-on-surface">“{f.note}”</p>}

      {needsRevision(f) && (
        <Banner tone="attention" title="Revised estimate requested">
          {latestOf(f, "revision_requested")?.note}
        </Banner>
      )}

      {canDiagnose && (
        <Card className="p-4">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              demo.diagnose(f.id, me, { category, parts: parts.trim(), amount: amountNum });
            }}
          >
            <h2 className="text-title-md font-semibold text-on-surface">Diagnosis and estimate</h2>
            <SelectField label="What is broken?" required value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="" disabled>Choose a category</option>
              {state.diagnosisCategories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </SelectField>
            <TextArea label="Parts needed" required value={parts} onChange={(e) => setParts(e.target.value)} placeholder="e.g. 2 × 3 m riser pipe, couplings" />
            <TextField label="Estimated cost (₦)" required inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} helper={est ? `Previous estimate: ${fmtMoney(est.diagnosis?.amount)}. It stays on the record.` : undefined} />
            <Button type="submit" size="lg" block disabled={!category || !parts.trim() || !amountNum}>
              Submit estimate
            </Button>
          </form>
        </Card>
      )}

      {canRecordOutcome && (
        <Card className="p-4">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (outcome === "parts") demo.awaitParts(f.id, me, note.trim() || undefined);
              else demo.repairOutcome(f.id, me, outcome as "complete" | "partial" | "failed", note.trim() || undefined);
              setOutcome("");
              setNote("");
            }}
          >
            <ChoiceList
              legend="How did the repair go?"
              value={outcome}
              onChange={setOutcome}
              choices={[
                { value: "complete", label: "Complete", description: "The custodian will be asked to confirm water flow." },
                { value: "partial", label: "Partly done", description: "Some work remains." },
                { value: "failed", label: "Failed", description: "The repair did not work." },
                ...(f.status === "funding_disbursed" ? [{ value: "parts", label: "Parts not available", description: "Pause until parts arrive." }] : []),
              ]}
            />
            <TextArea label="Note" optional value={note} onChange={(e) => setNote(e.target.value)} />
            <Button type="submit" size="lg" block disabled={!outcome}>
              Save
            </Button>
            {f.status === "awaiting_parts" && (
              <p className="text-body-sm text-on-surface-variant">Assumption: when parts arrive, record the outcome directly. The PRD does not yet define this step.</p>
            )}
          </form>
        </Card>
      )}

      {!canDiagnose && !canRecordOutcome && (
        <Banner tone="info" title="Nothing for you to do right now">
          {f.status === "estimate_submitted" && "Waiting for the approver to decide on your estimate."}
          {f.status === "funding_approved" && "Approved. Waiting for the money to be disbursed."}
          {f.status === "funding_rejected" && "Estimate rejected. Waiting for the programme officer."}
          {["repair_reported_complete", "partially_repaired", "repair_failed"].includes(f.status) && "Waiting for the custodian to confirm whether water is flowing."}
        </Banner>
      )}

      <Card className="p-4">
        <VerticalSteps steps={phoneSteps(state, f)} />
      </Card>
    </PhoneShell>
  );
}
