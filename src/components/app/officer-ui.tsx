"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ListFilter, MoreHorizontal, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { usersWithRole, userById } from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import type { Fault } from "@/lib/demo/types";
import { Dialog } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { SelectField, TextArea } from "@/components/ui/text-field";

export const OFFICER = PERSONA.officer;

/* ------------------------------------------------------------------ */
/* Popover menu: a "⋯" (or any trigger) that opens a short list.         */
/* Closes on outside click, Escape, or choosing an item.                */
/* ------------------------------------------------------------------ */

export interface MenuItem {
  label: string;
  onSelect: () => void;
  danger?: boolean;
  hint?: string;
}

export function Menu({ items, label, trigger, align = "end", className }: { items: MenuItem[]; label: string; trigger?: ReactNode; align?: "start" | "end"; className?: string }) {
  // Fixed position so a list's clipping (sticky group headers need overflow-clip) never cuts it off.
  const [pos, setPos] = useState<{ top: number; left?: number; right?: number } | null>(null);
  const open = !!pos;
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && close();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);
  const toggle = (btn: HTMLElement) => {
    if (open) return setPos(null);
    const r = btn.getBoundingClientRect();
    const below = window.innerHeight - r.bottom > 48 + items.length * 40;
    const top = below ? r.bottom + 4 : Math.max(8, r.top - 8 - items.length * 40);
    setPos(align === "end" ? { top, right: Math.max(8, window.innerWidth - r.right) } : { top, left: Math.max(8, r.left) });
  };
  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle(e.currentTarget);
        }}
        className="state-layer flex size-8 items-center justify-center rounded-md text-on-surface-variant"
      >
        {trigger ?? <MoreHorizontal aria-hidden className="size-4" />}
      </button>
      {open && (
        <ul
          id={id}
          role="menu"
          style={{ position: "fixed", top: pos.top, left: pos.left, right: pos.right }}
          className="z-50 min-w-52 rounded-lg border border-outline-variant/80 bg-surface-container-lowest p-1 shadow-3 animate-[fk-fade_120ms] dark:bg-surface-container-high"
        >
          {items.map((it) => (
            <li key={it.label} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPos(null);
                  it.onSelect();
                }}
                className={cn(
                  "flex w-full flex-col rounded-md px-2.5 py-1.5 text-left text-label-lg hover:bg-surface-container focus-visible:bg-surface-container focus-visible:outline-none",
                  it.danger ? "text-error" : "text-on-surface",
                )}
              >
                {it.label}
                {it.hint && <span className="text-body-sm text-on-surface-variant">{it.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The officer's actions on a fault (PRD §6 stories 12 and 14, §10).     */
/* One component, used from the list rows and from the record.          */
/* ------------------------------------------------------------------ */

export type OfficerAction = "abandon" | "revise" | "escalate" | "reassign-technician" | "reassign-custodian";

export function OfficerActionDialog({ fault, action, onClose }: { fault: Fault | null; action: OfficerAction | null; onClose: () => void }) {
  const open = !!fault && !!action;
  const title =
    action === "abandon"
      ? "Abandon this fault"
      : action === "revise"
        ? "Ask for a revised estimate"
        : action === "escalate"
          ? "Escalate"
          : action === "reassign-technician"
            ? "Reassign technician"
            : "Reassign custodian";
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      {open && <ActionForm key={`${fault.id}-${action}`} fault={fault} action={action} onClose={onClose} />}
    </Dialog>
  );
}

function ActionForm({ fault, action, onClose }: { fault: Fault; action: OfficerAction; onClose: () => void }) {
  const demo = useDemo();
  const { state } = demo;
  const [text, setText] = useState("");
  const [to, setTo] = useState("");
  const tech = userById(state, fault.technicianId);

  if (action === "reassign-technician" || action === "reassign-custodian") {
    const role = action === "reassign-technician" ? "technician" : "custodian";
    const current = role === "technician" ? fault.technicianId : fault.custodianId;
    const people = usersWithRole(state, role).filter((u) => u.id !== current && u.status === "active");
    return (
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          demo.reassign(fault.id, OFFICER, role, to);
          onClose();
        }}
      >
        <SelectField label={`New ${role}`} required value={to} onChange={(e) => setTo(e.target.value)}>
          <option value="" disabled>
            Choose a person
          </option>
          {people.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </SelectField>
        <p className="text-body-sm text-on-surface-variant">
          Now: {userById(state, current)?.name}. This changes this fault only. The water point&apos;s standing assignment is the admin&apos;s.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!to}>
            Reassign
          </Button>
        </div>
      </form>
    );
  }

  const copy =
    action === "abandon"
      ? "The fault closes without a repair. It stays on the record with your reason."
      : action === "revise"
        ? `${tech?.name} sees this on the fault and can submit a new estimate. The rejected one stays on the record.`
        : "Recorded on the fault. Flowkeep sends no messages in version one, so follow up directly.";
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const t = text.trim();
        if (action === "abandon") demo.abandon(fault.id, OFFICER, t);
        else if (action === "revise") demo.requestRevision(fault.id, OFFICER, t);
        else demo.escalate(fault.id, OFFICER, t);
        onClose();
      }}
    >
      <p className="text-body-md text-on-surface-variant">{copy}</p>
      <TextArea label={action === "abandon" ? "Reason" : "Note"} required value={text} onChange={(e) => setText(e.target.value)} autoFocus />
      <div className="flex justify-end gap-2">
        <Button variant="text" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant={action === "abandon" ? "danger" : "filled"} disabled={!text.trim()}>
          {action === "abandon" ? "Abandon fault" : "Save"}
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Filters: one "Filter" menu that scales with the portfolio, active   */
/* filters shown as removable chips (Linear, Plain).                    */
/* ------------------------------------------------------------------ */

export interface FilterField {
  key: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

export function FilterBar({ fields, value, onChange }: { fields: FilterField[]; value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const active = fields.filter((f) => value[f.key]);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <div ref={ref} className="relative">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-8 items-center gap-1.5 rounded-md border border-outline-variant px-2.5 text-label-lg text-on-surface hover:bg-surface-container-low"
        >
          <ListFilter aria-hidden className="size-4 text-on-surface-variant" />
          Filter
          {active.length > 0 && <span className="num text-[12px] text-on-surface-variant">{active.length}</span>}
        </button>
        {open && (
          <div className="absolute top-full left-0 z-40 mt-1 flex w-64 flex-col gap-3 rounded-lg border border-outline-variant/80 bg-surface-container-lowest p-3 shadow-3 dark:bg-surface-container-high">
            {fields.map((f) => (
              <SelectField key={f.key} label={f.label} value={value[f.key] ?? ""} onChange={(e) => onChange({ ...value, [f.key]: e.target.value })}>
                <option value="">Any</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectField>
            ))}
          </div>
        )}
      </div>
      {active.map((f) => (
        <span key={f.key} className="flex h-8 items-center gap-1 rounded-md bg-surface-container-high pr-1 pl-2.5 text-label-md text-on-surface">
          <span className="text-on-surface-variant">{f.label}:</span> {f.options.find((o) => o.value === value[f.key])?.label}
          <button
            type="button"
            aria-label={`Remove ${f.label} filter`}
            onClick={() => onChange({ ...value, [f.key]: "" })}
            className="flex size-6 items-center justify-center rounded-sm text-on-surface-variant hover:bg-surface-container-highest"
          >
            <X aria-hidden className="size-3.5" />
          </button>
        </span>
      ))}
      {active.length > 1 && (
        <button type="button" onClick={() => onChange({})} className="h-8 px-2 text-label-md text-on-surface-variant hover:text-on-surface">
          Clear all
        </button>
      )}
    </div>
  );
}
