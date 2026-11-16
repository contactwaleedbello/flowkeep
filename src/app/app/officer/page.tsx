"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { GroupedFaults } from "@/components/app/fault-bits";
import { Button } from "@/components/ui/button";
import { isOpen, label, wpById } from "@/lib/demo/logic";
import { downloadCsv, faultsCsv } from "@/lib/demo/csv";
import { useDemo } from "@/lib/demo/store";

export default function OfficerHome() {
  const { state } = useDemo();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<"all" | "Adamawa" | "Kaduna">("all");

  const open = useMemo(() => {
    const term = q.trim().toLowerCase();
    return state.faults.filter(isOpen).filter((f) => {
      const wp = wpById(state, f.waterPointId);
      if (region !== "all" && wp?.state !== region) return false;
      if (!term) return true;
      return [f.number, wp?.name, wp?.community, label(state.faultTypes, f.faultType)].some((v) => v?.toLowerCase().includes(term));
    });
  }, [state, q, region]);

  const needsMe = open.filter((f) => f.status === "funding_rejected").length;

  return (
    <DesktopShell role="officer">
      <PageHeader
        title="Open faults"
        sub={
          <>
            {open.length} open across {state.waterPoints.filter((w) => !w.archived).length} water points
            {needsMe > 0 && <span className="font-medium text-on-secondary-container"> · {needsMe} need you</span>}
          </>
        }
        actions={
          <Button variant="outlined" leadingIcon={<Download aria-hidden className="size-4" />} onClick={() => downloadCsv("flowkeep-open-faults.csv", faultsCsv(state, open))}>
            Export CSV
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="relative min-w-60 flex-1 sm:max-w-sm">
          <span className="sr-only">Search faults</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search water point, community, fault…"
            className="h-10 w-full rounded-full border border-outline-variant bg-surface-container-lowest pr-4 pl-9 text-body-md text-on-surface shadow-1 outline-none placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
          />
        </label>
        <div role="group" aria-label="State" className="inline-flex gap-1 rounded-full bg-surface-container p-1">
          {(["all", "Adamawa", "Kaduna"] as const).map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={region === r}
              onClick={() => setRegion(r)}
              className={`h-8 rounded-full px-3.5 text-label-lg ${region === r ? "bg-surface-container-lowest font-medium text-on-surface shadow-1 dark:bg-surface-container-high" : "text-on-surface-variant"}`}
            >
              {r === "all" ? "All states" : r}
            </button>
          ))}
        </div>
      </div>
      <GroupedFaults state={state} faults={open} hrefFor={(f) => `/app/faults/${f.id}`} />
    </DesktopShell>
  );
}
