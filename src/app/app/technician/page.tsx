"use client";

import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";
import { ago, enteredStatusAt, isOpen, label, needsRevision, wpById } from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import type { Fault } from "@/lib/demo/types";
import { PhoneShell } from "@/components/app/chrome";
import { Card } from "@/components/ui/card";
import { EmptyState, SyncTag } from "@/components/ui/feedback";
import { CountBadge, StatusPill } from "@/components/ui/status-pill";

export default function TechnicianHome() {
  const { state, now } = useDemo();
  const me = PERSONA.technician;
  const mine = state.faults.filter((f) => f.technicianId === me && isOpen(f));

  const groups: Array<{ title: string; hint: string; items: Fault[] }> = [
    { title: "Needs diagnosis", hint: "Visit, then record what is broken and the cost.", items: mine.filter((f) => f.status === "reported" || needsRevision(f)) },
    { title: "Ready to repair", hint: "Money is disbursed. Record the outcome.", items: mine.filter((f) => f.status === "funding_disbursed" || f.status === "awaiting_parts") },
    {
      title: "Waiting on others",
      hint: "Nothing to do until the approver or custodian acts.",
      items: mine.filter((f) => ["estimate_submitted", "funding_approved", "repair_reported_complete", "partially_repaired", "repair_failed"].includes(f.status) || (f.status === "funding_rejected" && !needsRevision(f))),
    },
  ];

  return (
    <PhoneShell role="technician" title="My faults" sub="Sani Danjuma · Technician">
      {mine.length === 0 && (
        <Card>
          <EmptyState title="No faults assigned to you" body="New reports at your water points appear here." />
        </Card>
      )}
      {groups.map(
        (g) =>
          g.items.length > 0 && (
            <section key={g.title} className="flex flex-col gap-2">
              <div>
                <h2 className="flex items-center gap-2 text-label-lg font-semibold text-on-surface">
                  {g.title} <CountBadge count={g.items.length} />
                </h2>
                <p className="text-body-sm text-on-surface-variant">{g.hint}</p>
              </div>
              <ul className="flex flex-col gap-2">
                {g.items.map((f) => {
                  const wp = wpById(state, f.waterPointId);
                  return (
                    <li key={f.id}>
                      <Link href={`/app/technician/faults/${f.id}`} className="block">
                        <Card className="flex flex-col gap-2 p-4 transition-shadow hover:shadow-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-body-md font-semibold text-on-surface">{wp?.name}</p>
                              <p className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                                <MapPin aria-hidden className="size-3" /> {wp?.community} · {label(state.faultTypes, f.faultType)}
                              </p>
                            </div>
                            <ChevronRight aria-hidden className="size-4 shrink-0 text-on-surface-variant" />
                          </div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <StatusPill status={f.status} size="sm" />
                            <span className="flex items-center gap-3 text-body-sm text-on-surface-variant">
                              <SyncTag synced={!f.events.some((e) => !e.syncedAt)} />
                              {ago(enteredStatusAt(f), now)}
                            </span>
                          </div>
                        </Card>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ),
      )}
    </PhoneShell>
  );
}
