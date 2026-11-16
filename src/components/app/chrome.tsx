"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, Droplet, FileSpreadsheet, Home, Inbox, Plus, RotateCcw, Settings, Wrench, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { pendingSync, daysSince, fmtDateTime, userById } from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import { SyncBar, Toast } from "@/components/ui/feedback";
import { LogoMark } from "@/components/ui/logo";
import { CountBadge } from "@/components/ui/status-pill";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/* ------------------------------------------------------------------ */
/* Demo bar: role switch, offline simulation, reset                     */
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

export function useActor(role: RoleKey) {
  const { state } = useDemo();
  return userById(state, PERSONA[role])!;
}

export function DemoBar({ role }: { role: RoleKey }) {
  const { state, setOnline, reset } = useDemo();
  const actor = userById(state, PERSONA[role]);
  return (
    <div className="border-b border-outline-variant/70 bg-surface-container-low text-body-sm text-on-surface-variant">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
        <span className="inline-flex items-center gap-1.5 font-medium text-on-surface">
          <span className="rounded-full bg-inverse-surface px-1.5 py-0.5 text-label-sm font-semibold text-inverse-on-surface">DEMO</span>
          {actor?.name}
        </span>
        <nav aria-label="Switch role" className="-mx-1 flex flex-1 gap-0.5 overflow-x-auto">
          {ROLES.map((r) => (
            <Link
              key={r.key}
              href={r.href}
              className={cn(
                "rounded-full px-2.5 py-1 whitespace-nowrap transition-colors",
                r.key === role ? "bg-surface-container-lowest font-medium text-on-surface shadow-1" : "hover:text-on-surface",
              )}
            >
              {r.label}
            </Link>
          ))}
        </nav>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <span>Offline</span>
          <Switch checked={!state.online} onChange={(v) => setOnline(!v)} label="Simulate offline" />
        </label>
        <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:text-on-surface">
          <RotateCcw aria-hidden className="size-3.5" /> Reset
        </button>
        <ThemeToggle className="size-8" />
      </div>
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-primary" : "bg-outline-variant")}
    >
      <span className={cn("absolute top-0.5 left-0.5 size-4 rounded-full bg-surface-container-lowest shadow-1 transition-transform", checked && "translate-x-4")} />
    </button>
  );
}

/** Sync state from the store, as the persistent bar (PRD §9). */
export function LiveSyncBar({ className }: { className?: string }) {
  const { state, syncNow, now } = useDemo();
  const { count, oldest } = pendingSync(state);
  const stale = oldest ? daysSince(oldest, now) >= 10 : false;
  const s = !state.online ? "offline" : stale ? "stale" : count ? "pending" : "synced";
  return (
    <SyncBar
      state={s}
      pending={count}
      oldestDays={oldest ? daysSince(oldest, now) : undefined}
      onSync={state.online && count ? syncNow : undefined}
      className={className}
    />
  );
}

