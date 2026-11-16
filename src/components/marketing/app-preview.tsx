import { CircleCheck, Droplet, FileSpreadsheet, Inbox, Settings, Users } from "lucide-react";
import { OpenFaultsList } from "@/components/patterns/screens";
import { LogoMark } from "@/components/ui/logo";
import { VerticalSteps } from "@/components/ui/lifecycle";
import { CountBadge, StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/cn";

/**
 * Hero product window: the programme officer's desktop app, built from design-system parts.
 * Sample data. Sidebar shows from md, record panel from lg.
 */
export function AppWindowPreview({ className }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="Flowkeep desktop app showing open faults grouped by who acts next, with one fault record open"
      className={cn(
        "overflow-hidden rounded-xl bg-surface-container-lowest text-left shadow-3 ring-1 ring-outline-variant/70 dark:bg-surface-container-low",
        className,
      )}
    >
      {/* window chrome */}
      <div className="flex h-10 items-center gap-2 border-b border-outline-variant/70 px-4">
        <span className="size-2.5 rounded-full bg-outline-variant" />
        <span className="size-2.5 rounded-full bg-outline-variant" />
        <span className="size-2.5 rounded-full bg-outline-variant" />
        <span className="mx-auto text-label-md text-on-surface-variant">Flowkeep · Open faults</span>
        <span className="w-12" />
      </div>

      <div className="grid md:grid-cols-[200px_1fr] lg:grid-cols-[200px_1fr_290px]" inert>
        {/* sidebar */}
        <aside className="hidden flex-col gap-0.5 border-r border-outline-variant/70 bg-surface-container-low/60 p-3 md:flex">
          <div className="mb-3 flex items-center gap-2 px-2 pt-1">
            <LogoMark className="size-6" />
            <span className="text-label-lg font-semibold text-on-surface">Flowkeep</span>
          </div>
          {[
            { icon: Inbox, label: "Open faults", count: 6, active: true },
            { icon: Droplet, label: "Water points", count: 10 },
            { icon: Users, label: "People" },
            { icon: FileSpreadsheet, label: "Exports" },
            { icon: Settings, label: "Admin" },
          ].map(({ icon: Icon, label, count, active }) => (
            <span
              key={label}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-label-lg",
                active ? "bg-surface-container-lowest font-medium text-on-surface shadow-1" : "text-on-surface-variant",
              )}
            >
              <Icon aria-hidden className="size-4" />
              <span className="flex-1 whitespace-nowrap">{label}</span>
              {count !== undefined && <CountBadge count={count} />}
            </span>
          ))}
          <span className="mt-auto flex items-center gap-1.5 px-2 pt-6 text-label-md text-on-surface-variant">
            <CircleCheck aria-hidden className="size-3.5 text-success" /> All records synced
          </span>
        </aside>

        {/* list */}
        <OpenFaultsList bare selectedId="F-029" className="min-w-0" />

        {/* record */}
        <aside className="hidden flex-col gap-4 border-l border-outline-variant/70 p-5 lg:flex">
          <div className="flex flex-col gap-2">
            <p className="text-body-sm text-on-surface-variant">F-029 · Unguwan Dutse</p>
            <p className="text-title-md font-semibold text-on-surface">WP-02 Solar borehole</p>
            <StatusPill status="repair_reported_complete" size="sm" className="w-fit" />
          </div>
          <VerticalSteps
            steps={[
              { title: "Reported", meta: "4 Nov · Amina Yusuf", state: "done" },
              { title: "Estimate ₦184,000", meta: "6 Nov · Sani Danjuma", state: "done" },
              { title: "Approved", meta: "8 Nov · Halima Bello", state: "done" },
              { title: "Disbursed", meta: "11 Nov · Halima Bello", state: "done" },
              { title: "Repair complete", meta: "13 Nov · not synced yet", state: "done" },
              { title: "Water flowing?", meta: "Waiting on custodian", state: "current" },
            ]}
          />
        </aside>
      </div>
    </div>
  );
}
