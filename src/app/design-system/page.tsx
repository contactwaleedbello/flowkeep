import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Droplet, Hammer, Wrench } from "lucide-react";
import type { ReactNode } from "react";
import { FAULT_STATUS, WAITING_ON_LABEL, type FaultStatus } from "@/lib/fault-status";
import { FAULT_TYPES, SAMPLE_TIMELINE } from "@/lib/sample-data";
import {
  ApprovalPanel,
  ConfirmFlowPhone,
  CustodianHomePhone,
  FaultRecord,
  OpenFaultsList,
  TechnicianJobCard,
} from "@/components/patterns/screens";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChoiceList } from "@/components/ui/choice-list";
import { Banner, EmptyState, SyncBar, SyncTag, Toast } from "@/components/ui/feedback";
import { LifecycleStepper, VerticalSteps } from "@/components/ui/lifecycle";
import { Logo } from "@/components/ui/logo";
import { Chip, CountBadge, StatusPill } from "@/components/ui/status-pill";
import { QueueTabs } from "@/components/ui/tabs";
import { SelectField, TextArea, TextField } from "@/components/ui/text-field";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Timeline } from "@/components/ui/timeline";

export const metadata: Metadata = {
  title: "Design system",
  description: "Flowkeep design system: tokens, components and screen patterns.",
};

const NAV = [
  ["foundations", "Foundations"],
  ["status", "Fault status"],
  ["components", "Components"],
  ["screens", "Screens"],
  ["app", "App shells"],
] as const;

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Flowkeep home">
            <Logo />
          </Link>
          <Chip tone="primary">Design system</Chip>
          <nav aria-label="Sections" className="ml-4 hidden gap-1 lg:flex">
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="state-layer rounded-full px-3 py-2 text-label-lg text-on-surface-variant">
                {label}
              </a>
            ))}
          </nav>
          <ThemeToggle className="ml-auto" />
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-20 px-4 py-12 sm:px-6">
        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="font-display text-display-sm font-semibold text-on-surface">Flowkeep design system</h1>
          <p className="text-body-lg text-on-surface-variant">
            Built on the Flowkeep colour system (palettes → Material 3 roles) and the PRD. Organised in three layers that match the
            Mobbin research: <strong className="text-on-surface">app</strong> (shells and navigation),{" "}
            <strong className="text-on-surface">screen</strong> (compositions for each role) and{" "}
            <strong className="text-on-surface">component</strong> (primitives). Components reference colour roles only, never palettes.
            Docs live in <code className="rounded-xs bg-surface-container px-1.5 py-0.5 text-body-md">design-system/</code>.
          </p>
        </div>

        <Foundations />
        <StatusSection />
        <Components />
        <Screens />
        <AppShells />
      </main>
    </div>
  );
}

