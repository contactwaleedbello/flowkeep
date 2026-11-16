"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Stat strip: figures above a table. Each one is a filter (n8n, Time2book). */
/* ------------------------------------------------------------------ */

export interface Stat {
  key: string;
  label: string;
  value: ReactNode;
  hint?: string;
  /** Marks the figure as needing action (amber dot). */
  attention?: boolean;
}

export function StatStrip({ items, active, onSelect, className }: { items: Stat[]; active?: string; onSelect?: (key: string) => void; className?: string }) {
  return (
    <div className={cn("grid gap-px overflow-hidden rounded-lg border border-outline-variant/80 bg-outline-variant/70", className)} style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((s) => {
        const on = active === s.key;
        const Tag = onSelect ? "button" : "div";
        return (
          <Tag
            key={s.key}
            {...(onSelect ? { type: "button" as const, onClick: () => onSelect(s.key), "aria-pressed": on } : {})}
            className={cn(
              // hairline gaps instead of borders, so the dividers stay right when the strip wraps to 2 × 2
              "relative flex min-w-0 flex-col gap-1 bg-surface-container-lowest px-4 py-3.5 text-left transition-colors dark:bg-surface-container-low",
              onSelect && "hover:bg-surface-container-low dark:hover:bg-surface-container",
              on && "bg-surface-container-low after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary dark:bg-surface-container",
            )}
          >
            <span className="flex items-center gap-1.5 truncate text-label-md text-on-surface-variant">
              {s.attention && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-secondary" />}
              {s.label}
            </span>
            <span className="font-display text-headline-sm font-semibold text-on-surface num">{s.value}</span>
            {s.hint && <span className="truncate text-body-sm text-on-surface-variant">{s.hint}</span>}
          </Tag>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sheet: side panel for editing in place (Twenty, Square).              */
/* ------------------------------------------------------------------ */

export function Sheet({ open, onClose, title, eyebrow, children, footer }: { open: boolean; onClose: () => void; title: string; eyebrow?: ReactNode; children: ReactNode; footer?: ReactNode }) {
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
      className="fk-sheet m-0 ml-auto h-dvh max-h-dvh w-[min(460px,100vw)] max-w-none border-l border-outline-variant/70 bg-surface-container-lowest p-0 text-on-surface shadow-3 backdrop:bg-black/25 dark:bg-surface-container-low"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant/70 px-6 py-4">
          <div className="min-w-0">
            {eyebrow && <p className="mono-label text-on-surface-variant">{eyebrow}</p>}
            <h2 className="truncate text-title-lg font-semibold">{title}</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="state-layer -mr-2 flex size-8 shrink-0 items-center justify-center rounded-md text-on-surface-variant">
            <X aria-hidden className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center gap-2 border-t border-outline-variant/70 px-6 py-3">{footer}</div>}
      </div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ */
/* Charts: single series, one hue (primary), thin marks, hover tooltip,   */
/* values in text colour, and a screen-reader table behind each chart.   */
/* ------------------------------------------------------------------ */

/** Horizontal bars, e.g. median days per lifecycle step. */
export function HBars({ rows, unit, caption }: { rows: Array<{ label: string; value?: number; n: number }>; unit: string; caption: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value ?? 0));
  return (
    <figure className="flex flex-col gap-3">
      <div aria-hidden className="flex flex-col gap-2.5">
        {rows.map((r) => (
          <div key={r.label} className="group grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[minmax(0,180px)_1fr_auto]">
            <span className="truncate text-label-lg text-on-surface">{r.label}</span>
            <span className="relative order-last col-span-2 h-2 rounded-full bg-surface-container sm:order-none sm:col-span-1">
              {r.value !== undefined && (
                <span className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(3, (r.value / max) * 100)}%` }} />
              )}
              <span className="pointer-events-none absolute -top-8 left-0 hidden rounded-sm bg-inverse-surface px-2 py-1 font-mono text-[11px] whitespace-nowrap text-inverse-on-surface shadow-2 group-hover:block">
                {r.value === undefined ? "No data yet" : `${fmtDays(r.value)} median · n = ${r.n}`}
              </span>
            </span>
            <span className="w-24 text-right font-mono text-[12px] text-on-surface-variant">
              {r.value === undefined ? "—" : fmtDays(r.value)} <span className="opacity-70">n={r.n}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="sr-only"><table>
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th>Step</th>
            <th>Median ({unit})</th>
            <th>Faults measured</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td>{r.label}</td>
              <td>{r.value === undefined ? "No data" : r.value.toFixed(1)}</td>
              <td>{r.n}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </figure>
  );
}

/** Vertical bars over time, e.g. events per week. */
export function ColumnBars({ bars, caption, height = 96 }: { bars: Array<{ label: string; value: number }>; caption: string; height?: number }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <figure className="flex flex-col gap-2">
      <div aria-hidden className="flex items-end gap-[2px] border-b border-outline-variant" style={{ height }}>
        {bars.map((b) => (
          <div key={b.label} className="group relative flex h-full flex-1 items-end justify-center">
            <span className="w-full max-w-7 rounded-t-[4px] bg-primary/85 transition-colors group-hover:bg-primary" style={{ height: `${b.value ? Math.max(4, (b.value / max) * 100) : 0}%` }} />
            <span className="pointer-events-none absolute bottom-full mb-1 hidden rounded-sm bg-inverse-surface px-2 py-1 font-mono text-[11px] whitespace-nowrap text-inverse-on-surface shadow-2 group-hover:block">
              {b.label}: {b.value}
            </span>
          </div>
        ))}
      </div>
      <div aria-hidden className="flex gap-[2px] font-mono text-[10.5px] text-on-surface-variant">
        {bars.map((b, i) => (
          <span key={b.label} className="flex-1 text-center">
            {i === 0 || i === bars.length - 1 ? b.label : ""}
          </span>
        ))}
      </div>
      <div className="sr-only"><table>
        <caption>{caption}</caption>
        <tbody>
          {bars.map((b) => (
            <tr key={b.label}>
              <td>{b.label}</td>
              <td>{b.value}</td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </figure>
  );
}

/** Share as a thin meter with x of n. */
export function Meter({ x, n, label }: { x: number; n: number; label: string }) {
  const p = n ? (x / n) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-headline-sm font-semibold text-on-surface num">{n ? `${Math.round(p)}%` : "—"}</span>
        <span className="font-mono text-[11px] text-on-surface-variant">
          {x} of {n}
        </span>
      </div>
      <span role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={n} aria-valuenow={x} className="relative h-1.5 rounded-full bg-surface-container">
        <span className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${p}%` }} />
      </span>
    </div>
  );
}

export function fmtDays(d: number) {
  if (d < 1) return `${Math.max(1, Math.round(d * 24))} h`;
  return `${d.toFixed(d < 10 ? 1 : 0)} d`;
}

/**
 * Inline, minimal select used in table cells. Reads as text until hovered or focused,
 * then shows its affordance. Native <select> for keyboard and screen readers.
 */
export function CellSelect({
  value,
  onChange,
  label,
  children,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className="group/cell relative block max-w-48" onClick={(e) => e.stopPropagation()}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-8 w-full cursor-pointer appearance-none truncate rounded-md border border-transparent bg-transparent pr-7 pl-2 text-label-lg text-on-surface outline-none",
          "hover:border-outline-variant hover:bg-surface-container-lowest focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10 dark:hover:bg-surface-container",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-on-surface-variant opacity-0 transition-opacity group-hover/cell:opacity-100 group-focus-within/cell:opacity-100"
      />
    </span>
  );
}
