import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Surfaces follow Material 3 tonal elevation.
 * - outlined: lowest container + outline-variant border (default; lists, panels)
 * - filled: container colour, no border (grouped info inside a page)
 * - elevated: lowest container + shadow-2 (floating previews). In dark, lowest equals the page colour,
 *   so it steps up to container-low with an outline ring.
 */
export function Card({
  variant = "outlined",
  className,
  ...props
}: { variant?: "outlined" | "filled" | "elevated" } & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-lg",
        variant === "outlined" && "border border-outline-variant bg-surface-container-lowest",
        variant === "filled" && "bg-surface-container",
        variant === "elevated" && "bg-surface-container-lowest shadow-2 dark:bg-surface-container-low dark:ring-1 dark:ring-outline-variant",
        className,
      )}
      {...props}
    />
  );
}
