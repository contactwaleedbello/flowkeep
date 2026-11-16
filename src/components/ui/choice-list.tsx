"use client";

import { Check } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface Choice {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

/**
 * Full-width option rows that behave as a radio group.
 * Used where a phone user picks from a short list: fault type, yes/no confirmation.
 * Every option is visible at once (no dropdown), 56px minimum height.
 */
export function ChoiceList({
  legend,
  choices,
  value,
  defaultValue,
  onChange,
  name,
  className,
}: {
  legend: string;
  choices: Choice[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  className?: string;
}) {
  const [internal, setInternal] = useState(defaultValue);
  const selected = value ?? internal;
  const auto = useId();
  const groupName = name ?? auto;

  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      <legend className="mb-2 text-title-md font-semibold text-on-surface">{legend}</legend>
      {choices.map((c) => {
        const active = selected === c.value;
        return (
          <label
            key={c.value}
            className={cn(
              "state-layer flex min-h-14 cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors",
              "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary has-[:focus-visible]:outline-offset-2",
              active
                ? "border-primary bg-primary-container text-on-primary-container"
                : "border-outline-variant bg-surface-container-lowest text-on-surface",
            )}
          >
            <input
              type="radio"
              name={groupName}
              value={c.value}
              checked={active}
              onChange={() => {
                setInternal(c.value);
                onChange?.(c.value);
              }}
              className="sr-only"
            />
            {c.icon && <span className="shrink-0">{c.icon}</span>}
            <span className="flex flex-1 flex-col">
              <span className="text-body-lg font-medium">{c.label}</span>
              {c.description && (
                <span className={cn("text-body-md", active ? "opacity-80" : "text-on-surface-variant")}>{c.description}</span>
              )}
            </span>
            <span
              aria-hidden
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
                active ? "border-primary bg-primary text-on-primary" : "border-outline",
              )}
            >
              {active && <Check className="size-4" strokeWidth={3} />}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
