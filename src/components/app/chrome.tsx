"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import {
  ArrowLeft,
  ChevronsUpDown,
  CloudOff,
  Droplet,
  FileSpreadsheet,
  Home,
  Inbox,
  Plus,
  RefreshCw,
  RotateCcw,
  Settings,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { daysSince, fmtDateTime, pendingSync, userById } from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import { Toast } from "@/components/ui/feedback";
import { LogoMark } from "@/components/ui/logo";
import { CountBadge } from "@/components/ui/status-pill";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ROLE_LABEL } from "./fault-bits";

/* ------------------------------------------------------------------ */
/* Roles                                                               */
/* ------------------------------------------------------------------ */

export const ROLES = [
  { key: "officer", label: "Programme officer", href: "/app/officer" },
  { key: "approver", label: "Approver", href: "/app/approver" },
  { key: "technician", label: "Technician", href: "/app/technician" },
  { key: "custodian", label: "Custodian", href: "/app/custodian" },
  { key: "assist", label: "Assisting user", href: "/app/assist" },
  { key: "admin", label: "Admin", href: "/app/admin" },
] as const;

export type RoleKey = (typeof ROLES)[number]["key"];

/* ------------------------------------------------------------------ */
/* Demo dock: role switch, offline simulation, reset.                  */
/* Floating on larger screens, a slim strip on phones.                 */
/* ------------------------------------------------------------------ */

