"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/cn";

/** Flips the `.dark` class defined by tokens.css and remembers the choice. */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem("flowkeep-theme", dark ? "dark" : "light");
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch light or dark theme"
      className={cn("state-layer flex size-10 items-center justify-center rounded-full text-on-surface-variant", className)}
    >
      <Sun aria-hidden className="hidden size-5 dark:block" />
      <Moon aria-hidden className="size-5 dark:hidden" />
    </button>
  );
}
