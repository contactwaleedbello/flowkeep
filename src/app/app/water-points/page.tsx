"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadCsv, waterPointsCsv } from "@/lib/demo/csv";
import { custodianOf, daysSince, fmtDate, fmtMoney } from "@/lib/demo/logic";
import { waterPointSummary } from "@/lib/demo/officer";
import { useDemo } from "@/lib/demo/store";
import { StatStrip } from "@/components/app/admin-ui";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { StatusPill } from "@/components/ui/status-pill";

type Key = "all" | "open" | "none" | "restored";

export default function WaterPoints() {
  const { state, now } = useDemo();
  const [filter, setFilter] = useState<Key>("all");
  const rows = state.waterPoints
    .filter((w) => !w.archived)
    .map((w) => ({ w, sum: waterPointSummary(state, w.id) }))
    // longest without water first, then the rest by ID
    .sort((a, b) => {
      const da = a.sum.open ? daysSince(a.sum.open.eventTime, now) : -1;
      const db = b.sum.open ? daysSince(b.sum.open.eventTime, now) : -1;
      return db - da || a.w.externalId.localeCompare(b.w.externalId);
    });
  const is = {
    open: (r: (typeof rows)[number]) => !!r.sum.open,
    none: (r: (typeof rows)[number]) => r.sum.faults.length === 0,
    restored: (r: (typeof rows)[number]) => r.sum.restoredN > 0,
  };
  const shown = filter === "all" ? rows : rows.filter(is[filter]);
  const spent = rows.reduce((a, r) => a + r.sum.spent, 0);

  return (
    <DesktopShell role="officer">
      <PageHeader
        title="Water points"
        sub={`${rows.length} water points in your portfolio`}
        actions={
          <Button variant="outlined" leadingIcon={<Download aria-hidden className="size-4" />} onClick={() => downloadCsv("flowkeep-water-points.csv", waterPointsCsv(state))}>
            Export CSV
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_240px]">
        <StatStrip
          active={filter}
          onSelect={(k) => setFilter((cur) => (cur === k && k !== "all" ? "all" : (k as Key)))}
          className="grid-cols-2! sm:grid-cols-4!"
          items={[
            { key: "all", label: "All", value: rows.length },
            { key: "open", label: "With an open fault", value: rows.filter(is.open).length, attention: rows.some(is.open) },
            { key: "restored", label: "Restored at least once", value: rows.filter(is.restored).length },
            { key: "none", label: "No faults recorded", value: rows.filter(is.none).length },
          ]}
        />
        <Card className="flex flex-col justify-center gap-1 p-4">
          <p className="text-label-md text-on-surface-variant">Disbursed to date</p>
          <p className="font-display text-headline-sm font-semibold text-on-surface num">{fmtMoney(spent)}</p>
          <p className="text-body-sm text-on-surface-variant">Money that moved, across every fault</p>
        </Card>
      </div>

      {shown.length === 0 ? (
        <Card>
          <EmptyState title="No water points here" body="Choose another figure above." />
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-body-md">
            <thead className="border-b border-outline-variant/70 font-mono text-[11px] tracking-wide text-on-surface-variant uppercase">
              <tr>
                <th className="px-4 py-2.5 font-normal">ID</th>
                <th className="px-4 py-2.5 font-normal">Water point</th>
                <th className="px-4 py-2.5 font-normal">Custodian</th>
                <th className="px-4 py-2.5 font-normal">Now</th>
                <th className="px-4 py-2.5 text-right font-normal">Days without water</th>
                <th className="px-4 py-2.5 text-right font-normal">Spent</th>
                <th className="px-4 py-2.5 font-normal">Faults</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {shown.map(({ w, sum }) => {
                const days = sum.open ? daysSince(sum.open.eventTime, now) : undefined;
                const last = [...sum.faults].sort((a, b) => b.eventTime.localeCompare(a.eventTime))[0];
                return (
                  <tr key={w.id} className="group relative transition-colors hover:bg-surface-container-low">
                    <td className="px-4 py-3 font-mono text-body-sm text-on-surface-variant">{w.externalId}</td>
                    <td className="px-4 py-3">
                      <Link href={`/app/water-points/${w.id}`} className="font-medium text-on-surface after:absolute after:inset-0">
                        {w.name}
                      </Link>
                      <span className="block text-body-sm text-on-surface-variant">
                        {w.community}, {w.lga} · {w.state}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface">{custodianOf(state, w.id)?.name ?? <span className="text-on-surface-variant">Not assigned</span>}</td>
                    <td className="px-4 py-3">{sum.open ? <StatusPill status={sum.open.status} size="sm" /> : <span className="text-body-sm text-on-surface-variant">Working</span>}</td>
                    <td className={cn("px-4 py-3 text-right num", days !== undefined && days >= 7 ? "font-medium text-on-secondary-container" : "text-on-surface")}>
                      {days === undefined ? <span className="text-on-surface-variant">—</span> : days}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface num">{sum.spent ? fmtMoney(sum.spent) : <span className="text-on-surface-variant">—</span>}</td>
                    <td className="px-4 py-3 text-body-sm text-on-surface-variant">{sum.faults.length ? `${sum.faults.length} · last ${fmtDate(last.eventTime)}` : "None recorded"}</td>
                    <td className="pr-4">
                      <ChevronRight aria-hidden className="size-4 text-on-surface-variant" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </DesktopShell>
  );
}