export function ToastHost() {
  const { toast } = useDemo();
  if (!toast) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
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
  const open = state.faults.filter((f) => !["service_verified", "abandoned"].includes(f.status));
  const nav: NavItem[] =
    role === "officer"
      ? [
          { href: "/app/officer", label: "Open faults", icon: Inbox, count: open.length },
          { href: "/app/water-points", label: "Water points", icon: Droplet, count: state.waterPoints.filter((w) => !w.archived).length },
          { href: "/app/exports", label: "Exports", icon: FileSpreadsheet },
        ]
      : role === "approver"
        ? [
            { href: "/app/approver", label: "Estimates", icon: Inbox, count: open.filter((f) => ["estimate_submitted", "funding_approved"].includes(f.status)).length },
          ]
        : [{ href: "/app/admin", label: "Admin", icon: Settings }];

  return (
    <div className="flex min-h-screen flex-col">
      <DemoBar role={role} />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <aside className="sticky top-0 hidden h-[calc(100vh-41px)] w-60 shrink-0 flex-col gap-1 border-r border-outline-variant/70 p-3 md:flex">
          <Link href="/" className="mb-4 flex items-center gap-2 px-2 pt-2">
            <LogoMark className="size-7" />
            <span className="text-title-md font-semibold text-on-surface">Flowkeep</span>
          </Link>
          {nav.map(({ href, label, icon: Icon, count }) => {
            const active = path === href || (href !== "/app/officer" && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-label-lg transition-colors",
                  active ? "bg-surface-container-lowest font-medium text-on-surface shadow-1 ring-1 ring-outline-variant/60 dark:bg-surface-container" : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                )}
              >
                <Icon aria-hidden className="size-4" />
                <span className="flex-1">{label}</span>
                {count !== undefined && <CountBadge count={count} />}
              </Link>
            );
          })}
          <div className="mt-auto px-2 text-body-sm text-on-surface-variant">
            <p className="font-medium text-on-surface">{state.organisation.name}</p>
            <p>Last sync {fmtDateTime(state.lastSyncAt)}</p>
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          {/* mobile nav */}
          <nav className="flex gap-1 overflow-x-auto border-b border-outline-variant/70 px-4 py-2 md:hidden">
            {nav.map(({ href, label }) => (
              <Link key={href} href={href} className={cn("rounded-full px-3 py-1.5 text-label-lg whitespace-nowrap", path.startsWith(href) ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant")}>
                {label}
              </Link>
            ))}
          </nav>
          <LiveSyncBar />
          <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
        </div>
      </div>
      <ToastHost />
    </div>
  );
}

export function PageHeader({ title, sub, back, actions }: { title: string; sub?: ReactNode; back?: { href: string; label: string }; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3">
      {back && (
        <Link href={back.href} className="inline-flex w-fit items-center gap-1 text-label-lg text-on-surface-variant hover:text-on-surface">
          <ArrowLeft aria-hidden className="size-4" /> {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
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
      ? [{ href: base, label: "My faults", icon: Wrench }]
      : [
          { href: base, label: "Home", icon: Home },
          { href: `${base}/report`, label: "Report", icon: Plus },
        ];
  return (
    <div className="flex min-h-screen flex-col bg-surface-container-low">
      <DemoBar role={role} />
      <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col bg-surface sm:my-6 sm:overflow-hidden sm:rounded-xl sm:shadow-3 sm:ring-1 sm:ring-outline-variant/60">
        <LiveSyncBar />
        <header className="flex items-start gap-2 px-5 pt-4 pb-3">
          {back && (
            <Link href={back} aria-label="Back" className="state-layer -ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-on-surface">
              <ArrowLeft aria-hidden className="size-5" />
            </Link>
          )}
          <div className="min-w-0">
            {sub && <p className="text-body-sm text-on-surface-variant">{sub}</p>}
            <h1 className="text-headline-sm font-semibold text-on-surface">{title}</h1>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 px-5 pb-6">{children}</main>
        {tabs.length > 1 && (
          <nav className="sticky bottom-0 grid grid-cols-2 border-t border-outline-variant/70 bg-surface-container-lowest/95 backdrop-blur dark:bg-surface-container">
            {tabs.map(({ href, label, icon: Icon }) => {
              const active = href === base ? path === base : path.startsWith(href);
              return (
                <Link key={href} href={href} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-label-md", active ? "font-semibold text-primary" : "text-on-surface-variant")}>
                  <Icon aria-hidden className="size-5" />
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
      className="m-auto w-[min(520px,calc(100vw-2rem))] rounded-xl bg-surface-container-lowest p-0 text-on-surface shadow-3 ring-1 ring-outline-variant/60 backdrop:bg-black/40 backdrop:backdrop-blur-[2px] dark:bg-surface-container"
    >
      <div className="flex items-center justify-between gap-4 border-b border-outline-variant/70 px-6 py-4">
        <h2 className="text-title-lg font-semibold">{title}</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="state-layer flex size-9 items-center justify-center rounded-full text-on-surface-variant">
          <X aria-hidden className="size-5" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </dialog>
  );
}
