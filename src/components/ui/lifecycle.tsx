import { Check, CornerUpLeft } from "lucide-react";
import type { ReactNode } from "react";
import { LIFECYCLE_STEPS, type LifecycleStepKey } from "@/lib/fault-status";
import { cn } from "@/lib/cn";

export type StepState = "done" | "current" | "upcoming" | "skipped";

/**
 * Horizontal lifecycle stepper (incident.io pattern) for the fault record header.
 * `reopened` adds a loop-back marker when a fault returned to `reported`, instead of resetting the bar.
 */
export function LifecycleStepper({
  current,
  reopened = 0,
  className,
}: {
  current: LifecycleStepKey | "closed";
  reopened?: number;
  className?: string;
}) {
  const idx = current === "closed" ? LIFECYCLE_STEPS.length : LIFECYCLE_STEPS.findIndex((s) => s.key === current);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <ol className="flex items-start" aria-label="Fault lifecycle">
        {LIFECYCLE_STEPS.map((s, i) => {
          const state: StepState = i < idx ? "done" : i === idx ? "current" : "upcoming";
          return (
            <li key={s.key} className="flex flex-1 flex-col items-center gap-1.5 text-center" aria-current={state === "current" ? "step" : undefined}>
              <div className="flex w-full items-center">
                <span className={cn("h-px flex-1", i === 0 ? "bg-transparent" : i <= idx ? "bg-primary" : "bg-outline-variant")} />
                <StepDot state={state} index={i} />
                <span
                  className={cn(
                    "h-px flex-1",
                    i === LIFECYCLE_STEPS.length - 1 ? "bg-transparent" : i < idx ? "bg-primary" : "bg-outline-variant",
                  )}
                />
              </div>
              <span className={cn("px-0.5 text-label-sm leading-tight sm:text-label-md", state === "upcoming" ? "text-on-surface-variant" : state === "current" ? "font-semibold text-on-surface" : "font-medium text-on-surface")}>
                {s.label}
              </span>
              <span className="hidden font-mono text-[10.5px] text-on-surface-variant sm:block">{s.role}</span>
            </li>
          );
        })}
      </ol>
      {reopened > 0 && (
        <p className="flex items-center gap-1.5 text-body-sm text-on-surface-variant">
          <CornerUpLeft aria-hidden className="size-3.5" />
          Returned to reported {reopened}× after the custodian said water was not flowing
        </p>
      )}
    </div>
  );
}

export function StepDot({ state, index }: { state: StepState; index: number }) {
  if (state === "done")
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
        <Check aria-hidden className="size-3.5" strokeWidth={3} />
      </span>
    );
  if (state === "current")
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-primary bg-surface-container-lowest font-mono text-[11px] font-medium text-primary ring-4 ring-primary/10 dark:bg-surface">
        {index + 1}
      </span>
    );
  return (
    <span className="flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] border-outline-variant bg-surface-container-lowest font-mono text-[11px] text-on-surface-variant dark:bg-surface">
      {index + 1}
    </span>
  );
}

/**
 * Vertical steps for phones (Vestiaire pattern): the current step expands into a card
 * that says what happens next and who acts. Done steps show their time; upcoming steps are muted.
 */
export function VerticalSteps({
  steps,
}: {
  steps: Array<{ title: string; meta?: string; state: StepState; body?: ReactNode }>;
}) {
  return (
    <ol className="flex flex-col">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-6 bottom-0 left-[11.5px] w-px",
                  s.state === "done" ? "bg-primary" : "border-l border-dashed border-outline",
                )}
              />
            )}
            <StepDot state={s.state} index={i} />
            <div
              className={cn(
                "flex flex-1 flex-col gap-1",
                s.state === "current" && "-mt-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-3 shadow-2 dark:bg-surface-container",
              )}
            >
              <span className={cn("text-body-md leading-6", s.state === "upcoming" ? "text-on-surface-variant" : "font-medium text-on-surface")}>{s.title}</span>
              {s.meta && <span className="font-mono text-[11.5px] leading-4 text-on-surface-variant">{s.meta}</span>}
              {s.body && <div className="pt-1 text-body-md text-on-surface">{s.body}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