function Block({ id, title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} className="flex scroll-mt-20 flex-col gap-6">
      <div className="flex max-w-3xl flex-col gap-2 border-b border-outline-variant pb-4">
        <h2 className="text-headline-md font-semibold text-on-surface">{title}</h2>
        {intro && <p className="text-body-lg text-on-surface-variant">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

function Sub({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div>
        <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
        {note && <p className="text-body-md text-on-surface-variant">{note}</p>}
      </div>
      {children}
    </div>
  );
}

/* --------------------------- Foundations --------------------------- */

const ROLE_GROUPS: Array<{ name: string; pairs: Array<[bg: string, fg: string, label: string]> }> = [
  {
    name: "Accent",
    pairs: [
      ["primary", "on-primary", "Primary · teal"],
      ["primary-container", "on-primary-container", "Primary container"],
      ["secondary", "on-secondary", "Secondary · amber"],
      ["secondary-container", "on-secondary-container", "Secondary container"],
      ["tertiary", "on-tertiary", "Tertiary · violet"],
      ["tertiary-container", "on-tertiary-container", "Tertiary container"],
    ],
  },
  {
    name: "Feedback",
    pairs: [
      ["success", "on-success", "Success · green"],
      ["success-container", "on-success-container", "Success container"],
      ["error", "on-error", "Error · red"],
      ["error-container", "on-error-container", "Error container"],
    ],
  },
  {
    name: "Surface",
    pairs: [
      ["surface", "on-surface", "Surface"],
      ["surface-container-lowest", "on-surface", "Container lowest"],
      ["surface-container-low", "on-surface", "Container low"],
      ["surface-container", "on-surface", "Container"],
      ["surface-container-high", "on-surface", "Container high"],
      ["surface-container-highest", "on-surface", "Container highest"],
      ["inverse-surface", "inverse-on-surface", "Inverse surface"],
    ],
  },
];

function Swatches() {
  return (
    <div className="flex flex-col gap-6">
      {ROLE_GROUPS.map((g) => (
        <div key={g.name} className="flex flex-col gap-2">
          <p className="text-label-lg font-semibold text-on-surface-variant">{g.name}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {g.pairs.map(([bg, fg, label]) => (
              <div
                key={bg}
                className="flex min-h-20 flex-col justify-between gap-2 rounded-md border border-outline-variant p-3"
                style={{ background: `var(--md-${bg})`, color: `var(--md-${fg})` }}
              >
                <span className="text-label-lg font-semibold">{label}</span>
                <span className="font-mono text-[10px] leading-tight break-all opacity-80">--md-{bg}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const TYPE = [
  ["text-display-sm font-display", "Display small · marketing headlines"],
  ["text-headline-md", "Headline medium · page titles"],
  ["text-headline-sm", "Headline small · phone screen titles"],
  ["text-title-lg", "Title large · record titles"],
  ["text-title-md", "Title medium · section and card titles"],
  ["text-body-lg", "Body large · phone body copy (16px minimum)"],
  ["text-body-md", "Body medium · desktop body and tables"],
  ["text-body-sm", "Body small · timestamps and helper text"],
  ["text-label-lg", "Label large · buttons and tabs"],
  ["text-label-md", "Label medium · status pills and chips"],
];

function Foundations() {
  return (
    <Block
      id="foundations"
      title="Foundations"
      intro="Colour roles from the supplied token file, shown in both themes. Every text pair passes WCAG AA (run npm run audit:contrast)."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <p className="mb-4 text-title-sm font-semibold text-on-surface">Light</p>
          <Swatches />
        </Card>
        <div className="dark rounded-lg border border-outline-variant bg-surface p-5 text-on-surface">
          <p className="mb-4 text-title-sm font-semibold">Dark</p>
          <Swatches />
        </div>
      </div>

      <Sub title="Type scale" note="Noto Sans for the product (covers Hausa ɓ ɗ ƙ ƴ). Noto Serif Display for marketing headlines only.">
        <Card className="divide-y divide-outline-variant">
          {TYPE.map(([cls, label]) => (
            <div key={label} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-baseline sm:gap-6">
              <span className="w-56 shrink-0 font-mono text-label-md text-on-surface-variant">{cls.split(" ")[0]}</span>
              <span className={`${cls} text-on-surface`}>{label}</span>
            </div>
          ))}
        </Card>
      </Sub>

      <div className="grid gap-6 md:grid-cols-2">
        <Sub title="Shape" note="Material 3 corner scale. Buttons and pills are fully rounded.">
          <div className="flex flex-wrap gap-3">
            {(
              [
                ["xs", "rounded-xs"],
                ["sm", "rounded-sm"],
                ["md", "rounded-md"],
                ["lg", "rounded-lg"],
                ["xl", "rounded-xl"],
                ["full", "rounded-full"],
              ] as const
            ).map(([r, cls]) => (
              <div key={r} className={`flex size-20 items-end bg-primary-container p-2 text-label-md text-on-primary-container ${cls}`}>
                {r}
              </div>
            ))}
          </div>
        </Sub>
        <Sub title="Elevation" note="Depth comes mostly from tonal surface containers. Shadows are reserved for floating elements.">
          <div className="flex flex-wrap gap-4">
            {["shadow-1", "shadow-2", "shadow-3"].map((s) => (
              <div key={s} className={`flex size-20 items-end rounded-md bg-surface-container-lowest p-2 text-label-md text-on-surface-variant ${s}`}>
                {s}
              </div>
            ))}
          </div>
        </Sub>
      </div>
    </Block>
  );
}

/* ----------------------------- Status ----------------------------- */

function StatusSection() {
  const all = Object.keys(FAULT_STATUS) as FaultStatus[];
  return (
    <Block
      id="status"
      title="Fault status"
      intro="The 11 states from PRD §11. Each has an icon and a label, so status is never shown by colour alone. Open states are tinted; closed states are solid. The 'waiting on' column groups the officer's list."
    >
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-body-md">
          <thead className="bg-surface-container-low text-label-lg text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Waiting on</th>
              <th className="px-4 py-3 font-semibold">Meaning</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {all.map((s) => (
              <tr key={s}>
                <td className="px-4 py-3">
                  <StatusPill status={s} />
                </td>
                <td className="px-4 py-3 text-on-surface">{WAITING_ON_LABEL[FAULT_STATUS[s].waitingOn]}</td>
                <td className="px-4 py-3 text-on-surface-variant">{FAULT_STATUS[s].description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Sub title="Lifecycle stepper" note="Record header. A fault that returned to reported shows a loop-back note instead of resetting.">
        <Card className="p-4">
          <LifecycleStepper current="decision" reopened={1} />
        </Card>
      </Sub>
    </Block>
  );
}

/* ---------------------------- Components ---------------------------- */

function Components() {
  return (
    <Block id="components" title="Components" intro="Primitives. Field screens use the lg size (48px) so every touch target meets the minimum.">
      <Sub title="Buttons">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Filled</Button>
            <Button variant="tonal">Tonal</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="text">Text</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small 32</Button>
            <Button size="md">Medium 40</Button>
            <Button size="lg" trailingIcon={<ArrowRight aria-hidden className="size-5" />}>
              Large 48 · field
            </Button>
          </div>
        </Card>
      </Sub>

      <div className="grid gap-6 md:grid-cols-2">
        <Sub title="Chips and counts">
          <Card className="flex flex-wrap items-center gap-2 p-5">
            <Chip>Custodian</Chip>
            <Chip tone="primary">Technician</Chip>
            <Chip tone="tertiary">Approver</Chip>
            <Chip tone="attention">Needs reason</Chip>
            <CountBadge count={4} />
            <SyncTag synced={false} />
          </Card>
        </Sub>
        <Sub title="Queue tabs" note="Approver queue: decide, then disburse.">
          <Card className="p-5">
            <QueueTabs
              tabs={[
                { value: "decide", label: "To decide", count: 2 },
                { value: "disburse", label: "To disburse", count: 1 },
                { value: "done", label: "Disbursed", count: 7 },
              ]}
            />
          </Card>
        </Sub>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Sub title="Text fields" note="Label above the field, always visible. Helper and error text below.">
          <Card className="flex flex-col gap-4 p-5">
            <TextField label="Estimated cost" placeholder="0" inputMode="numeric" helper="Naira. Numbers only." />
            <SelectField label="Diagnosis category" defaultValue="">
              <option value="" disabled>
                Choose a category
              </option>
              <option>Rising main</option>
              <option>Pump head</option>
              <option>Solar controller</option>
            </SelectField>
            <TextArea label="Reason for rejection" error="A reason is required when funding is rejected." />
          </Card>
        </Sub>
        <Sub title="Choice list" note="Phone pickers. All options visible, no dropdown.">
          <Card className="p-5">
            <ChoiceList legend="What is wrong?" choices={FAULT_TYPES.slice(0, 4)} defaultValue="no_water" />
          </Card>
        </Sub>
      </div>

      <Sub title="Sync and feedback" note="Offline states never block the screen (PRD §9).">
        <Card className="flex flex-col gap-0 overflow-hidden">
          <SyncBar state="offline" pending={2} />
          <SyncBar state="pending" pending={3} showSyncButton />
          <SyncBar state="syncing" />
          <SyncBar state="synced" />
          <SyncBar state="stale" oldestDays={11} />
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Toast title="Saved on this phone" meta="Syncing when online" />
            <Banner tone="attention" title="Funding rejected" icon={Wrench}>
              Resubmit a new estimate, escalate, or abandon the fault with a reason.
            </Banner>
            <Banner tone="success" title="Water is flowing" icon={Droplet}>
              Confirmed by the custodian. This does not confirm the water is safe to drink.
            </Banner>
          </div>
          <Card>
            <EmptyState
              icon={Hammer}
              title="No faults recorded for this water point"
              body="When a custodian reports a fault, it will appear here with its full history."
              action={<Button variant="tonal" size="sm">Report a fault</Button>}
            />
          </Card>
        </div>
      </Sub>

      <div className="grid gap-6 md:grid-cols-2">
        <Sub title="Timeline" note="Name (role) action, old → new status, and both timestamps.">
          <Card className="p-5">
            <Timeline events={SAMPLE_TIMELINE.slice(2)} />
          </Card>
        </Sub>
        <Sub title="Vertical steps" note="Phone record view. The current step expands and says who acts next.">
          <Card className="p-5">
            <VerticalSteps
              steps={[
                { title: "Reported", meta: "4 Nov, 07:12 · Amina Yusuf", state: "done" },
                { title: "Estimate submitted", meta: "6 Nov, 15:30 · Sani Danjuma", state: "done" },
                {
                  title: "Waiting for funding decision",
                  meta: "With Halima Bello (approver) · 2 days",
                  state: "current",
                  body: "The approver can approve or reject. A rejection keeps the fault open.",
                },
                { title: "Disbursement", state: "upcoming" },
                { title: "Repair", state: "upcoming" },
                { title: "Water flowing", state: "upcoming" },
              ]}
            />
          </Card>
        </Sub>
      </div>
    </Block>
  );
}

/* ------------------------------ Screens ------------------------------ */

function Screens() {
  return (
    <Block id="screens" title="Screens" intro="Compositions for each role, built only from the components above. Sample data.">
      <Sub title="Programme officer · open faults" note="Grouped by who acts next, not by the 11 statuses.">
        <OpenFaultsList />
      </Sub>
      <Sub title="Fault record" note="Stepper, timeline and a named timestamps panel (PRD §7 feature 5, §13 signals).">
        <FaultRecord />
      </Sub>
      <div className="grid gap-6 lg:grid-cols-2">
        <Sub title="Approver · estimate decision">
          <ApprovalPanel />
        </Sub>
        <Sub title="Technician · job card">
          <TechnicianJobCard />
        </Sub>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Sub title="Custodian · home">
          <CustodianHomePhone />
        </Sub>
        <Sub title="Custodian · restoration confirmation">
          <ConfirmFlowPhone />
        </Sub>
      </div>
    </Block>
  );
}

/* ------------------------------ App shells ------------------------------ */

function AppShells() {
  return (
    <Block
      id="app"
      title="App shells"
      intro="Two shells, one codebase. Desktop for officers, approvers and admins; phone for custodians and technicians. The first screen for every role is its own work queue."
    >
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="overflow-hidden">
          <div className="grid min-h-72 grid-cols-[180px_1fr]">
            <aside className="flex flex-col gap-1 border-r border-outline-variant bg-surface-container-low p-3 text-label-lg">
              <div className="mb-3 px-2">
                <Logo />
              </div>
              {[
                ["Open faults", 6, true],
                ["Water points", 10, false],
                ["Estimates", 2, false],
                ["Exports", undefined, false],
                ["Admin", undefined, false],
              ].map(([l, c, on]) => (
                <span
                  key={l as string}
                  className={`flex items-center justify-between rounded-full px-3 py-2 ${on ? "bg-primary-container font-semibold text-on-primary-container" : "text-on-surface-variant"}`}
                >
                  {l}
                  {c !== undefined && <CountBadge count={c as number} />}
                </span>
              ))}
            </aside>
            <div className="flex flex-col">
              <SyncBar state="synced" />
              <div className="p-5">
                <p className="text-headline-sm font-semibold text-on-surface">Open faults</p>
                <p className="text-body-md text-on-surface-variant">Desktop shell: navigation rail with counts, sync bar, work queue first.</p>
              </div>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col overflow-hidden">
          <SyncBar state="pending" pending={1} />
          <div className="flex-1 p-5">
            <p className="text-headline-sm font-semibold text-on-surface">My faults</p>
            <p className="text-body-md text-on-surface-variant">Phone shell: sync bar on top, one primary action, three-item bottom bar.</p>
          </div>
          <nav className="grid grid-cols-3 border-t border-outline-variant bg-surface-container text-center text-label-md">
            {["My faults", "Report", "Synced"].map((t, i) => (
              <span key={t} className={`py-3 ${i === 0 ? "font-semibold text-primary" : "text-on-surface-variant"}`}>
                {t}
              </span>
            ))}
          </nav>
        </Card>
      </div>
    </Block>
  );
}
