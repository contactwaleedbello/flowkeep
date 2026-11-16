"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { completeness, confirmationRate, median, stageMedians } from "@/lib/demo/analytics";
import { downloadCsv, faultsCsv, waterPointsCsv } from "@/lib/demo/csv";
import { fmtMoney } from "@/lib/demo/logic";
import { daysToRestore, disbursed, monthlySums } from "@/lib/demo/officer";
import { useDemo } from "@/lib/demo/store";
import { ColumnBars, HBars, Meter, StatStrip, fmtDays } from "@/components/app/admin-ui";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { FilterBar } from "@/components/app/officer-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PERIODS = [
  { key: "30", label: "30 days", days: 30 },
  { key: "90", label: "90 days", days: 90 },
  { key: "all", label: "Pilot to date", days: Infinity },
] as const;

/**
 * The officer's §13 signals for their portfolio, with each export next to what it exports
 * (Better Stack). Every figure is a signal with its n, never a target (PRD §13).
 */
export default function Reports() {
  const { state, now } = useDemo();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]["key"]>("90");
  const [filters, setFilters] = useState<Record<string, string>>({});

  const days = PERIODS.find((p) => p.key === period)!.days;
  const points = state.waterPoints.filter((w) => !w.archived && (!filters.state || w.state === filters.state) && (!filters.lga || w.lga === filters.lga));
  const ids = new Set(points.map((w) => w.id));
  const faults = state.faults.filter((f) => !f.mergedInto && ids.has(f.waterPointId) && now - new Date(f.eventTime).getTime() <= days * 86_400_000);
  const scoped = { ...state, faults, waterPoints: points };

  const restored = faults.map(daysToRestore).filter((d): d is number => d !== undefined);
  const spent = faults.reduce((a, f) => a + disbursed(f), 0);
  const conf = confirmationRate(scoped);
  const comp = completeness(scoped);
  const withFault = points.filter((w) => faults.some((f) => f.waterPointId === w.id)).length;
  const months = monthlySums(
    faults.flatMap((f) => f.events.filter((e) => e.kind === "disbursed").map((e) => ({ at: e.eventTime, value: e.disbursement?.amount ?? 0 }))),
    now,
  );

  const uniq = (xs: string[]) => Array.from(new Set(xs)).sort();
  const all = state.waterPoints.filter((w) => !w.archived);
  const fields = [
    { key: "state", label: "State", options: uniq(all.map((w) => w.state)).map((v) => ({ value: v, label: v })) },
    { key: "lga", label: "LGA", options: uniq(all.filter((w) => !filters.state || w.state === filters.state).map((w) => w.lga)).map((v) => ({ value: v, label: v })) },
  ];
  const where = [filters.lga, filters.state].filter(Boolean).join(", ") || "all states";
  const periodLabel = PERIODS.find((p) => p.key === period)!.label.toLowerCase();

  return (
    <DesktopShell role="officer">
      <PageHeader title="Reports" sub="Signals from your water points. At pilot size, read every number as a signal, not a statistic." />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Period" className="inline-flex gap-1 rounded-md bg-surface-container p-1">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              aria-pressed={period === p.key}
              onClick={() => setPeriod(p.key)}
              className={cn(
                "h-7 rounded-sm px-3 text-label-lg whitespace-nowrap",
                period === p.key ? "bg-surface-container-lowest font-medium text-on-surface shadow-1 dark:bg-surface-container-high" : "text-on-surface-variant",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <FilterBar fields={fields} value={filters} onChange={setFilters} />
      </div>

      <StatStrip
        className="mb-6 grid-cols-2! sm:grid-cols-4!"
        items={[
          { key: "reported", label: "Faults reported", value: faults.length, hint: `${periodLabel}, ${where}` },
          { key: "restored", label: "Restored", value: restored.length, hint: "confirmed by the custodian" },
          { key: "restore", label: "Days to restore", value: restored.length ? fmtDays(median(restored)!) : "—", hint: restored.length ? `median, n = ${restored.length}` : "none restored yet" },
          { key: "spent", label: "Disbursed", value: fmtMoney(spent), hint: "money that moved" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="p-5">
          <h2 className="text-title-md font-semibold text-on-surface">Time between steps</h2>
          <p className="mb-5 text-body-sm text-on-surface-variant">Median days, from named timestamps. n is how many faults reached both steps.</p>
          <HBars rows={stageMedians(scoped).map((s) => ({ label: s.label, value: s.days, n: s.n }))} unit="days" caption={`Median days between lifecycle steps, ${periodLabel}, ${where}`} />
        </Card>
        <Card className="flex flex-col gap-5 p-5">
          <div>
            <p className="mb-2 text-label-lg font-medium text-on-surface">Custodian confirmation</p>
            <Meter x={conf.x} n={conf.n} label="Reported repairs the custodian answered" />
            <p className="mt-1.5 text-body-sm text-on-surface-variant">Repairs the custodian answered. A low rate is a serious finding (§14).</p>
          </div>
          <div>
            <p className="mb-2 text-label-lg font-medium text-on-surface">Water points with a fault</p>
            <Meter x={withFault} n={points.length} label="Water points with at least one fault" />
          </div>
          <div>
            <p className="mb-2 text-label-lg font-medium text-on-surface">Complete records</p>
            <Meter x={comp.x} n={comp.n} label="Fault records with every required field" />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-title-md font-semibold text-on-surface">Disbursed per month</h2>
          <p className="mb-5 text-body-sm text-on-surface-variant">Naira that moved for faults in this view, last 6 months.</p>
          <ColumnBars bars={months.map((m) => ({ label: m.label, value: m.value }))} caption="Naira disbursed per month, last 6 months" height={120} />
        </Card>
        <Card className="flex flex-col gap-3 p-5">
          <h2 className="text-title-md font-semibold text-on-surface">Export</h2>
          <p className="text-body-sm text-on-surface-variant">CSV for your reports. It is built in your browser; nothing is uploaded.</p>
          <Button
            variant="outlined"
            leadingIcon={<Download aria-hidden className="size-4" />}
            disabled={!faults.length}
            onClick={() => downloadCsv(`flowkeep-faults-${period}.csv`, faultsCsv(state, faults))}
          >
            These {faults.length} faults
          </Button>
          <Button
            variant="outlined"
            leadingIcon={<Download aria-hidden className="size-4" />}
            onClick={() => downloadCsv("flowkeep-water-points.csv", waterPointsCsv({ ...state, waterPoints: points }))}
          >
            {points.length} water points
          </Button>
          <p className="text-body-sm text-on-surface-variant">Phone numbers are never exported.</p>
        </Card>
      </div>
    </DesktopShell>
  );
}
