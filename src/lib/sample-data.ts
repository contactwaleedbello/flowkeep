import type { FaultStatus } from "./fault-status";
import type { TimelineEvent } from "@/components/ui/timeline";

/**
 * SAMPLE DATA for the design system and marketing previews only.
 * Names, places and amounts are illustrative. They are not pilot data or research findings.
 */

export interface SampleFault {
  id: string;
  waterPoint: string;
  community: string;
  faultType: string;
  status: FaultStatus;
  daysInState: number;
  assignee: string;
  synced: boolean;
}

export const SAMPLE_FAULTS: SampleFault[] = [
  { id: "F-031", waterPoint: "WP-07 Hand pump", community: "Kofar Arewa", faultType: "No water", status: "funding_rejected", daysInState: 3, assignee: "You", synced: true },
  { id: "F-032", waterPoint: "WP-01 Hand pump", community: "Kofar Gabas", faultType: "Leaking pipe", status: "estimate_submitted", daysInState: 2, assignee: "H. Bello", synced: true },
  { id: "F-030", waterPoint: "WP-05 Hand pump", community: "Tudun Wada", faultType: "Broken handle", status: "funding_approved", daysInState: 2, assignee: "H. Bello", synced: true },
  { id: "F-033", waterPoint: "WP-09 Hand pump", community: "Gidan Kwano", faultType: "No water", status: "reported", daysInState: 1, assignee: "S. Danjuma", synced: false },
  { id: "F-027", waterPoint: "WP-04 Solar borehole", community: "Sabon Layi", faultType: "Pump not starting", status: "awaiting_parts", daysInState: 9, assignee: "S. Danjuma", synced: true },
  { id: "F-029", waterPoint: "WP-02 Solar borehole", community: "Unguwan Dutse", faultType: "No water", status: "repair_reported_complete", daysInState: 1, assignee: "A. Yusuf", synced: false },
];

export const SAMPLE_TIMELINE: TimelineEvent[] = [
  {
    actor: "Amina Yusuf",
    role: "Custodian",
    action: "reported no water at WP-02",
    to: "reported",
    eventTime: "4 Nov, 07:12",
    syncedAt: "4 Nov, 09:40",
  },
  {
    actor: "Sani Danjuma",
    role: "Technician",
    action: "recorded a diagnosis: rising main cracked. Estimate ₦184,000.",
    from: "reported",
    to: "estimate_submitted",
    eventTime: "6 Nov, 15:30",
    syncedAt: "6 Nov, 18:02",
  },
  {
    actor: "Halima Bello",
    role: "Approver",
    action: "approved funding from the maintenance budget",
    from: "estimate_submitted",
    to: "funding_approved",
    eventTime: "8 Nov, 10:05",
    syncedAt: "8 Nov, 10:05",
  },
  {
    actor: "Halima Bello",
    role: "Approver",
    action: "recorded a disbursement of ₦184,000",
    from: "funding_approved",
    to: "funding_disbursed",
    eventTime: "11 Nov, 12:20",
    syncedAt: "11 Nov, 12:21",
  },
  {
    actor: "Sani Danjuma",
    role: "Technician",
    action: "marked the repair complete",
    from: "funding_disbursed",
    to: "repair_reported_complete",
    eventTime: "13 Nov, 16:48",
  },
];

export const SAMPLE_TIMESTAMPS = [
  { label: "Reported", value: "4 Nov, 07:12" },
  { label: "Diagnosed", value: "6 Nov, 15:30", gap: "2 d 8 h" },
  { label: "Funding decided", value: "8 Nov, 10:05", gap: "1 d 19 h" },
  { label: "Disbursed", value: "11 Nov, 12:20", gap: "3 d 2 h" },
  { label: "Repair reported", value: "13 Nov, 16:48", gap: "2 d 4 h" },
  { label: "Water confirmed", value: null },
];

export const FAULT_TYPES = [
  { value: "no_water", label: "No water comes out" },
  { value: "low_flow", label: "Water flow is weak" },
  { value: "broken_handle", label: "Handle or pump is broken" },
  { value: "leak", label: "Pipe or tap is leaking" },
  { value: "other", label: "Something else" },
];
