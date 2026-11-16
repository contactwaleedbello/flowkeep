/**
 * Fault lifecycle (PRD §11) mapped to design tokens.
 *
 * Rules:
 * - Every status is shown with an icon AND a text label, never colour alone.
 * - Open states use a tinted container. Closed states (service verified, abandoned) use a solid fill.
 * - `waitingOn` drives the grouping of the programme officer's open faults list.
 */

export type FaultStatus =
  | "reported"
  | "estimate_submitted"
  | "funding_approved"
  | "funding_rejected"
  | "funding_disbursed"
  | "awaiting_parts"
  | "repair_reported_complete"
  | "partially_repaired"
  | "repair_failed"
  | "service_verified"
  | "abandoned";

export type StatusTone = "primary" | "attention" | "tertiary" | "neutral" | "success" | "error";

export type WaitingOn = "technician" | "approver" | "custodian" | "officer" | "closed";

export type IconName =
  | "alert"
  | "file"
  | "badge-check"
  | "ban"
  | "banknote"
  | "package"
  | "wrench"
  | "wrench-half"
  | "x-circle"
  | "droplet"
  | "archive";

export interface StatusDefinition {
  label: string;
  tone: StatusTone;
  icon: IconName;
  waitingOn: WaitingOn;
  closed: boolean;
  /** One plain sentence explaining the state, used in tooltips and the record header. */
  description: string;
}

export const FAULT_STATUS: Record<FaultStatus, StatusDefinition> = {
  reported: {
    label: "Reported",
    tone: "attention",
    icon: "alert",
    waitingOn: "technician",
    closed: false,
    description: "A custodian or assisting user reported the fault. No diagnosis yet.",
  },
  estimate_submitted: {
    label: "Estimate submitted",
    tone: "primary",
    icon: "file",
    waitingOn: "approver",
    closed: false,
    description: "A technician recorded a diagnosis and an estimate.",
  },
  funding_approved: {
    label: "Funding approved",
    tone: "tertiary",
    icon: "badge-check",
    waitingOn: "approver",
    closed: false,
    description: "An approver approved the estimate. Money has not moved yet.",
  },
  funding_rejected: {
    label: "Funding rejected",
    tone: "attention",
    icon: "ban",
    waitingOn: "officer",
    closed: false,
    description: "The estimate was rejected. The fault stays open until it is resubmitted or abandoned.",
  },
  funding_disbursed: {
    label: "Funding disbursed",
    tone: "primary",
    icon: "banknote",
    waitingOn: "technician",
    closed: false,
    description: "Money has moved. The repair can go ahead.",
  },
  awaiting_parts: {
    label: "Awaiting parts",
    tone: "attention",
    icon: "package",
    waitingOn: "technician",
    closed: false,
    description: "The technician recorded that parts are not available.",
  },
  repair_reported_complete: {
    label: "Repair reported complete",
    tone: "neutral",
    icon: "wrench",
    waitingOn: "custodian",
    closed: false,
    description: "The technician marked the repair complete. Waiting for the custodian to confirm water flow.",
  },
  partially_repaired: {
    label: "Partially repaired",
    tone: "attention",
    icon: "wrench-half",
    waitingOn: "custodian",
    closed: false,
    description: "The technician marked the repair as partial.",
  },
  repair_failed: {
    label: "Repair failed",
    tone: "error",
    icon: "x-circle",
    waitingOn: "custodian",
    closed: false,
    description: "The repair did not restore water flow, or the technician marked it as failed.",
  },
  service_verified: {
    label: "Service verified",
    tone: "success",
    icon: "droplet",
    waitingOn: "closed",
    closed: true,
    description: "The custodian confirmed water is flowing. This does not confirm the water is safe to drink.",
  },
  abandoned: {
    label: "Abandoned",
    tone: "error",
    icon: "archive",
    waitingOn: "closed",
    closed: true,
    description: "The organisation closed the fault without a repair. A reason is recorded.",
  },
};

export const WAITING_ON_LABEL: Record<WaitingOn, string> = {
  officer: "Needs programme officer",
  approver: "Waiting on approver",
  technician: "Waiting on technician",
  custodian: "Waiting on custodian",
  closed: "Closed",
};

/** Order of groups on the open faults list: the officer's own work first. */
export const WAITING_ON_ORDER: WaitingOn[] = ["officer", "approver", "technician", "custodian"];

/** The six recorded steps shown in the lifecycle stepper. */
export const LIFECYCLE_STEPS = [
  { key: "report", label: "Reported", role: "Custodian" },
  { key: "estimate", label: "Estimate", role: "Technician" },
  { key: "decision", label: "Decision", role: "Approver" },
  { key: "disbursed", label: "Disbursed", role: "Approver" },
  { key: "repair", label: "Repair", role: "Technician" },
  { key: "verified", label: "Water flowing", role: "Custodian" },
] as const;

export type LifecycleStepKey = (typeof LIFECYCLE_STEPS)[number]["key"];
