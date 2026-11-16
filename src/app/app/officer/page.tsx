"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, CloudUpload, Download, Megaphone, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { WAITING_ON_LABEL, WAITING_ON_ORDER, type WaitingOn } from "@/lib/fault-status";
import { weeklyCounts } from "@/lib/demo/analytics";
import { downloadCsv, faultsCsv } from "@/lib/demo/csv";
import { currentEstimate, enteredStatusAt, fmtDate, fmtMoney, isOpen, label, latestOf, needsRevision, usersWithRole, userById, waitingOn as statusWaitingOn, wpById } from "@/lib/demo/logic";
import { closedAt, daysToRestore, disbursed, isClosed, pace, rememberQueue, stepStays } from "@/lib/demo/officer";
import { useDemo } from "@/lib/demo/store";
import type { DemoState, Fault } from "@/lib/demo/types";
import { ColumnBars, StatStrip, fmtDays } from "@/components/app/admin-ui";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { Menu, OFFICER, OfficerActionDialog, FilterBar, type MenuItem, type OfficerAction } from "@/components/app/officer-ui";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { StatusDot, StatusPill } from "@/components/ui/status-pill";

type StripKey = "all" | "needs" | "slow" | "custodian";

/** Who acts next. A rejected fault with a revision requested is back with the technician. */
const waitingOn = (f: Fault) => (needsRevision(f) ? "technician" : statusWaitingOn(f));

