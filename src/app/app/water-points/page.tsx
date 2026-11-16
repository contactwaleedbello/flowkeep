"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { custodianOf, fmtDate, isOpen } from "@/lib/demo/logic";
import { useDemo } from "@/lib/demo/store";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";

export default function WaterPoints() {
  const { state } = useDemo();
  const points = state.waterPoints.filter((w) => !w.archived);
  return (
    <DesktopShell role="officer">
      <PageHeader title="Water points" sub={`${points.length} water points in your portfolio`} />
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-body-md">
          <thead className="border-b border-outline-variant/70 text-label-md text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Water point</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Custodian</th>
              <th className="px-4 py-3 font-medium">Now</th>
              <th className="px-4 py-3 font-medium">Faults</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/70">
            {points.map((w) => {
              const faults = state.faults.filter((f) => f.waterPointId === w.id);
              const open = faults.find(isOpen);
              const last = faults.sort((a, b) => b.eventTime.localeCompare(a.eventTime))[0];
              return (
                <tr key={w.id} className="group relative transition-colors hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-mono text-body-sm text-on-surface-variant">{w.externalId}</td>
                  <td className="px-4 py-3">
                    <Link href={`/app/water-points/${w.id}`} className="font-semibold text-on-surface after:absolute after:inset-0">
                      {w.name}
                    </Link>
                    <span className="block text-body-sm text-on-surface-variant">{w.kind}</span>
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {w.community}, {w.lga}
                    <span className="block text-body-sm">{w.state}</span>
                  </td>
                  <td className="px-4 py-3 text-on-surface">{custodianOf(state, w.id)?.name}</td>
                  <td className="px-4 py-3">
                    {open ? <StatusPill status={open.status} size="sm" /> : <span className="text-body-sm text-on-surface-variant">No open fault</span>}
                  </td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {faults.length ? `${faults.length} · last ${fmtDate(last.eventTime)}` : "None recorded"}
                  </td>
                  <td className="pr-4">
                    <ChevronRight aria-hidden className="size-4 text-on-surface-variant" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </DesktopShell>
  );
}
