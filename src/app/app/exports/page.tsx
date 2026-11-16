"use client";

import { Download } from "lucide-react";
import { isOpen, wpById } from "@/lib/demo/logic";
import { downloadCsv, faultsCsv } from "@/lib/demo/csv";
import { useDemo } from "@/lib/demo/store";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Exports() {
  const { state } = useDemo();
  const sets = [
    { key: "all", title: "All fault records", body: "Every fault, open and closed, with the §13 timestamps.", faults: state.faults },
    { key: "open", title: "Open faults", body: "Faults still waiting on someone.", faults: state.faults.filter(isOpen) },
    { key: "adamawa", title: "Adamawa only", body: "Water points in Adamawa State.", faults: state.faults.filter((f) => wpById(state, f.waterPointId)?.state === "Adamawa") },
    { key: "kaduna", title: "Kaduna only", body: "Water points in Kaduna State.", faults: state.faults.filter((f) => wpById(state, f.waterPointId)?.state === "Kaduna") },
  ];
  return (
    <DesktopShell role="officer">
      <PageHeader title="Exports" sub="Your organisation's records, as CSV. Exporting is free and always available." />
      <div className="grid gap-4 sm:grid-cols-2">
        {sets.map((s) => (
          <Card key={s.key} className="flex flex-col gap-4 p-5">
            <div>
              <h2 className="text-title-md font-semibold text-on-surface">{s.title}</h2>
              <p className="text-body-md text-on-surface-variant">{s.body}</p>
            </div>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-body-sm text-on-surface-variant">{s.faults.length} rows</span>
              <Button variant="outlined" size="sm" leadingIcon={<Download aria-hidden className="size-4" />} onClick={() => downloadCsv(`flowkeep-${s.key}.csv`, faultsCsv(state, s.faults))}>
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-6 text-body-sm text-on-surface-variant">Demo: files are built in your browser from the sample data.</p>
    </DesktopShell>
  );
}