export default function OfficerHome() {
  const { state, now, trackOfficerListOpen, revealPhone } = useDemo();

  // PRD §14 risk 2: record that the list was opened (shown to the admin as a usage signal).
  const tracked = useRef(false);
  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackOfficerListOpen();
  }, [trackOfficerListOpen]);

  const [tab, setTab] = useState<"open" | "closed">("open");
  const [strip, setStrip] = useState<StripKey>("all");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [act, setAct] = useState<{ fault: Fault; action: OfficerAction } | null>(null);

  const stays = useMemo(() => stepStays(state), [state]);
  const live = state.faults.filter((f) => !f.mergedInto);

  // search and filters apply to both tabs
  const matches = (f: Fault) => {
    const wp = wpById(state, f.waterPointId);
    if (filters.state && wp?.state !== filters.state) return false;
    if (filters.lga && wp?.lga !== filters.lga) return false;
    if (filters.type && f.faultType !== filters.type) return false;
    if (filters.tech && f.technicianId !== filters.tech) return false;
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return [f.number, wp?.name, wp?.community, wp?.externalId, label(state.faultTypes, f.faultType)].some((v) => v?.toLowerCase().includes(term));
  };

  const openAll = live.filter(isOpen).filter(matches);
  const counts = {
    all: openAll.length,
    needs: openAll.filter((f) => waitingOn(f) === "officer").length,
    slow: openAll.filter((f) => pace(stays, f, now).slow).length,
    custodian: openAll.filter((f) => waitingOn(f) === "custodian").length,
  };
  const shown = openAll.filter((f) =>
    strip === "needs" ? waitingOn(f) === "officer" : strip === "slow" ? pace(stays, f, now).slow : strip === "custodian" ? waitingOn(f) === "custodian" : true,
  );
  const needsYou = shown.filter((f) => waitingOn(f) === "officer");
  const groups = WAITING_ON_ORDER.filter((g) => g !== "officer" && g !== "closed")
    .map((g) => ({ g, rows: shown.filter((f) => waitingOn(f) === g).sort((a, b) => enteredStatusAt(a).localeCompare(enteredStatusAt(b))) }))
    .filter((x) => x.rows.length);

  const closed = live
    .filter(isClosed)
    .filter(matches)
    .sort((a, b) => (closedAt(b) ?? "").localeCompare(closedAt(a) ?? ""));

  // the record offers "3 of 7" over exactly what is listed here
  const order = tab === "open" ? [...needsYou, ...groups.flatMap((x) => x.rows)].map((f) => f.id) : closed.map((f) => f.id);
  const orderKey = order.join(",");
  useEffect(() => rememberQueue(orderKey ? orderKey.split(",") : []), [orderKey]);

  const restoredWeekly = weeklyCounts(
    live.filter((f) => f.status === "service_verified").map((f) => closedAt(f)!),
    now,
  ).map((b) => ({ label: new Date(b.start).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }), value: b.count }));

  const points = state.waterPoints.filter((w) => !w.archived);
  const uniq = (xs: string[]) => Array.from(new Set(xs)).sort();
  const fields = [
    { key: "state", label: "State", options: uniq(points.map((w) => w.state)).map((v) => ({ value: v, label: v })) },
    { key: "lga", label: "LGA", options: uniq(points.filter((w) => !filters.state || w.state === filters.state).map((w) => w.lga)).map((v) => ({ value: v, label: v })) },
    { key: "type", label: "Fault type", options: state.faultTypes.map((o) => ({ value: o.value, label: o.label })) },
    { key: "tech", label: "Technician", options: usersWithRole(state, "technician").map((u) => ({ value: u.id, label: u.name })) },
  ];

  const rowMenu = (f: Fault): MenuItem[] => {
    const custodian = userById(state, f.custodianId);
    const items: MenuItem[] = [
      { label: "Reassign technician", onSelect: () => setAct({ fault: f, action: "reassign-technician" }) },
      { label: "Reassign custodian", onSelect: () => setAct({ fault: f, action: "reassign-custodian" }) },
    ];
    if (custodian?.phone && custodian.phoneConsentAt)
      items.push({
        label: "Show custodian phone",
        hint: "The view is logged",
        onSelect: () => {
          revealPhone(OFFICER, custodian.id, f.waterPointId);
        },
      });
    items.push({ label: "Abandon…", onSelect: () => setAct({ fault: f, action: "abandon" }), danger: true });
    return items;
  };

  return (
    <DesktopShell role="officer">
      <PageHeader
        title={tab === "open" ? "Open faults" : "Closed faults"}
        sub={
          tab === "open"
            ? `${counts.all} open across ${points.length} water points`
            : `${closed.length} closed: restored by the custodian, or abandoned with a reason`
        }
        actions={
          <Button
            variant="outlined"
            leadingIcon={<Download aria-hidden className="size-4" />}
            onClick={() => downloadCsv(`flowkeep-${tab}-faults.csv`, faultsCsv(state, tab === "open" ? shown : closed))}
          >
            Export CSV
          </Button>
        }
      />

      {tab === "open" && (
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_300px]">
          <StatStrip
            active={strip}
            onSelect={(k) => setStrip((cur) => (cur === k && k !== "all" ? "all" : (k as StripKey)))}
            className="grid-cols-2! sm:grid-cols-4!"
            items={[
              { key: "all", label: "Open", value: counts.all },
              { key: "needs", label: "Needs you", value: counts.needs, attention: counts.needs > 0 },
              { key: "slow", label: "Slower than usual", value: counts.slow, attention: counts.slow > 0, hint: "vs usual time per step" },
              { key: "custodian", label: "Waiting on custodian", value: counts.custodian },
            ]}
          />
          <Card className="flex flex-col gap-2 p-4">
            <p className="text-label-md text-on-surface-variant">Restored per week</p>
            <ColumnBars bars={restoredWeekly} caption="Faults the custodian confirmed restored, per week, last 8 weeks" height={36} />
          </Card>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div role="tablist" aria-label="Open or closed" className="inline-flex gap-1 rounded-md bg-surface-container p-1">
          {(["open", "closed"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "h-7 rounded-sm px-3 text-label-lg capitalize",
                tab === t ? "bg-surface-container-lowest font-medium text-on-surface shadow-1 dark:bg-surface-container-high" : "text-on-surface-variant",
              )}
            >
              {t} <span className="num text-[12px] text-on-surface-variant">{t === "open" ? openAll.length : closed.length}</span>
            </button>
          ))}
        </div>
        <label className="relative min-w-0 flex-1 basis-56 sm:max-w-xs">
          <span className="sr-only">Search faults</span>
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search water point, community, fault…"
            className="h-8 w-full rounded-md border border-outline-variant bg-surface-container-lowest pr-3 pl-8 text-body-md text-on-surface outline-none placeholder:text-on-surface-variant/60 focus:border-primary focus:ring-4 focus:ring-primary/10 dark:bg-surface-container-low"
          />
        </label>
        <FilterBar fields={fields} value={filters} onChange={setFilters} />
      </div>

      {tab === "open" ? (
        shown.length === 0 ? (
          <Card>
            <EmptyState
              title={strip === "all" && !q && !Object.values(filters).some(Boolean) ? "No open faults" : "Nothing matches"}
              body={strip === "all" ? "When a custodian reports a fault, it appears here, grouped by who has to act next." : "Try another figure above, or clear the filters."}
            />
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {needsYou.length > 0 && <NeedsYou faults={needsYou} onAct={(fault, action) => setAct({ fault, action })} />}
            {groups.length > 0 && (
              <Card className="overflow-clip">
                <ListHead />
                {groups.map(({ g, rows }) => (
                  <section key={g}>
                    <h2 className="sticky top-24 z-10 border-b border-outline-variant/60 bg-surface-container-low/95 backdrop-blur sm:top-14 dark:bg-surface-container/95">
                      <button
                        type="button"
                        aria-expanded={!collapsed[g]}
                        onClick={() => setCollapsed((c) => ({ ...c, [g]: !c[g] }))}
                        className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-label-md font-semibold text-on-surface"
                      >
                        <ChevronDown aria-hidden className={cn("size-3.5 text-on-surface-variant transition-transform", collapsed[g] && "-rotate-90")} />
                        {WAITING_ON_LABEL[g as WaitingOn]}
                        <span className="font-mono text-[11px] font-normal text-on-surface-variant">{rows.length}</span>
                      </button>
                    </h2>
                    {!collapsed[g] && (
                      <ul className="divide-y divide-outline-variant/50">
                        {rows.map((f) => (
                          <OpenRow key={f.id} state={state} fault={f} p={pace(stays, f, now)} menu={rowMenu(f)} />
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </Card>
            )}
          </div>
        )
      ) : (
        <ClosedList state={state} faults={closed} />
      )}

      <OfficerActionDialog fault={act?.fault ?? null} action={act?.action ?? null} onClose={() => setAct(null)} />
    </DesktopShell>
  );
}

/* ------------------------------------------------------------------ */

/** Funding rejected: the officer's own queue, with its three actions on the row (§6 story 12). */
function NeedsYou({ faults, onAct }: { faults: Fault[]; onAct: (f: Fault, a: OfficerAction) => void }) {
  const { state, now } = useDemo();
  return (
    <section aria-labelledby="needs-you" className="overflow-hidden rounded-lg border border-secondary/40 bg-secondary-container/40">
      <h2 id="needs-you" className="flex items-center gap-2 px-4 pt-3 pb-1 text-label-lg font-semibold text-on-surface">
        <span aria-hidden className="size-1.5 rounded-full bg-secondary" />
        Needs you <span className="font-mono text-[11px] font-normal text-on-surface-variant">{faults.length}</span>
      </h2>
      <ul className="divide-y divide-secondary/20">
        {faults.map((f) => {
          const wp = wpById(state, f.waterPointId);
          const dec = latestOf(f, "decided");
          return (
            <li key={f.id} className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
              <Link href={`/app/faults/${f.id}`} className="min-w-0 flex-1 group">
                <span className="flex items-baseline gap-2">
                  <span className="font-mono text-[12px] text-on-surface-variant">{f.number}</span>
                  <span className="truncate text-label-lg font-medium text-on-surface group-hover:underline">{wp?.name}</span>
                </span>
                <span className="block text-body-sm text-on-surface-variant">
                  Funding rejected {Math.max(0, Math.floor((now - new Date(dec?.eventTime ?? f.eventTime).getTime()) / 86_400_000))} days ago · {fmtMoney(currentEstimate(f)?.diagnosis?.amount)}
                  {dec?.note && <span className="block truncate text-on-surface">“{dec.note}”</span>}
                </span>
              </Link>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => onAct(f, "revise")} leadingIcon={<RotateCcw aria-hidden className="size-4" />}>
                  Ask for revision
                </Button>
                <Button size="sm" variant="outlined" onClick={() => onAct(f, "escalate")} leadingIcon={<Megaphone aria-hidden className="size-4" />}>
                  Escalate
                </Button>
                <Button size="sm" variant="text" onClick={() => onAct(f, "abandon")}>
                  Abandon
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const COLS = "sm:grid-cols-[56px_minmax(0,1fr)_180px_150px_96px_40px]";

function ListHead() {
  return (
    <div className={cn("hidden gap-x-4 border-b border-outline-variant/70 px-4 py-2 font-mono text-[11px] tracking-wide text-on-surface-variant uppercase sm:grid", COLS)}>
      <span>ID</span>
      <span>Water point</span>
      <span>Status</span>
      <span>In this step</span>
      <span className="text-right">Estimate</span>
      <span />
    </div>
  );
}

function OpenRow({ state, fault, p, menu }: { state: DemoState; fault: Fault; p: ReturnType<typeof pace>; menu: MenuItem[] }) {
  const wp = wpById(state, fault.waterPointId);
  const est = currentEstimate(fault);
  const pending = fault.events.some((e) => !e.syncedAt);
  return (
    <li className={cn("group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 transition-colors hover:bg-surface-container-low sm:gap-x-4 sm:py-2.5", COLS)}>
      <span className="hidden font-mono text-[12px] text-on-surface-variant sm:block">{fault.number}</span>
      <span className="min-w-0">
        <Link href={`/app/faults/${fault.id}`} className="block truncate text-label-lg font-medium text-on-surface outline-none after:absolute after:inset-0 focus-visible:underline">
          {wp?.name}
        </Link>
        <span className="block truncate text-body-sm text-on-surface-variant">
          <span className="font-mono sm:hidden">{fault.number} · </span>
          {label(state.faultTypes, fault.faultType)} · {wp?.community}
        </span>
      </span>
      <span className="col-start-1 row-start-2 flex flex-wrap items-center gap-x-3 gap-y-1 sm:col-start-auto sm:row-start-auto">
        <StatusDot status={fault.status} />
      </span>
      <span className="col-start-1 row-start-3 flex items-center gap-1.5 text-body-sm sm:col-start-auto sm:row-start-auto">
        <span className={cn("num", p.slow ? "font-medium text-on-secondary-container" : "text-on-surface-variant")}>
          {p.days === 0 ? "today" : `${p.days} day${p.days === 1 ? "" : "s"}`}
        </span>
        {p.slow && p.usual && (
          <span className="rounded-sm bg-secondary-container px-1.5 py-0.5 text-[11px] font-medium text-on-secondary-container" title={`Usual time in this step is ${fmtDays(p.usual.days)}, from ${p.usual.n} past faults`}>
            usual {Math.round(p.usual.days)}d
          </span>
        )}
        {pending && <CloudUpload aria-label="Sync pending" className="size-3.5 text-secondary" />}
      </span>
      <span className="hidden text-right text-label-lg text-on-surface num sm:block">{est ? fmtMoney(est.diagnosis?.amount) : <span className="text-on-surface-variant">—</span>}</span>
      <Menu
        label={`Actions for ${fault.number}`}
        items={menu}
        className="relative z-10 col-start-2 row-span-3 row-start-1 justify-self-end sm:col-start-auto sm:row-span-1 sm:row-start-auto md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
      />
    </li>
  );
}

/** Confirmed repairs and abandoned faults (PRD §5: "one place … and confirmed repairs"). */
function ClosedList({ state, faults }: { state: DemoState; faults: Fault[] }) {
  if (!faults.length)
    return (
      <Card>
        <EmptyState title="No closed faults yet" body="A fault closes when the custodian confirms water is flowing, or when it is abandoned with a reason." />
      </Card>
    );
  const cols = "sm:grid-cols-[56px_minmax(0,1fr)_170px_110px_110px_110px]";
  return (
    <Card className="overflow-clip">
      <div className={cn("hidden gap-x-4 border-b border-outline-variant/70 px-4 py-2 font-mono text-[11px] tracking-wide text-on-surface-variant uppercase sm:grid", cols)}>
        <span>ID</span>
        <span>Water point</span>
        <span>Outcome</span>
        <span>Closed</span>
        <span className="text-right">Days to restore</span>
        <span className="text-right">Disbursed</span>
      </div>
      <ul className="divide-y divide-outline-variant/50">
        {faults.map((f) => {
          const wp = wpById(state, f.waterPointId);
          const d = daysToRestore(f);
          const money = disbursed(f);
          return (
            <li key={f.id} className={cn("relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface-container-low sm:py-2.5", cols)}>
              <span className="hidden font-mono text-[12px] text-on-surface-variant sm:block">{f.number}</span>
              <span className="min-w-0">
                <Link href={`/app/faults/${f.id}`} className="block truncate text-label-lg font-medium text-on-surface after:absolute after:inset-0">
                  {wp?.name}
                </Link>
                <span className="block truncate text-body-sm text-on-surface-variant">
                  <span className="font-mono sm:hidden">{f.number} · </span>
                  {label(state.faultTypes, f.faultType)}
                </span>
              </span>
              <span className="col-start-1 row-start-2 sm:col-start-auto sm:row-start-auto">
                <StatusPill status={f.status} size="sm" />
              </span>
              <span className="col-start-2 row-start-1 text-right font-mono text-[12px] text-on-surface-variant sm:col-start-auto sm:row-start-auto sm:text-left">{fmtDate(closedAt(f) ?? f.eventTime)}</span>
              <span className="hidden text-right text-label-lg text-on-surface num sm:block">{d !== undefined ? fmtDays(d) : <span className="text-on-surface-variant">—</span>}</span>
              <span className="hidden text-right text-label-lg text-on-surface num sm:block">{money ? fmtMoney(money) : <span className="text-on-surface-variant">—</span>}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
