"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, Download, Eye, EyeOff, Monitor, Moon, Plus, Sun, Trash2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { downloadCsv, faultsCsv, peopleCsv, waterPointsCsv } from "@/lib/demo/csv";
import { PERSONA, useDemo } from "@/lib/demo/store";
import type { Option } from "@/lib/demo/types";
import { setPref, usePrefs, type ThemePref } from "@/lib/preferences";
import { ROLE_INFO } from "@/components/app/admin-dialogs";
import { DesktopShell, Dialog, PageHeader } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  { key: "profile", label: "Profile", scope: "You" },
  { key: "appearance", label: "Appearance", scope: "You" },
  { key: "organisation", label: "Organisation", scope: "Organisation" },
  { key: "lists", label: "Fault lists", scope: "Organisation" },
  { key: "rules", label: "Field rules", scope: "Organisation" },
  { key: "data", label: "Data and privacy", scope: "Organisation" },
] as const;
type Section = (typeof SECTIONS)[number]["key"];

export function SettingsView() {
  const router = useRouter();
  const params = useSearchParams();
  const section = (SECTIONS.find((s) => s.key === params.get("section"))?.key ?? "profile") as Section;
  const go = (k: Section) => router.replace(k === "profile" ? "/app/admin/settings" : `/app/admin/settings?section=${k}`, { scroll: false });

  return (
    <DesktopShell role="admin">
      <PageHeader title="Settings" sub="Changes save as you make them. Organisation changes are recorded in Activity." />
      <div className="grid gap-8 lg:grid-cols-[200px_minmax(0,1fr)]">
        {/* section nav: vertical on desktop, chips on small screens */}
        <nav aria-label="Settings sections" className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {SECTIONS.map((s, i) => (
              <li key={s.key} className="shrink-0">
                {(i === 0 || SECTIONS[i - 1].scope !== s.scope) && (
                  <p className={cn("hidden px-2.5 pb-1 font-mono text-[11px] tracking-wide text-on-surface-variant uppercase lg:block", i > 0 && "pt-4")}>{s.scope}</p>
                )}
                <button
                  type="button"
                  onClick={() => go(s.key)}
                  aria-current={section === s.key ? "page" : undefined}
                  className={cn(
                    "flex h-8 w-full items-center rounded-md px-2.5 text-left text-label-lg whitespace-nowrap transition-colors",
                    section === s.key ? "bg-surface-container-high font-medium text-on-surface" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                  )}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex max-w-3xl min-w-0 flex-col gap-10">
          {section === "profile" && <ProfileSection />}
          {section === "appearance" && <AppearanceSection />}
          {section === "organisation" && <OrganisationSection />}
          {section === "lists" && <ListsSection />}
          {section === "rules" && <RulesSection />}
          {section === "data" && <DataSection />}
        </div>
      </div>
    </DesktopShell>
  );
}

/* ------------------------------------------------------------------ */
/* Building blocks (Linear pattern: label left, control right)          */
/* ------------------------------------------------------------------ */

function Block({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-title-md font-semibold text-on-surface">{title}</h2>
        {description && <p className="mt-0.5 text-body-md text-on-surface-variant">{description}</p>}
      </div>
      <div className="divide-y divide-outline-variant/60 overflow-hidden rounded-lg border border-outline-variant/80 bg-surface-container-lowest dark:bg-surface-container-low">{children}</div>
    </section>
  );
}

function Row({ label, description, children, stack = false }: { label: ReactNode; description?: ReactNode; children?: ReactNode; stack?: boolean }) {
  return (
    <div className={cn("flex gap-x-6 gap-y-3 px-5 py-4", stack ? "flex-col" : "flex-col sm:flex-row sm:items-center sm:justify-between")}>
      <div className="min-w-0">
        <p className="text-label-lg font-medium text-on-surface">{label}</p>
        {description && <p className="mt-0.5 text-body-sm text-on-surface-variant">{description}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

/** Text that saves on blur or Enter. */
function InlineText({ value, onSave, label, width = "w-64" }: { value: string; onSave: (v: string) => void; label: string; width?: string }) {
  const [v, setV] = useState(value);
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setV(value);
  }
  const commit = () => {
    const t = v.trim();
    if (t && t !== value) onSave(t);
    else setV(value);
  };
  return (
    <input
      aria-label={label}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setV(value);
      }}
      className={cn(
        "h-9 max-w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-body-md text-on-surface shadow-1 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container",
        width,
      )}
    />
  );
}

/** Number with unit, clamped, saves on blur or Enter. */
function InlineNumber({ value, min, max, unit, label, onSave }: { value: number; min: number; max: number; unit: string; label: string; onSave: (n: number) => void }) {
  const [v, setV] = useState(String(value));
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setV(String(value));
  }
  const commit = () => {
    const n = Math.min(max, Math.max(min, Math.round(Number(v) || value)));
    setV(String(n));
    if (n !== value) onSave(n);
  };
  return (
    <span className="inline-flex items-center gap-2">
      <input
        aria-label={label}
        inputMode="numeric"
        value={v}
        onChange={(e) => setV(e.target.value.replace(/[^\d]/g, ""))}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="h-9 w-20 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-right font-mono text-body-md text-on-surface shadow-1 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container"
      />
      <span className="text-body-sm text-on-surface-variant">
        {unit} <span className="font-mono text-[11px]">({min}–{max})</span>
      </span>
    </span>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-10 rounded-full transition-colors", checked ? "bg-primary" : "bg-outline-variant")}
    >
      <span className={cn("absolute top-0.5 left-0.5 size-5 rounded-full bg-surface-container-lowest shadow-1 transition-transform", checked && "translate-x-4")} />
    </button>
  );
}

function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: Array<{ value: T; label: ReactNode }>; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex gap-1 rounded-md bg-surface-container p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-7 rounded-sm px-3 text-label-lg whitespace-nowrap",
            value === o.value ? "bg-surface-container-lowest font-medium text-on-surface shadow-1 dark:bg-surface-container-high" : "text-on-surface-variant",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Fixed({ children }: { children: ReactNode }) {
  return <span className="font-mono text-[12px] text-on-surface-variant">{children}</span>;
}

/* ------------------------------------------------------------------ */
/* Profile                                                              */
/* ------------------------------------------------------------------ */

function ProfileSection() {
  const { state, renameUser } = useDemo();
  const me = state.users.find((u) => u.id === PERSONA.admin)!;
  return (
    <Block title="Profile" description="How you appear in the record. Every change you make is signed with this name.">
      <Row label="Full name">
        <InlineText label="Full name" value={me.name} onSave={(v) => renameUser(me.id, v)} />
      </Row>
      <Row label="Role" description={ROLE_INFO[me.role].help}>
        <Fixed>{ROLE_INFO[me.role].label}</Fixed>
      </Row>
      <Row label="Phone" description="Admins don't need a phone number in Flowkeep.">
        <Fixed>{me.phone ?? "Not stored"}</Fixed>
      </Row>
    </Block>
  );
}

/* ------------------------------------------------------------------ */
/* Appearance                                                           */
/* ------------------------------------------------------------------ */

function AppearanceSection() {
  const prefs = usePrefs();
  const themes: Array<{ value: ThemePref; label: string; icon: LucideIcon }> = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];
  return (
    <>
      <Block title="Theme" description="Saved on this device. The quick switch in the demo dock still works.">
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3">
          {themes.map(({ value, label, icon: Icon }) => {
            const on = prefs.theme === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setPref("theme", value)}
                className={cn(
                  "flex flex-col gap-2.5 rounded-lg border p-2.5 text-left transition-[border-color,box-shadow]",
                  on ? "border-primary ring-1 ring-primary" : "border-outline-variant hover:border-outline",
                )}
              >
                <ThemePreview kind={value} />
                <span className="flex items-center gap-2 px-1 text-label-lg text-on-surface">
                  <Icon aria-hidden className="size-4 text-on-surface-variant" />
                  <span className="flex-1">{label}</span>
                  {on && <Check aria-hidden className="size-4 text-primary" />}
                </span>
              </button>
            );
          })}
        </div>
      </Block>
      <Block title="Reading" description="For long days in the field office and older screens.">
        <Row label="Text size" description="Scales every screen of the app on this device.">
          <Segmented
            label="Text size"
            value={prefs.text}
            onChange={(v) => setPref("text", v)}
            options={[
              { value: "default", label: <span className="text-[13px]">Aa Default</span> },
              { value: "large", label: <span className="text-[15px]">Aa Larger</span> },
            ]}
          />
        </Row>
        <Row label="Motion" description="Turns off slides and fades. Your system setting is always respected too.">
          <Segmented
            label="Motion"
            value={prefs.motion}
            onChange={(v) => setPref("motion", v)}
            options={[
              { value: "system", label: "Follow system" },
              { value: "reduce", label: "Reduce" },
            ]}
          />
        </Row>
      </Block>
    </>
  );
}

