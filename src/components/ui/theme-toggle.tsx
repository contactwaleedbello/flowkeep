"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { isDarkNow, setPref } from "@/lib/preferences";

/** Quick switch between light and dark. Settings → Appearance also offers "System". */
export function ThemeToggle({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => setPref("theme", isDarkNow() ? "light" : "dark")}
      aria-label="Switch light or dark theme"
      className={cn("state-layer flex size-10 items-center justify-center rounded-full text-on-surface-variant", className)}
    >
      <Sun aria-hidden className="hidden size-5 dark:block" />
      <Moon aria-hidden className="size-5 dark:hidden" />
    </button>
  );
}
