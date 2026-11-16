import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Surfaces follow Material 3 tonal elevation, kept quiet.
 * - outlined: lowest container + hairline border (default; lists, panels)
 * - filled: low container, no border (grouping, bento tiles)
 * - elevated: lowest container + soft wide shadow (floating previews). In dark, lowest equals
 *   the page colour, so it steps up to container-low with a hairline ring.
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
        variant === "outlined" && "border border-outline-variant/80 bg-surface-container-lowest",
        variant === "filled" && "bg-surface-container-low",
        variant === "elevated" &&
          "bg-surface-container-lowest shadow-3 ring-1 ring-outline-variant/60 dark:bg-surface-container-low",
        className,
      )}
      {...props}
    />
  );
}
