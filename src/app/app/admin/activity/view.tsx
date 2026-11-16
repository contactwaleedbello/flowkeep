"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Download, Eye, GitMerge, PenLine } from "lucide-react";
import { cn } from "@/lib/cn";
import { weeklyCounts } from "@/lib/demo/analytics";
import { downloadCsv } from "@/lib/demo/csv";
import { fmtDate, userById, wpById } from "@/lib/demo/logic";
import { useDemo } from "@/lib/demo/store";
import type { DemoState, Role } from "@/lib/demo/types";
import { ROLE_INFO } from "@/components/app/admin-dialogs";
import { ColumnBars } from "@/components/app/admin-ui";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";

type Kind = "change" | "phone" | "merge";
type Filter = "all" | Kind;

interface Entry {
  id: string;
  kind: Kind;
  at: string;
  who: string;
  text: string;
  detail?: string;
  code: string;
}

const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos" });

function entries(s: DemoState): Entry[] {
  const subject = (type: string, id: string) =>
    type === "user" ? userById(s, id)?.name : type === "water_point" || type === "assignment" ? wpById(s, id)?.externalId : s.faults.find((f) => f.id === id)?.number ?? id;
  const fromCorrections: Entry[] = s.corrections.map((c) => {
    const merge = c.fieldName === "merged_into";
    return {
      id: c.id,
      kind: merge ? "merge" : "change",
      at: c.correctedAt,
      who: userById(s, c.correctedById)?.name ?? "Someone",
      text: merge
        ? `merged ${subject(c.entityType, c.entityId)} into ${c.newValue}`
        : `changed ${c.fieldName.replace(/_/g, " ")} on ${subject(c.entityType, c.entityId)}: ${nice(c.fieldName, c.previousValue)} → ${nice(c.fieldName, c.newValue)}`,
      detail: c.reason,
      code: `${c.entityType}.${c.fieldName}`,
    };
  });
  const fromPhone: Entry[] = s.phoneAccessLog.map((p) => ({
    id: p.id,
    kind: "phone",
    at: p.accessedAt,
    who: userById(s, p.viewerId)?.name ?? "Someone",
    text: `viewed ${userById(s, p.subjectId)?.name}'s phone number at ${wpById(s, p.waterPointId)?.externalId}`,
    detail: p.purpose,
    code: "phone.viewed",
  }));
  return [...fromCorrections, ...fromPhone].sort((a, b) => b.at.localeCompare(a.at));
}

const ICON = { change: PenLine, phone: Eye, merge: GitMerge };

/** Human wording for stored values (roles, statuses, flags). */
function nice(field: string, v: string) {
  if (!v) return "empty";
  if (field === "role" && v in ROLE_INFO) return ROLE_INFO[v as Role].label.toLowerCase();
  if (field === "archived") return v === "true" ? "archived" : "active";
  if (field === "status") return v === "invited" ? "invited" : v;
  return v;
}

export function ActivityView() {
  const { state, now } = useDemo();
  const router = useRouter();
  const params = useSearchParams();
  const filter = (params.get("filter") as Filter) || "all";
  const setFilter = (f: Filter) => router.replace(f === "all" ? "/app/admin/activity" : `/app/admin/activity?filter=${f}`, { scroll: false });

  const all = useMemo(() => entries(state), [state]);
  const list = filter === "all" ? all : all.filter((e) => e.kind === filter);
  const weeks = weeklyCounts(list.map((e) => e.at), now, 8).map((w) => ({ label: fmtDate(new Date(w.start).toISOString()).replace(/ \d{4}$/, ""), value: w.count }));

  const groups = list.reduce<Record<string, Entry[]>>((acc, e) => {
    const k = dayKey.format(new Date(e.at));
    (acc[k] ||= []).push(e);
    return acc;
  }, {});

  const chips: Array<{ key: Filter; label: string; n: number }> = [
    { key: "all", label: "All", n: all.length },
    { key: "change", label: "Changes", n: all.filter((e) => e.kind === "change").length },
    { key: "phone", label: "Phone number views", n: all.filter((e) => e.kind === "phone").length },
    { key: "merge", label: "Merges", n: all.filter((e) => e.kind === "merge").length },
  ];

  function exportCsv() {
    const head = ["time", "type", "by", "what", "reason_or_purpose", "code"];
    const body = list.map((e) => [e.at, e.kind, e.who, e.text, e.detail ?? "", e.code]);
    downloadCsv(`flowkeep-activity-${filter}.csv`, [head, ...body].map((r) => r.map((v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(",")).join("\n"));
  }

  return (
    <DesktopShell role="admin">
      <PageHeader
        title="Activity"
        sub="Corrections and phone number views, append only. Nothing here can be edited or deleted."
        actions={
          <Button variant="outlined" leadingIcon={<Download aria-hidden className="size-4" />} onClick={exportCsv}>
            Export CSV
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div role="group" aria-label="Filter activity" className="flex flex-wrap content-start gap-1.5">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={filter === c.key}
              onClick={() => setFilter(c.key)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-label-lg transition-colors",
                filter === c.key ? "border-on-surface bg-on-surface text-surface" : "border-outline-variant text-on-surface-variant hover:text-on-surface",
              )}
            >
              {c.label}
              <span className="font-mono text-[11px] opacity-70">{c.n}</span>
            </button>
          ))}
        </div>
        <Card className="p-4">
          <p className="mb-3 flex items-baseline justify-between text-label-md text-on-surface-variant">
            <span>Events per week</span>
            <span className="font-mono text-[11px]">last 8 weeks</span>
          </p>
          <ColumnBars bars={weeks} caption="Activity events per week, last 8 weeks" height={72} />
        </Card>
      </div>

      {list.length === 0 ? (
        <Card>
          <EmptyState title="No activity of this kind yet" />
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groups).map(([day, items]) => (
            <section key={day} className="flex flex-col gap-2">
              <h2 className="font-mono text-[12px] text-on-surface-variant">{fmtDate(items[0].at)}</h2>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-outline-variant/50">
                  {items.map((e) => {
                    const Icon = ICON[e.kind];
                    return (
                      <li key={e.id} className="grid grid-cols-[48px_20px_1fr] items-start gap-3 px-4 py-3 sm:grid-cols-[48px_20px_1fr_auto]">
                        <span className="pt-0.5 font-mono text-[12px] text-on-surface-variant">{time.format(new Date(e.at))}</span>
                        <Icon aria-hidden className="mt-0.5 size-4 text-on-surface-variant" />
                        <div className="min-w-0">
                          <p className="text-body-md text-on-surface">
                            <span className="font-medium">{e.who}</span> {e.text}
                          </p>
                          {e.detail && <p className="text-body-sm text-on-surface-variant">{e.detail}</p>}
                        </div>
                        <code className="hidden rounded-xs border border-outline-variant/70 px-1.5 py-0.5 font-mono text-[11px] text-on-surface-variant sm:block">{e.code}</code>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      )}
    </DesktopShell>
  );
}
