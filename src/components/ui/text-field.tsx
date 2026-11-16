"use client";

import { ChevronDown } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const fieldBase =
  "w-full rounded-sm border bg-surface-container-lowest px-3.5 text-body-lg text-on-surface " +
  "placeholder:text-on-surface-variant/70 transition-colors outline-none " +
  "focus:border-primary focus:ring-2 focus:ring-primary/25 disabled:opacity-50";

function FieldShell({
  id,
  label,
  helper,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  helper?: ReactNode;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-lg font-medium text-on-surface">
        {label}
        {optional && <span className="font-normal text-on-surface-variant"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-msg`} className="text-body-sm text-error">
          {error}
        </p>
      ) : helper ? (
        <p id={`${id}-msg`} className="text-body-sm text-on-surface-variant">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

type FieldProps = { label: string; helper?: ReactNode; error?: string; optional?: boolean };

/** Label always sits above the field (never placeholder-only), so it stays visible while typing. */
export function TextField({ label, helper, error, optional, className, id, ...props }: FieldProps & ComponentProps<"input">) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} helper={helper} error={error} optional={optional}>
      <input
        id={fid}
        aria-invalid={!!error || undefined}
        aria-describedby={helper || error ? `${fid}-msg` : undefined}
        className={cn(fieldBase, "h-12", error ? "border-error" : "border-outline", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function TextArea({ label, helper, error, optional, className, id, ...props }: FieldProps & ComponentProps<"textarea">) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} helper={helper} error={error} optional={optional}>
      <textarea
        id={fid}
        aria-invalid={!!error || undefined}
        aria-describedby={helper || error ? `${fid}-msg` : undefined}
        className={cn(fieldBase, "min-h-28 py-3", error ? "border-error" : "border-outline", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  helper,
  error,
  optional,
  className,
  id,
  children,
  ...props
}: FieldProps & ComponentProps<"select">) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <FieldShell id={fid} label={label} helper={helper} error={error} optional={optional}>
      <div className="relative">
        <select
          id={fid}
          aria-invalid={!!error || undefined}
          className={cn(fieldBase, "h-12 appearance-none pr-10", error ? "border-error" : "border-outline", className)}
          {...props}
        >
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-on-surface-variant" />
      </div>
    </FieldShell>
  );
}
