"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { CountBadge } from "./status-pill";

/**
 * Segmented queue tabs with counts (Acctual / Relevance AI pattern).
 * Example: approver queue — To decide · To disburse · Disbursed.
 */
export function QueueTabs({
  tabs,
  defaultValue,
  onChange,
  className,
}: {
  tabs: Array<{ value: string; label: string; count?: number; panel?: ReactNode }>;
  defaultValue?: string;
  onChange?: (v: string) => void;
  className?: string;
}) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value);
  const panel = tabs.find((t) => t.value === active)?.panel;
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div role="tablist" className="inline-flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-surface-container p-1">
        {tabs.map((t) => {
          const on = t.value === active;
          return (
            <button
              key={t.value}
              role="tab"
              type="button"
              aria-selected={on}
              onClick={() => {
                setActive(t.value);
                onChange?.(t.value);
              }}
              className={cn(
                "state-layer inline-flex h-9 items-center gap-2 rounded-full px-4 text-label-lg font-medium",
                on ? "bg-surface-container-lowest text-on-surface shadow-1" : "text-on-surface-variant",
              )}
            >
              {t.label}
              {t.count !== undefined && <CountBadge count={t.count} />}
            </button>
          );
        })}
      </div>
      {panel && <div role="tabpanel">{panel}</div>}
    </div>
  );
}
