import {
  Archive,
  Ban,
  Banknote,
  BadgeCheck,
  CircleAlert,
  CircleX,
  Droplet,
  FileText,
  Hammer,
  Package,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/fault-status";

/** Icons used by fault statuses. One icon per status, so status is never colour-only. */
export const STATUS_ICONS: Record<IconName, LucideIcon> = {
  alert: CircleAlert,
  file: FileText,
  "badge-check": BadgeCheck,
  ban: Ban,
  banknote: Banknote,
  package: Package,
  wrench: Wrench,
  "wrench-half": Hammer,
  "x-circle": CircleX,
  droplet: Droplet,
  archive: Archive,
};
