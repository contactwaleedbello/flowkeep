"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Droplet, MapPin } from "lucide-react";
import {
  assignedPoints,
  awaitingConfirmation,
  custodianOf,
  faultById,
  fmtDateTime,
  label,
  userById,
  wpById,
} from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import type { Fault } from "@/lib/demo/types";
import { PhoneShell } from "@/components/app/chrome";
import { phoneSteps } from "@/components/app/fault-bits";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceList } from "@/components/ui/choice-list";
import { Banner, EmptyState, SyncTag } from "@/components/ui/feedback";
import { VerticalSteps } from "@/components/ui/lifecycle";
import { StatusPill } from "@/components/ui/status-pill";
import { TextArea } from "@/components/ui/text-field";

type FieldRole = "custodian" | "assist";

const base = (role: FieldRole) => (role === "assist" ? "/app/assist" : "/app/custodian");

/* ------------------------------ Home ------------------------------ */

export function FieldHome({ role }: { role: FieldRole }) {
  const { state } = useDemo();
  const me = userById(state, PERSONA[role])!;
  const points = assignedPoints(state, me.id, role === "assist" ? "assisting_user" : "custodian");
  const mine = state.faults
    .filter((f) => (role === "assist" ? f.assistedById === me.id : f.custodianId === me.id))
    .sort((a, b) => b.eventTime.localeCompare(a.eventTime));
  const toConfirm = role === "custodian" ? mine.filter(awaitingConfirmation) : [];

  return (
    <PhoneShell role={role} title={role === "assist" ? "Reports you made" : points.length === 1 ? "Your water point" : "Your water points"} sub={`${me.name} · ${role === "assist" ? "Assisting user" : "Custodian"}`}>
      {toConfirm.map((f) => (
        <Card key={f.id} className="flex flex-col gap-3 border-primary/40 p-4 ring-1 ring-primary/30">
          <p className="text-label-lg font-semibold text-primary">Your answer is needed</p>
          <p className="text-body-lg text-on-surface">
            The technician says the repair for <strong>{label(state.faultTypes, f.faultType).toLowerCase()}</strong> ({f.number}, reported {fmtDateTime(f.eventTime)}) at {wpById(state, f.waterPointId)?.externalId} is done. Is water flowing?
          </p>
          <ButtonLink href={`${base(role)}/faults/${f.id}`} size="lg" block>
            Answer now
          </ButtonLink>
        </Card>
      ))}

      <ButtonLink href={`${base(role)}/report`} size="lg" block variant={toConfirm.length ? "outlined" : "filled"}>
        Report a fault
      </ButtonLink>

      {role === "assist" ? (
        <p className="text-body-sm text-on-surface-variant">
          You report for custodians without a smartphone at {points.map((p) => p.externalId).join(", ")}. Only the custodian can confirm that water is flowing.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {points.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-md bg-surface-container-low px-3 py-2.5">
              <span className="flex size-9 items-center justify-center rounded-sm bg-surface-container-lowest text-primary ring-1 ring-outline-variant/60 dark:bg-surface-container-high">
                <Droplet aria-hidden className="size-4" />
              </span>
              <div className="min-w-0 text-body-sm">
                <p className="truncate font-semibold text-on-surface">{p.name}</p>
                <p className="flex items-center gap-1 text-on-surface-variant">
                  <MapPin aria-hidden className="size-3" /> {p.community}, {p.lga}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="pt-2 text-label-lg font-semibold text-on-surface-variant">Reports</h2>
      {mine.length === 0 ? (
        <Card>
          <EmptyState title="No reports yet" body="When something is wrong with the water point, tap Report a fault." />
        </Card>
      ) : (
        <ul className="flex flex-col gap-2">
          {mine.map((f) => (
            <li key={f.id}>
              <ReportCard fault={f} href={`${base(role)}/faults/${f.id}`} />
            </li>
          ))}
        </ul>
      )}
    </PhoneShell>
  );

  function ReportCard({ fault, href }: { fault: Fault; href: string }) {
    const pending = fault.events.some((e) => !e.syncedAt);
    return (
      <Link href={href} className="block">
        <Card className="flex flex-col gap-2 p-4 transition-shadow hover:shadow-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-body-md font-semibold text-on-surface">{label(state.faultTypes, fault.faultType)}</p>
              <p className="text-body-sm text-on-surface-variant">
                {wpById(state, fault.waterPointId)?.externalId} · {fmtDateTime(fault.eventTime)}
                {role === "assist" && ` · for ${userById(state, fault.custodianId)?.name}`}
              </p>
            </div>
            <ChevronRight aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusPill status={fault.status} size="sm" />
            <SyncTag synced={!pending} />
          </div>
        </Card>
      </Link>
    );
  }
}

/* ------------------------------ Report ------------------------------ */

export function ReportFlow({ role }: { role: FieldRole }) {
  const demo = useDemo();
  const { state } = demo;
  const router = useRouter();
  const me = userById(state, PERSONA[role])!;
  const points = assignedPoints(state, me.id, role === "assist" ? "assisting_user" : "custodian");
  const [wpId, setWpId] = useState(points.length === 1 ? points[0].id : "");
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const step = wpId ? 2 : 1;
  const custodian = wpId ? custodianOf(state, wpId) : undefined;

  return (
    <PhoneShell
      role={role}
      back={step === 2 && points.length > 1 ? undefined : base(role)}
      title={step === 1 ? "Which water point?" : "What is wrong?"}
      sub={`Report a fault · step ${step} of 2${wpId ? ` · ${wpById(state, wpId)?.externalId}` : ""}`}
    >
      {step === 1 ? (
        <ChoiceList
          legend="Water point"
          className="[&_legend]:sr-only"
          choices={points.map((p) => ({ value: p.id, label: p.name, description: `${p.community} · custodian ${custodianOf(state, p.id)?.name}` }))}
          onChange={setWpId}
        />
      ) : (
        <form
          className="flex flex-1 flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const f = demo.report({ waterPointId: wpId, faultType: type, note: note.trim() || undefined, actorId: me.id, custodianId: custodian!.id });
            router.push(`${base(role)}/faults/${f.id}`);
          }}
        >
          {role === "assist" && custodian && (
            <Banner tone="info" title={`Reporting for ${custodian.name}`}>
              The record will show both your name and the custodian&apos;s.
            </Banner>
          )}
          <ChoiceList legend="Fault type" className="[&_legend]:sr-only" choices={state.faultTypes.filter((o) => !o.archived)} value={type} onChange={setType} />
          <TextArea label="Anything else" optional value={note} onChange={(e) => setNote(e.target.value)} helper="Please don't include anyone's phone number." />
          <div className="mt-auto flex flex-col gap-2">
            <Button type="submit" size="lg" block disabled={!type}>
              Save report
            </Button>
            {points.length > 1 && (
              <Button variant="text" size="lg" block onClick={() => setWpId("")}>
                Choose a different water point
              </Button>
            )}
            <p className="text-center text-body-sm text-on-surface-variant">
              {state.online ? "Sends right away." : "You're offline. It's saved on this phone and syncs later."}
            </p>
          </div>
        </form>
      )}
    </PhoneShell>
  );
}

/* --------------------------- Fault detail --------------------------- */

export function FieldFaultDetail({ role, id }: { role: FieldRole; id: string }) {
  const demo = useDemo();
  const { state } = demo;
  const me = PERSONA[role];
  const f = faultById(state, id);
  const [saying, setSaying] = useState<null | "no">(null);
  const [note, setNote] = useState("");

  if (!f)
    return (
      <PhoneShell role={role} back={base(role)} title="Not found">
        <EmptyState title="This report isn't on this phone" />
      </PhoneShell>
    );

  const wp = wpById(state, f.waterPointId);
  const canConfirm = role === "custodian" && f.custodianId === me && awaitingConfirmation(f);
  const lastOutcome = [...f.events].reverse().find((e) => e.kind === "repair_outcome");

  return (
    <PhoneShell role={role} back={base(role)} title={label(state.faultTypes, f.faultType)} sub={`${f.number} · ${wp?.name}`}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill status={f.status} />
        <SyncTag synced={!f.events.some((e) => !e.syncedAt)} />
      </div>

      {canConfirm && (
        <Card className="flex flex-col gap-4 p-4">
          <p className="text-body-md text-on-surface-variant">
            {userById(state, lastOutcome?.actorId)?.name} marked the repair {lastOutcome?.outcome === "complete" ? "complete" : lastOutcome?.outcome} on {fmtDateTime(lastOutcome?.eventTime)}.
          </p>
          <p className="text-headline-sm font-semibold text-on-surface">Is water flowing at {wp?.externalId} now?</p>
          {saying === "no" ? (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                demo.confirm(f.id, me, false, note.trim() || undefined);
                setSaying(null);
              }}
            >
              <TextArea label="What did you see?" optional value={note} onChange={(e) => setNote(e.target.value)} />
              <Button type="submit" size="lg" block>
                Send: water is not flowing
              </Button>
              <Button variant="text" size="lg" block onClick={() => setSaying(null)}>
                Back
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Button size="lg" variant="success" block onClick={() => demo.confirm(f.id, me, true)}>
                Yes, water is flowing
              </Button>
              <Button size="lg" variant="outlined" block onClick={() => setSaying("no")}>
                No, water is not flowing
              </Button>
            </div>
          )}
          <p className="text-center text-body-sm text-on-surface-variant">This confirms water flow only, not that the water is safe to drink.</p>
        </Card>
      )}

      {role === "assist" && awaitingConfirmation(f) && (
        <Banner tone="info" title="Waiting for the custodian">
          Only {userById(state, f.custodianId)?.name} can confirm whether water is flowing.
        </Banner>
      )}

      <Card className="p-4">
        <VerticalSteps steps={phoneSteps(state, f)} />
      </Card>

      {f.note && (
        <p className="rounded-md bg-surface-container-low px-3 py-2.5 text-body-md text-on-surface">
          <span className="text-on-surface-variant">Your note: </span>
          {f.note}
        </p>
      )}
    </PhoneShell>
  );
}
