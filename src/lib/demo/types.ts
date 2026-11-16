import type { FaultStatus } from "@/lib/fault-status";

/** Data model for the front-end demo. Mirrors PRD §8, simplified: no backend, stored in the browser. */

export type Role = "custodian" | "assisting_user" | "technician" | "approver" | "programme_officer" | "admin";

export interface User {
  id: string;
  name: string;
  role: Role;
  phone?: string;
  phoneConsentAt?: string;
  phoneConsentPurpose?: string;
  /** Custodians without a smartphone report through an assisting user. */
  hasSmartphone?: boolean;
  status: "active" | "invited" | "deactivated";
}

export interface WaterPoint {
  id: string;
  externalId: string;
  name: string;
  kind: "Hand pump" | "Solar borehole" | "Motorised borehole";
  community: string;
  lga: string;
  state: "Adamawa" | "Kaduna";
  latitude: number;
  longitude: number;
  installationReference: string;
  archived?: boolean;
}

export interface Assignment {
  waterPointId: string;
  userId: string;
  roleOnPoint: "custodian" | "assisting_user" | "technician";
}

export type FaultEventKind =
  | "reported"
  | "diagnosed"
  | "decided"
  | "disbursed"
  | "awaiting_parts"
  | "repair_outcome"
  | "confirmation"
  | "abandoned"
  | "reassigned"
  | "revision_requested"
  | "escalated"
  | "merged";

export interface FaultEvent {
  id: string;
  kind: FaultEventKind;
  actorId: string;
  from?: FaultStatus;
  to?: FaultStatus;
  /** Set on the device when the user acted (PRD §9). */
  eventTime: string;
  /** Set by the server on arrival. Undefined = still in the phone's sync queue. */
  syncedAt?: string;
  note?: string;
  diagnosis?: { category: string; parts: string; amount: number; currency: "NGN" };
  decision?: { decision: "approved" | "rejected"; funderSource: string };
  disbursement?: { amount: number; currency: "NGN" };
  outcome?: "complete" | "partial" | "failed";
  waterFlowing?: boolean;
  reassigned?: { roleOnFault: "technician" | "custodian"; fromId: string; toId: string };
  /** A later diagnosis replaced this one. Kept on the record, never deleted. */
  superseded?: boolean;
}

export interface Fault {
  id: string;
  number: string;
  waterPointId: string;
  faultType: string;
  note?: string;
  status: FaultStatus;
  custodianId: string;
  /** Present when an assisting user reported on the custodian's behalf. */
  assistedById?: string;
  technicianId: string;
  eventTime: string;
  syncedAt?: string;
  events: FaultEvent[];
  /** Set when this fault was merged into another (PRD §12). The record is kept, never deleted. */
  mergedInto?: string;
  /** Additional reporters carried over by a merge (fault_reporters). */
  extraReporterIds?: string[];
}

export interface Correction {
  id: string;
  entityType: "fault" | "funding_decision" | "water_point" | "user" | "assignment" | "setting";
  entityId: string;
  fieldName: string;
  previousValue: string;
  newValue: string;
  reason: string;
  correctedById: string;
  correctedAt: string;
}

export interface PhoneAccess {
  id: string;
  viewerId: string;
  subjectId: string;
  waterPointId: string;
  purpose: string;
  accessedAt: string;
}

export interface Option {
  value: string;
  label: string;
  /** Hidden from new reports. Kept so old records still read correctly. */
  archived?: boolean;
}

/** Organisation settings an admin can change (Settings page). */
export interface OrgSettings {
  /** Days before the sync bar warns about old unsynced entries. The queue cap itself is 14 (PRD §9). */
  syncWarnDays: number;
  /** Window for flagging two reports at one water point as a possible duplicate. */
  duplicateWindowHours: number;
  /** Our recommendation; the PRD makes the rejection note optional. */
  requireRejectReason: boolean;
  defaultConsentPurpose: string;
  /** Languages field users read. Planning input for translations (PRD Q6). */
  languages: string[];
}

export const DEFAULT_SETTINGS: OrgSettings = {
  syncWarnDays: 10,
  duplicateWindowHours: 72,
  requireRejectReason: true,
  defaultConsentPurpose: "Fault follow-up",
  languages: ["English", "Hausa"],
};

export interface DemoState {
  version: 2;
  organisation: { id: string; name: string };
  users: User[];
  waterPoints: WaterPoint[];
  assignments: Assignment[];
  faults: Fault[];
  corrections: Correction[];
  phoneAccessLog: PhoneAccess[];
  faultTypes: Option[];
  diagnosisCategories: Option[];
  online: boolean;
  lastSyncAt?: string;
  nextFaultNumber: number;
  /** Usage signal for PRD §14 risk 2: when the officer's open faults list was opened. */
  officerListOpens: string[];
  settings: OrgSettings;
}
