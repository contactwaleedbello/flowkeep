"use client";

import { useSyncExternalStore } from "react";

/**
 * Device preferences: theme, text size, motion. Stored per device in localStorage,
 * applied to <html> before first paint by the script in app/layout.tsx.
 */

export type ThemePref = "light" | "dark" | "system";
export type TextPref = "default" | "large";
export type MotionPref = "system" | "reduce";

export interface Prefs {
  theme: ThemePref;
  text: TextPref;
  motion: MotionPref;
}

const DEFAULTS: Prefs = { theme: "system", text: "default", motion: "system" };
const listeners = new Set<() => void>();
let cache: Prefs | null = null;

function read(): Prefs {
  if (cache) return cache;
  try {
    cache = {
      theme: (localStorage.getItem("flowkeep-theme") as ThemePref) || "system",
      text: (localStorage.getItem("flowkeep-text") as TextPref) || "default",
      motion: (localStorage.getItem("flowkeep-motion") as MotionPref) || "system",
    };
  } catch {
    cache = DEFAULTS;
  }
  return cache;
}

function apply(p: Prefs) {
  const d = document.documentElement;
  const dark = p.theme === "dark" || (p.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  d.classList.toggle("dark", dark);
  d.style.fontSize = p.text === "large" ? "112.5%" : "";
  if (p.motion === "reduce") d.dataset.motion = "reduce";
  else delete d.dataset.motion;
}

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]) {
  const next = { ...read(), [key]: value };
  cache = next;
  try {
    localStorage.setItem(`flowkeep-${key}`, value);
  } catch {}
  apply(next);
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // follow the OS when the theme is "system"
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => {
    if (read().theme === "system") apply(read());
    cb();
  };
  mq.addEventListener("change", onChange);
  return () => {
    listeners.delete(cb);
    mq.removeEventListener("change", onChange);
  };
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}

/** Whether dark is showing right now (resolves "system"). */
export function isDarkNow() {
  return document.documentElement.classList.contains("dark");
}