export function DemoDock({ role }: { role: RoleKey }) {
  const { state, setOnline, reset } = useDemo();
  const router = useRouter();
  return (
    <div
      className={cn(
        "z-50 flex items-center gap-1 bg-inverse-surface px-2 text-label-md text-inverse-on-surface",
        "sticky top-0 h-10 w-full",
        "sm:fixed sm:top-auto sm:bottom-4 sm:left-1/2 sm:h-11 sm:w-auto sm:-translate-x-1/2 sm:rounded-xl sm:px-2 sm:shadow-3",
      )}
    >
      <span className="px-2 font-mono text-[11px] tracking-wider opacity-60">DEMO</span>
      <label className="relative flex items-center">
        <span className="sr-only">View as</span>
        <select
          value={role}
          onChange={(e) => router.push(ROLES.find((r) => r.key === e.target.value)!.href)}
          className="h-8 cursor-pointer appearance-none rounded-md bg-transparent py-0 pr-7 pl-2 font-medium outline-none hover:bg-inverse-on-surface/10 focus-visible:ring-2 focus-visible:ring-inverse-primary"
        >
          {ROLES.map((r) => (
            <option key={r.key} value={r.key} className="text-black">
              {r.label}
            </option>
          ))}
        </select>
        <ChevronsUpDown aria-hidden className="pointer-events-none absolute right-2 size-3.5 opacity-60" />
      </label>
      <span aria-hidden className="mx-1 h-5 w-px bg-inverse-on-surface/15" />
      <button
        type="button"
        role="switch"
        aria-checked={!state.online}
        aria-label="Simulate offline"
        onClick={() => setOnline(!state.online)}
        className="flex h-8 items-center gap-2 rounded-md px-2 hover:bg-inverse-on-surface/10"
      >
        <span aria-hidden>Offline</span>
        <span aria-hidden className={cn("relative h-4 w-7 rounded-full transition-colors", state.online ? "bg-inverse-on-surface/25" : "bg-inverse-primary")}>
          <span className={cn("absolute top-0.5 left-0.5 size-3 rounded-full bg-inverse-surface transition-transform", !state.online && "translate-x-3")} />
        </span>
      </button>
      <button type="button" onClick={reset} aria-label="Reset demo data" title="Reset demo data" className="flex size-8 items-center justify-center rounded-md hover:bg-inverse-on-surface/10">
        <RotateCcw aria-hidden className="size-3.5" />
      </button>
      <ThemeToggle className="size-8 rounded-md text-inverse-on-surface hover:bg-inverse-on-surface/10" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sync indicator (PRD §9): quiet when synced, clear when not.          */
/* ------------------------------------------------------------------ */

function useSync() {
  const { state, now, syncNow } = useDemo();
  const { count, oldest } = pendingSync(state);
  const days = oldest ? daysSince(oldest, now) : 0;
  const kind = !state.online ? "offline" : count ? (days >= 10 ? "stale" : "pending") : "synced";
  return { kind, count, days, lastSyncAt: state.lastSyncAt, syncNow, online: state.online };
}

export function SyncIndicator({ className }: { className?: string }) {
  const s = useSync();
  if (s.kind === "offline")
    return (
      <span role="status" className={cn("inline-flex h-7 items-center gap-1.5 rounded-md bg-inverse-surface px-2.5 text-label-md text-inverse-on-surface", className)}>
        <CloudOff aria-hidden className="size-3.5" /> Offline{s.count ? ` · ${s.count} saved on this device` : ""}
      </span>
    );
  if (s.kind === "synced")
    return (
      <span role="status" className={cn("inline-flex h-7 items-center gap-2 px-1 text-label-md text-on-surface-variant", className)}>
        <span aria-hidden className="size-1.5 rounded-full bg-success" /> Synced <span className="font-mono text-[11px]">{fmtDateTime(s.lastSyncAt)}</span>
      </span>
    );
  return (
    <span role="status" className={cn("inline-flex h-7 items-center gap-1 rounded-md border border-outline-variant bg-surface-container-lowest pr-0.5 pl-2.5 text-label-md text-on-surface dark:bg-surface-container", className)}>
      <span aria-hidden className={cn("mr-1 size-1.5 rounded-full", s.kind === "stale" ? "bg-error" : "bg-secondary")} />
      {s.kind === "stale" ? `Oldest unsynced entry is ${s.days} days old` : `${s.count} waiting to sync`}
      <button type="button" onClick={s.syncNow} className="ml-1 inline-flex h-6 items-center gap-1 rounded-sm px-2 font-medium text-primary hover:bg-surface-container">
        <RefreshCw aria-hidden className="size-3" /> Sync
      </button>
    </span>
  );
}

/** Full-width variant for phone screens. Hidden when everything is synced. */
function PhoneSyncStrip() {
  const s = useSync();
  if (s.kind === "synced") return null;
  return (
    <div
      role="status"
      className={cn(
        "flex h-9 items-center gap-2 px-5 text-label-md",
        s.kind === "offline" ? "bg-inverse-surface text-inverse-on-surface" : s.kind === "stale" ? "bg-error-container text-on-error-container" : "bg-secondary-container text-on-secondary-container",
      )}
    >
      {s.kind === "offline" ? <CloudOff aria-hidden className="size-3.5" /> : <RefreshCw aria-hidden className="size-3.5" />}
      <span className="flex-1">
        {s.kind === "offline"
          ? `Offline. ${s.count ? `${s.count} saved on this phone.` : "You can keep working."}`
          : s.kind === "stale"
            ? `Oldest entry ${s.days} days old. Sync before day 14.`
            : `${s.count} waiting to sync`}
      </span>
      {s.online && (
        <button type="button" onClick={s.syncNow} className="font-semibold underline-offset-2 hover:underline">
          Sync now
        </button>
      )}
    </div>
  );
}

export function ToastHost() {
  const { toast } = useDemo();
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 sm:bottom-20">
      <Toast key={toast.id} title={toast.title} meta={toast.meta} className="pointer-events-auto animate-[fk-in_200ms_var(--ease-emphasized)]" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop shell: officer, approver, admin                              */
/* ------------------------------------------------------------------ */

type NavItem = { href: string; label: string; icon: LucideIcon; count?: number };

export function DesktopShell({ role, children }: { role: "officer" | "approver" | "admin"; children: ReactNode }) {
  const { state } = useDemo();
  const path = usePathname();
  const me = userById(state, PERSONA[role]);
  const open = state.faults.filter((f) => !["service_verified", "abandoned"].includes(f.status));
  const nav: NavItem[] =
    role === "officer"
      ? [
          { href: "/app/officer", label: "Open faults", icon: Inbox, count: open.length },
          { href: "/app/water-points", label: "Water points", icon: Droplet, count: state.waterPoints.filter((w) => !w.archived).length },
          { href: "/app/exports", label: "Exports", icon: FileSpreadsheet },
        ]
      : role === "approver"
        ? [{ href: "/app/approver", label: "Estimates", icon: Inbox, count: open.filter((f) => ["estimate_submitted", "funding_approved"].includes(f.status)).length }]
        : [{ href: "/app/admin", label: "Admin", icon: Settings }];

  return (
    <div className="flex min-h-screen flex-col">
      <DemoDock role={role} />
      <div className="flex flex-1">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-outline-variant/80 bg-surface-container-low/60 md:flex dark:bg-surface-container-low">
          <div className="flex h-14 items-center gap-2.5 border-b border-outline-variant/60 px-4">
            <LogoMark className="size-6" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-label-lg font-semibold text-on-surface">Flowkeep</p>
              <p className="truncate text-[11px] leading-tight text-on-surface-variant">{state.organisation.name}</p>
            </div>
          </div>
          <nav aria-label="Main" className="flex flex-col gap-0.5 p-2">
            {nav.map(({ href, label, icon: Icon, count }) => {
              const active = path === href || (href !== "/app/officer" && path.startsWith(href)) || (href === "/app/officer" && path.startsWith("/app/faults"));
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-8 items-center gap-2.5 rounded-md px-2.5 text-label-lg transition-colors",
                    active ? "bg-surface-container-lowest font-medium text-on-surface shadow-1 ring-1 ring-outline-variant/70 dark:bg-surface-container-high" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                  )}
                >
                  <Icon aria-hidden className="size-4 opacity-80" />
                  <span className="flex-1">{label}</span>
                  {count !== undefined && <CountBadge count={count} className="bg-transparent" />}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex items-center gap-2.5 border-t border-outline-variant/60 p-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-surface-container-highest text-[11px] font-semibold text-on-surface">
              {me?.name.split(" ").map((p) => p[0]).join("")}
            </span>
            <div className="min-w-0">
              <p className="truncate text-label-lg font-medium text-on-surface">{me?.name}</p>
              <p className="truncate text-[11px] leading-tight text-on-surface-variant">{ROLE_LABEL[me?.role ?? ""]}</p>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-outline-variant/60 bg-surface/85 px-4 backdrop-blur-xl sm:px-8">
            <Link href="/app" className="md:hidden" aria-label="All roles">
              <LogoMark className="size-6" />
            </Link>
            <nav className="flex gap-1 overflow-x-auto md:hidden">
              {nav.map(({ href, label }) => (
                <Link key={href} href={href} className={cn("rounded-md px-2.5 py-1 text-label-lg whitespace-nowrap", path.startsWith(href) ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant")}>
                  {label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto">
              <SyncIndicator />
            </div>
          </header>
          <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 pt-8 pb-28 sm:px-8">{children}</main>
        </div>
      </div>
      <ToastHost />
    </div>
  );
}

export function PageHeader({
  title,
  sub,
  back,
  eyebrow,
  actions,
}: {
  title: string;
  sub?: ReactNode;
  back?: { href: string; label: string };
  eyebrow?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-3">
      {back && (
        <Link href={back.href} className="group inline-flex w-fit items-center gap-1.5 text-label-lg text-on-surface-variant hover:text-on-surface">
          <ArrowLeft aria-hidden className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          {eyebrow && <div className="mono-label text-on-surface-variant">{eyebrow}</div>}
          <h1 className="text-headline-md font-semibold text-on-surface">{title}</h1>
          {sub && <div className="text-body-md text-on-surface-variant">{sub}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Phone shell: custodian, assisting user, technician                   */
/* ------------------------------------------------------------------ */

export function PhoneShell({
  role,
  title,
  sub,
  back,
  children,
}: {
  role: "custodian" | "assist" | "technician";
  title: string;
  sub?: ReactNode;
  back?: string;
  children: ReactNode;
}) {
  const path = usePathname();
  const base = role === "technician" ? "/app/technician" : role === "assist" ? "/app/assist" : "/app/custodian";
  const tabs =
    role === "technician"
      ? []
      : [
          { href: base, label: "Home", icon: Home },
          { href: `${base}/report`, label: "Report", icon: Plus },
        ];
  return (
    <div className="flex min-h-screen flex-col bg-surface sm:bg-surface-container-low">
      <DemoDock role={role} />
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col bg-surface sm:my-8 sm:mb-24 sm:min-h-[780px] sm:flex-none sm:overflow-hidden sm:rounded-[28px] sm:shadow-3 sm:ring-1 sm:ring-outline-variant/70">
        <PhoneSyncStrip />
        <header className="flex items-start gap-1 px-5 pt-5 pb-4">
          {back ? (
            <Link href={back} aria-label="Back" className="state-layer -ml-2.5 flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface">
              <ArrowLeft aria-hidden className="size-5" />
            </Link>
          ) : (
            role === "technician" && <Wrench aria-hidden className="mt-1.5 mr-2 size-5 text-on-surface-variant" />
          )}
          <div className="min-w-0">
            {sub && <p className="truncate text-body-sm text-on-surface-variant">{sub}</p>}
            <h1 className="text-headline-sm font-semibold text-on-surface">{title}</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 px-5 pb-6">{children}</main>
        {tabs.length > 1 && (
          <nav className="sticky bottom-0 grid grid-cols-2 border-t border-outline-variant/70 bg-surface/95 backdrop-blur">
            {tabs.map(({ href, label, icon: Icon }) => {
              const active = href === base ? path === base || path.startsWith(`${base}/faults`) : path.startsWith(href);
              return (
                <Link key={href} href={href} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-label-md", active ? "font-semibold text-on-surface" : "text-on-surface-variant")}>
                  <Icon aria-hidden className="size-5" strokeWidth={active ? 2.25 : 1.75} />
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
      <ToastHost />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dialog (native <dialog>)                                             */
/* ------------------------------------------------------------------ */

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(480px,calc(100vw-2rem))] rounded-xl bg-surface-container-lowest p-0 text-on-surface shadow-3 ring-1 ring-outline-variant/70 backdrop:bg-black/30 backdrop:backdrop-blur-[2px] dark:bg-surface-container"
    >
      <div className="flex items-center justify-between gap-4 px-6 pt-5">
        <h2 className="text-title-lg font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="state-layer -mr-2 flex size-8 items-center justify-center rounded-md text-on-surface-variant">
          <X aria-hidden className="size-4" />
        </button>
      </div>
      <div className="px-6 pt-3 pb-6">{children}</div>
    </dialog>
  );
}