function Mini({ scope }: { scope: "light" | "dark" }) {
  return (
    <div className={cn(scope, "flex h-full w-full bg-surface")}>
      <div className="flex w-1/4 flex-col gap-1 border-r border-outline-variant bg-surface-container-low p-1.5">
        <span className="h-1.5 w-3/4 rounded-full bg-on-surface/70" />
        <span className="h-1.5 w-full rounded-full bg-surface-container-highest" />
        <span className="h-1.5 w-2/3 rounded-full bg-surface-container-highest" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <span className="h-2 w-1/2 rounded-full bg-on-surface/80" />
        <div className="flex flex-col gap-1 rounded-sm border border-outline-variant bg-surface-container-lowest p-1.5">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-secondary" />
            <span className="h-1.5 w-2/3 rounded-full bg-surface-container-highest" />
          </span>
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="h-1.5 w-1/2 rounded-full bg-surface-container-highest" />
          </span>
        </div>
        <span className="mt-auto h-2.5 w-1/3 self-end rounded-sm bg-primary" />
      </div>
    </div>
  );
}

/** Miniature of the app in each theme. Uses the real role tokens via .light / .dark scopes. */
function ThemePreview({ kind }: { kind: ThemePref }) {
  return (
    <div aria-hidden className="relative aspect-[16/10] overflow-hidden rounded-md ring-1 ring-outline-variant/70">
      {kind === "system" ? (
        <>
          <div className="absolute inset-0">
            <Mini scope="light" />
          </div>
          <div className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">
            <Mini scope="dark" />
          </div>
        </>
      ) : (
        <Mini scope={kind} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Organisation                                                         */
/* ------------------------------------------------------------------ */

const LANGUAGES = ["English", "Hausa", "Fulfulde", "Kanuri", "Bura", "Yoruba", "Igbo", "Nigerian Pidgin"];

function OrganisationSection() {
  const { state, setOrgName, updateSettings } = useDemo();
  const langs = state.settings.languages;
  return (
    <>
      <Block title="Organisation" description="Shown in the app header and on exports.">
        <Row label="Name">
          <InlineText label="Organisation name" value={state.organisation.name} onSave={setOrgName} width="w-72" />
        </Row>
        <Row label="Time zone" description="All times in Flowkeep are shown in this zone, on every device.">
          <Fixed>West Africa Time · Africa/Lagos</Fixed>
        </Row>
        <Row label="Currency" description="Estimates and disbursements. Confirm with the partner (PRD question 5).">
          <Fixed>Nigerian naira · ₦</Fixed>
        </Row>
      </Block>
      <Block title="Languages" description="The languages your custodians and technicians read. This guides which translations we build first (PRD question 6). The app is in English for now.">
        <div className="flex flex-wrap gap-1.5 p-4">
          {LANGUAGES.map((l) => {
            const on = langs.includes(l);
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                onClick={() => updateSettings({ languages: on ? langs.filter((x) => x !== l) : [...langs, l] }, "Languages")}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-label-lg transition-colors",
                  on ? "border-on-surface bg-on-surface text-surface" : "border-outline-variant text-on-surface-variant hover:text-on-surface",
                )}
              >
                {on && <Check aria-hidden className="size-3.5" />}
                {l}
              </button>
            );
          })}
        </div>
      </Block>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Fault lists (PRD §14 risk 1: lists are configurable, not hard-coded)  */
/* ------------------------------------------------------------------ */

function ListsSection() {
  const { state } = useDemo();
  const typeUse = (v: string) => state.faults.filter((f) => f.faultType === v).length;
  const catUse = (v: string) => state.faults.reduce((n, f) => n + f.events.filter((e) => e.kind === "diagnosed" && e.diagnosis?.category === v).length, 0);
  return (
    <>
      <OptionsEditor
        list="faultTypes"
        title="Fault types"
        singular="fault type"
        description="What custodians choose from when they report. Keep it short and in plain words; the first item shows first."
        usage={typeUse}
        usedLabel="reports"
      />
      <OptionsEditor
        list="diagnosisCategories"
        title="Diagnosis categories"
        singular="diagnosis category"
        description="What technicians choose from when they diagnose. These power fault analysis later, so avoid near-duplicates."
        usage={catUse}
        usedLabel="diagnoses"
      />
    </>
  );
}

function OptionsEditor({ list, title, singular, description, usage, usedLabel }: { list: "faultTypes" | "diagnosisCategories"; title: string; singular: string; description: string; usage: (v: string) => number; usedLabel: string }) {
  const { state, setOptions } = useDemo();
  const options = state[list];
  const [draft, setDraft] = useState("");

  const save = (next: Option[], change: string) => setOptions(list, next, change);
  const move = (i: number, d: -1 | 1) => {
    const next = [...options];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    save(next, `${title}: moved "${options[i].label}" ${d < 0 ? "up" : "down"}`);
  };
  const add = () => {
    const label = draft.trim();
    if (!label) return;
    if (options.some((o) => o.label.toLowerCase() === label.toLowerCase())) return;
    const value = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || `option_${options.length + 1}`;
    save([...options, { value: options.some((o) => o.value === value) ? `${value}_${options.length}` : value, label }], `${title}: added "${label}"`);
    setDraft("");
  };

  return (
    <Block title={title} description={description}>
      <ul>
        {options.map((o, i) => {
          const used = usage(o.value);
          return (
            <li key={o.value} className={cn("group flex items-center gap-2 border-b border-outline-variant/60 px-3 py-2", o.archived && "bg-surface-container-low/60")}>
              <span className="flex flex-col">
                <button type="button" aria-label={`Move ${o.label} up`} disabled={i === 0} onClick={() => move(i, -1)} className="flex size-5 items-center justify-center rounded-xs text-on-surface-variant hover:text-on-surface disabled:opacity-25">
                  <ArrowUp aria-hidden className="size-3.5" />
                </button>
                <button type="button" aria-label={`Move ${o.label} down`} disabled={i === options.length - 1} onClick={() => move(i, 1)} className="flex size-5 items-center justify-center rounded-xs text-on-surface-variant hover:text-on-surface disabled:opacity-25">
                  <ArrowDown aria-hidden className="size-3.5" />
                </button>
              </span>
              <OptionLabel
                value={o.label}
                muted={o.archived}
                onSave={(label) => save(options.map((x) => (x.value === o.value ? { ...x, label } : x)), `${title}: renamed "${o.label}" to "${label}"`)}
              />
              <span className="hidden font-mono text-[11px] whitespace-nowrap text-on-surface-variant sm:inline">
                {used} {usedLabel}
              </span>
              {o.archived ? (
                <button type="button" onClick={() => save(options.map((x) => (x.value === o.value ? { ...x, archived: false } : x)), `${title}: showed "${o.label}" again`)} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
                  <Eye aria-hidden className="size-3.5" /> Show
                </button>
              ) : used > 0 ? (
                <button type="button" title="Used in records, so it can be hidden but not deleted" onClick={() => save(options.map((x) => (x.value === o.value ? { ...x, archived: true } : x)), `${title}: hid "${o.label}"`)} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface">
                  <EyeOff aria-hidden className="size-3.5" /> Hide
                </button>
              ) : (
                <button type="button" aria-label={`Delete ${o.label}`} onClick={() => save(options.filter((x) => x.value !== o.value), `${title}: deleted "${o.label}"`)} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-label-md text-on-surface-variant hover:bg-error-container hover:text-on-error-container">
                  <Trash2 aria-hidden className="size-3.5" /> Delete
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <form
        className="flex items-center gap-2 px-3 py-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <Plus aria-hidden className="ml-1 size-4 text-on-surface-variant" />
        <input
          aria-label={`New ${singular}`}
          placeholder={`Add a ${singular}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-8 flex-1 rounded-md bg-transparent px-2 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/70 focus:bg-surface-container-low"
        />
        <Button type="submit" size="sm" variant="outlined" disabled={!draft.trim()}>
          Add
        </Button>
      </form>
      <p className="bg-surface-container-low/60 px-5 py-2.5 text-body-sm text-on-surface-variant">Items used in records can be hidden, not deleted, so old faults still read correctly.</p>
    </Block>
  );
}

function OptionLabel({ value, muted, onSave }: { value: string; muted?: boolean; onSave: (v: string) => void }) {
  const [v, setV] = useState(value);
  const [prev, setPrev] = useState(value);
  if (value !== prev) {
    setPrev(value);
    setV(value);
  }
  return (
    <input
      aria-label="Label"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => (v.trim() && v.trim() !== value ? onSave(v.trim()) : setV(value))}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setV(value);
      }}
      className={cn(
        "h-8 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-body-md outline-none hover:border-outline-variant focus:border-primary focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 dark:focus:bg-surface-container",
        muted ? "text-on-surface-variant line-through decoration-outline" : "text-on-surface",
      )}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Field rules                                                          */
/* ------------------------------------------------------------------ */

function RulesSection() {
  const { state, updateSettings } = useDemo();
  const s = state.settings;
  return (
    <>
      <Block title="Offline and sync" description="How phones behave with patchy data (PRD §9).">
        <Row label="Warn about unsynced entries after" description="The sync bar turns red so the person connects in time.">
          <InlineNumber label="Warn after days" value={s.syncWarnDays} min={1} max={13} unit="days" onSave={(n) => updateSettings({ syncWarnDays: n }, "Sync warning threshold")} />
        </Row>
        <Row label="Unsynced entries expire after" description="Fixed by the PRD. Older entries must be re-entered.">
          <Fixed>14 days</Fixed>
        </Row>
      </Block>
      <Block title="Records" description="Rules that keep the record clean.">
        <Row label="Flag possible duplicates within" description="Two open faults at the same water point inside this window show up on Overview.">
          <InlineNumber label="Duplicate window hours" value={s.duplicateWindowHours} min={12} max={168} unit="hours" onSave={(n) => updateSettings({ duplicateWindowHours: n }, "Duplicate window")} />
        </Row>
        <Row label="Require a reason to reject funding" description="Gives the programme officer something to act on. The PRD makes it optional.">
          <Toggle label="Require a reason to reject funding" checked={s.requireRejectReason} onChange={(v) => updateSettings({ requireRejectReason: v }, "Rejection reason rule")} />
        </Row>
        <Row label="A fault can skip a step" description="Never. Every step is recorded by the person who did it (PRD §11).">
          <Fixed>Off · fixed</Fixed>
        </Row>
      </Block>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Data and privacy                                                     */
/* ------------------------------------------------------------------ */

function DataSection() {
  const demo = useDemo();
  const { state, updateSettings } = demo;
  const [resetOpen, setResetOpen] = useState(false);
  const exports = [
    { label: "Fault records", description: "Every fault with its timestamps, decisions and outcomes.", file: "flowkeep-faults.csv", csv: () => faultsCsv(state, state.faults.filter((f) => !f.mergedInto)) },
    { label: "Water points", description: "IDs, locations, sensor points and who is assigned.", file: "flowkeep-water-points.csv", csv: () => waterPointsCsv(state) },
    { label: "People", description: "Names, roles and water points. Phone numbers are never exported.", file: "flowkeep-people.csv", csv: () => peopleCsv(state) },
  ];
  return (
    <>
      <Block title="Phone numbers" description="Custodian numbers are personal data. Check the current Nigerian data protection rules before the pilot (PRD §16).">
        <Row label="Who can see a custodian's number" description="Assigned technicians and assisting users, programme officers for their water points, and admins. Every view is logged.">
          <Link href="/app/admin/activity?filter=phone" className="text-label-lg font-medium text-primary">
            View log
          </Link>
        </Row>
        <Row label="Default consent purpose" description="Pre-filled when you record consent.">
          <InlineText label="Default consent purpose" value={state.settings.defaultConsentPurpose} onSave={(v) => updateSettings({ defaultConsentPurpose: v }, "Default consent purpose")} />
        </Row>
      </Block>
      <Block title="Export" description="Your records are yours. Export any time, and at handover if the pilot ends (PRD §14 risk 7).">
        {exports.map((e) => (
          <Row key={e.label} label={e.label} description={e.description}>
            <Button size="sm" variant="outlined" leadingIcon={<Download aria-hidden className="size-3.5" />} onClick={() => downloadCsv(e.file, e.csv())}>
              Export CSV
            </Button>
          </Row>
        ))}
      </Block>
      <section className="flex flex-col gap-3">
        <h2 className="text-title-md font-semibold text-error">Danger zone</h2>
        <div className="rounded-lg border border-error/40">
          <Row label="Reset demo data" description="Restores the sample organisation in this browser. Real Flowkeep never deletes records.">
            <Button size="sm" variant="danger" onClick={() => setResetOpen(true)}>
              Reset
            </Button>
          </Row>
        </div>
      </section>
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)} title="Reset demo data?">
        <p className="text-body-md text-on-surface-variant">Everything you changed in this browser goes back to the sample data.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="text" onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => (demo.reset(), setResetOpen(false))}>Reset</Button>
        </div>
      </Dialog>
    </>
  );
}
