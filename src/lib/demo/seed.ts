import type { FaultStatus } from "@/lib/fault-status";
import { DEFAULT_SETTINGS, type DemoState, type Fault, type FaultEvent } from "./types";

/**
 * DEMO SEED. Fictional people, places and amounts for the front-end prototype.
 * Not pilot data, not research. Times are West Africa Time (UTC+1).
 */

const t = (s: string) => `${s}:00+01:00`;
/** Synced a little after the event, as if it uploaded on the next connection. */
const later = (iso: string, minutes: number) => new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();

let n = 0;
function ev(
  kind: FaultEvent["kind"],
  actorId: string,
  time: string,
  from: FaultStatus | undefined,
  to: FaultStatus | undefined,
  extra: Partial<FaultEvent> & { syncMinutes?: number | null } = {},
): FaultEvent {
  const { syncMinutes = 30, ...rest } = extra;
  const eventTime = t(time);
  return {
    id: `e${++n}`,
    kind,
    actorId,
    eventTime,
    syncedAt: syncMinutes === null ? undefined : later(eventTime, syncMinutes),
    from,
    to,
    ...rest,
  };
}

const NGN = "NGN" as const;

const faults: Fault[] = [
  {
    id: "f-029",
    number: "F-029",
    waterPointId: "wp-02",
    faultType: "no_water",
    note: "Pump runs but nothing comes out.",
    status: "repair_reported_complete",
    custodianId: "u-amina",
    technicianId: "u-sani",
    eventTime: t("2026-11-04T07:12"),
    syncedAt: later(t("2026-11-04T07:12"), 148),
    events: [
      ev("reported", "u-amina", "2026-11-04T07:12", undefined, "reported", { note: "Pump runs but nothing comes out.", syncMinutes: 148 }),
      ev("diagnosed", "u-sani", "2026-11-06T15:30", "reported", "estimate_submitted", {
        diagnosis: { category: "rising_main", parts: "2 × 3 m galvanised pipe, couplings", amount: 184000, currency: NGN },
        syncMinutes: 152,
      }),
      ev("decided", "u-halima", "2026-11-08T10:05", "estimate_submitted", "funding_approved", {
        decision: { decision: "approved", funderSource: "Maintenance budget 2026" },
        syncMinutes: 0,
      }),
      ev("disbursed", "u-halima", "2026-11-11T12:20", "funding_approved", "funding_disbursed", {
        disbursement: { amount: 184000, currency: NGN },
        note: "Paid to technician by transfer.",
        syncMinutes: 1,
      }),
      ev("repair_outcome", "u-sani", "2026-11-13T16:48", "funding_disbursed", "repair_reported_complete", {
        outcome: "complete",
        note: "Replaced cracked section of rising main.",
        syncMinutes: null,
      }),
    ],
  },
  {
    id: "f-032",
    number: "F-032",
    waterPointId: "wp-01",
    faultType: "leak",
    status: "estimate_submitted",
    custodianId: "u-rahila",
    technicianId: "u-sani",
    eventTime: t("2026-11-12T08:40"),
    syncedAt: later(t("2026-11-12T08:40"), 20),
    events: [
      ev("reported", "u-rahila", "2026-11-12T08:40", undefined, "reported", { syncMinutes: 20 }),
      ev("diagnosed", "u-sani", "2026-11-14T11:15", "reported", "estimate_submitted", {
        diagnosis: { category: "riser_pipe", parts: "1 × 3 m riser pipe, 2 couplings", amount: 62500, currency: NGN },
      }),
    ],
  },
  {
    id: "f-030",
    number: "F-030",
    waterPointId: "wp-05",
    faultType: "broken_handle",
    status: "funding_approved",
    custodianId: "u-grace",
    technicianId: "u-ibrahim",
    eventTime: t("2026-11-07T17:05"),
    syncedAt: later(t("2026-11-07T17:05"), 45),
    events: [
      ev("reported", "u-grace", "2026-11-07T17:05", undefined, "reported", { syncMinutes: 45 }),
      ev("diagnosed", "u-ibrahim", "2026-11-10T09:30", "reported", "estimate_submitted", {
        diagnosis: { category: "pump_head", parts: "Handle bearing set, fulcrum pin", amount: 38000, currency: NGN },
      }),
      ev("decided", "u-halima", "2026-11-14T14:00", "estimate_submitted", "funding_approved", {
        decision: { decision: "approved", funderSource: "Maintenance budget 2026" },
        syncMinutes: 0,
      }),
    ],
  },
  {
    id: "f-031",
    number: "F-031",
    waterPointId: "wp-07",
    faultType: "no_water",
    status: "funding_rejected",
    custodianId: "u-musa",
    technicianId: "u-sani",
    eventTime: t("2026-11-05T06:50"),
    syncedAt: later(t("2026-11-05T06:50"), 300),
    events: [
      ev("reported", "u-musa", "2026-11-05T06:50", undefined, "reported", { syncMinutes: 300 }),
      ev("diagnosed", "u-sani", "2026-11-09T13:10", "reported", "estimate_submitted", {
        diagnosis: { category: "pump_cylinder", parts: "Full cylinder replacement, 6 rods", amount: 420000, currency: NGN },
      }),
      ev("decided", "u-halima", "2026-11-13T10:30", "estimate_submitted", "funding_rejected", {
        decision: { decision: "rejected", funderSource: "Maintenance budget 2026" },
        note: "Above the per-repair limit. Please get a second quote or a cheaper option.",
        syncMinutes: 0,
      }),
    ],
  },
  {
    id: "f-033",
    number: "F-033",
    waterPointId: "wp-09",
    faultType: "no_water",
    note: "Reported by phone call to the WASH committee.",
    status: "reported",
    custodianId: "u-bitrus",
    assistedById: "u-zainab",
    technicianId: "u-sani",
    eventTime: t("2026-11-15T08:05"),
    events: [
      ev("reported", "u-zainab", "2026-11-15T08:05", undefined, "reported", {
        note: "Reported by phone call to the WASH committee.",
        syncMinutes: null,
      }),
    ],
  },
  {
    id: "f-027",
    number: "F-027",
    waterPointId: "wp-04",
    faultType: "pump_not_starting",
    status: "awaiting_parts",
    custodianId: "u-usman",
    technicianId: "u-ibrahim",
    eventTime: t("2026-10-24T10:00"),
    syncedAt: later(t("2026-10-24T10:00"), 30),
    events: [
      ev("reported", "u-usman", "2026-10-24T10:00", undefined, "reported"),
      ev("diagnosed", "u-ibrahim", "2026-10-26T12:00", "reported", "estimate_submitted", {
        diagnosis: { category: "solar_controller", parts: "Solar pump controller (1.5 kW)", amount: 265000, currency: NGN },
      }),
      ev("decided", "u-halima", "2026-10-29T09:00", "estimate_submitted", "funding_approved", {
        decision: { decision: "approved", funderSource: "Emergency repair fund" },
        syncMinutes: 0,
      }),
      ev("disbursed", "u-halima", "2026-11-03T11:45", "funding_approved", "funding_disbursed", {
        disbursement: { amount: 265000, currency: NGN },
        syncMinutes: 0,
      }),
      ev("awaiting_parts", "u-ibrahim", "2026-11-07T15:20", "funding_disbursed", "awaiting_parts", {
        note: "Controller not in stock in Yola. Ordered from Kaduna.",
      }),
    ],
  },
  {
    // Likely duplicate of F-031: same water point, reported a day later by the assisting user.
    id: "f-034",
    number: "F-034",
    waterPointId: "wp-07",
    faultType: "no_water",
    note: "Musa called the committee: pump gives no water.",
    status: "reported",
    custodianId: "u-musa",
    assistedById: "u-zainab",
    technicianId: "u-sani",
    eventTime: t("2026-11-06T09:30"),
    syncedAt: later(t("2026-11-06T09:30"), 40),
    events: [
      ev("reported", "u-zainab", "2026-11-06T09:30", undefined, "reported", { note: "Musa called the committee: pump gives no water.", syncMinutes: 40 }),
    ],
  },
  /* ---- closed history ---- */
  {
    id: "f-021",
    number: "F-021",
    waterPointId: "wp-02",
    faultType: "leak",
    status: "service_verified",
    custodianId: "u-amina",
    technicianId: "u-sani",
    eventTime: t("2026-09-12T16:30"),
    syncedAt: later(t("2026-09-12T16:30"), 60),
    events: [
      ev("reported", "u-amina", "2026-09-12T16:30", undefined, "reported", { syncMinutes: 60 }),
      ev("diagnosed", "u-sani", "2026-09-14T10:00", "reported", "estimate_submitted", {
        diagnosis: { category: "pipework", parts: "Tap and union joint", amount: 14500, currency: NGN },
      }),
      ev("decided", "u-halima", "2026-09-15T09:20", "estimate_submitted", "funding_approved", {
        decision: { decision: "approved", funderSource: "Maintenance budget 2026" },
        syncMinutes: 0,
      }),
      ev("disbursed", "u-halima", "2026-09-16T13:00", "funding_approved", "funding_disbursed", {
        disbursement: { amount: 14500, currency: NGN },
        syncMinutes: 0,
      }),
      ev("repair_outcome", "u-sani", "2026-09-18T11:40", "funding_disbursed", "repair_reported_complete", { outcome: "complete" }),
      ev("confirmation", "u-amina", "2026-09-19T07:05", "repair_reported_complete", "service_verified", { waterFlowing: true }),
    ],
  },
  {
    id: "f-024",
    number: "F-024",
    waterPointId: "wp-03",
    faultType: "low_flow",
    status: "service_verified",
    custodianId: "u-rahila",
    technicianId: "u-sani",
    eventTime: t("2026-09-28T09:00"),
    syncedAt: later(t("2026-09-28T09:00"), 30),
    events: [
      ev("reported", "u-rahila", "2026-09-28T09:00", undefined, "reported"),
      ev("diagnosed", "u-sani", "2026-09-30T14:00", "reported", "estimate_submitted", {
        diagnosis: { category: "pump_head", parts: "Cup seals and O-rings", amount: 9000, currency: NGN },
        superseded: true,
      }),
      ev("decided", "u-halima", "2026-10-01T10:00", "estimate_submitted", "funding_approved", {
        decision: { decision: "approved", funderSource: "Maintenance budget 2026" },
        syncMinutes: 0,
      }),
      ev("disbursed", "u-halima", "2026-10-02T10:30", "funding_approved", "funding_disbursed", {
        disbursement: { amount: 9000, currency: NGN },
        syncMinutes: 0,
      }),
      ev("repair_outcome", "u-sani", "2026-10-03T15:00", "funding_disbursed", "repair_reported_complete", { outcome: "complete" }),
      ev("confirmation", "u-rahila", "2026-10-05T07:30", "repair_reported_complete", "reported", {
        waterFlowing: false,
        note: "Flow came back for one day, then weak again.",
      }),
      ev("diagnosed", "u-sani", "2026-10-07T12:00", "reported", "estimate_submitted", {
        diagnosis: { category: "pump_cylinder", parts: "Cylinder and foot valve", amount: 56000, currency: NGN },
      }),
      ev("decided", "u-halima", "2026-10-08T09:40", "estimate_submitted", "funding_approved", {
        decision: { decision: "approved", funderSource: "Maintenance budget 2026" },
        syncMinutes: 0,
      }),
      ev("disbursed", "u-halima", "2026-10-09T12:00", "funding_approved", "funding_disbursed", {
        disbursement: { amount: 56000, currency: NGN },
        syncMinutes: 0,
      }),
      ev("repair_outcome", "u-sani", "2026-10-12T16:10", "funding_disbursed", "repair_reported_complete", { outcome: "complete" }),
      ev("confirmation", "u-rahila", "2026-10-13T06:45", "repair_reported_complete", "service_verified", { waterFlowing: true }),
    ],
  },
  {
    id: "f-025",
    number: "F-025",
    waterPointId: "wp-06",
    faultType: "other",
    note: "Borehole collapsed after flooding.",
    status: "abandoned",
    custodianId: "u-grace",
    technicianId: "u-ibrahim",
    eventTime: t("2026-10-02T12:00"),
    syncedAt: later(t("2026-10-02T12:00"), 30),
    events: [
      ev("reported", "u-grace", "2026-10-02T12:00", undefined, "reported", { note: "Borehole collapsed after flooding." }),
      ev("abandoned", "u-fatima", "2026-10-20T10:00", "reported", "abandoned", {
        note: "Needs re-drilling. Out of scope for maintenance. Referred to the state RUWASSA.",
        syncMinutes: 0,
      }),
    ],
  },
];

export function createSeed(): DemoState {
  return {
    version: 2,
    organisation: { id: "org-1", name: "Sample WASH partner (demo)" },
    users: [
      { id: "u-fatima", name: "Fatima Abubakar", role: "programme_officer", phone: "0803 000 1101", status: "active" },
      { id: "u-halima", name: "Halima Bello", role: "approver", phone: "0803 000 1102", status: "active" },
      { id: "u-sani", name: "Sani Danjuma", role: "technician", phone: "0803 000 1103", status: "active" },
      { id: "u-ibrahim", name: "Ibrahim Garba", role: "technician", phone: "0803 000 1104", status: "active" },
      { id: "u-yakubu", name: "Yakubu Adamu", role: "admin", status: "active" },
      { id: "u-zainab", name: "Zainab Sule", role: "assisting_user", phone: "0803 000 1105", status: "active" },
      { id: "u-amina", name: "Amina Yusuf", role: "custodian", phone: "0803 000 2201", phoneConsentAt: t("2026-08-01T10:00"), phoneConsentPurpose: "Fault follow-up", hasSmartphone: true, status: "active" },
      { id: "u-rahila", name: "Rahila Joseph", role: "custodian", phone: "0803 000 2202", phoneConsentAt: t("2026-08-01T10:20"), phoneConsentPurpose: "Fault follow-up", hasSmartphone: true, status: "active" },
      { id: "u-grace", name: "Grace Ishaya", role: "custodian", phone: "0803 000 2203", phoneConsentAt: t("2026-08-02T09:00"), phoneConsentPurpose: "Fault follow-up", hasSmartphone: true, status: "active" },
      { id: "u-musa", name: "Musa Tanko", role: "custodian", phone: "0803 000 2204", hasSmartphone: true, status: "active" },
      { id: "u-usman", name: "Usman Lawal", role: "custodian", phone: "0803 000 2205", phoneConsentAt: t("2026-08-03T11:00"), phoneConsentPurpose: "Fault follow-up", hasSmartphone: true, status: "active" },
      { id: "u-bitrus", name: "Bitrus Audu", role: "custodian", hasSmartphone: false, status: "active" },
      { id: "u-esther", name: "Esther Danladi", role: "custodian", hasSmartphone: true, status: "invited" },
    ],
    waterPoints: [
      { id: "wp-01", externalId: "WP-01", name: "Kofar Gabas hand pump", kind: "Hand pump", community: "Kofar Gabas", lga: "Zaria", state: "Kaduna", latitude: 11.0855, longitude: 7.7199, installationReference: "Pump head, north side of slab" },
      { id: "wp-02", externalId: "WP-02", name: "Unguwan Dutse solar borehole", kind: "Solar borehole", community: "Unguwan Dutse", lga: "Chikun", state: "Kaduna", latitude: 10.4469, longitude: 7.3542, installationReference: "Controller box on panel mast" },
      { id: "wp-03", externalId: "WP-03", name: "Barnawa hand pump", kind: "Hand pump", community: "Barnawa", lga: "Chikun", state: "Kaduna", latitude: 10.4931, longitude: 7.4205, installationReference: "Pump head, east side" },
      { id: "wp-04", externalId: "WP-04", name: "Sabon Layi solar borehole", kind: "Solar borehole", community: "Sabon Layi", lga: "Yola South", state: "Adamawa", latitude: 9.2035, longitude: 12.4954, installationReference: "Controller box inside pump house" },
      { id: "wp-05", externalId: "WP-05", name: "Tudun Wada hand pump", kind: "Hand pump", community: "Tudun Wada", lga: "Girei", state: "Adamawa", latitude: 9.3653, longitude: 12.5481, installationReference: "Pump head, west side" },
      { id: "wp-06", externalId: "WP-06", name: "Jimeta motorised borehole", kind: "Motorised borehole", community: "Jimeta", lga: "Yola North", state: "Adamawa", latitude: 9.2794, longitude: 12.4581, installationReference: "Generator house, meter board" },
      { id: "wp-07", externalId: "WP-07", name: "Kofar Arewa hand pump", kind: "Hand pump", community: "Kofar Arewa", lga: "Zaria", state: "Kaduna", latitude: 11.0901, longitude: 7.7102, installationReference: "Pump head, south side" },
      { id: "wp-08", externalId: "WP-08", name: "Malamawa hand pump", kind: "Hand pump", community: "Malamawa", lga: "Girei", state: "Adamawa", latitude: 9.3801, longitude: 12.5602, installationReference: "Pump head, north side" },
      { id: "wp-09", externalId: "WP-09", name: "Gidan Kwano hand pump", kind: "Hand pump", community: "Gidan Kwano", lga: "Chikun", state: "Kaduna", latitude: 10.4302, longitude: 7.3901, installationReference: "Pump head, east side" },
      { id: "wp-10", externalId: "WP-10", name: "Bachure solar borehole", kind: "Solar borehole", community: "Bachure", lga: "Yola North", state: "Adamawa", latitude: 9.2901, longitude: 12.4402, installationReference: "Controller box on panel mast" },
    ],
    assignments: [
      ...["wp-01", "wp-03"].map((w) => ({ waterPointId: w, userId: "u-rahila", roleOnPoint: "custodian" as const })),
      { waterPointId: "wp-02", userId: "u-amina", roleOnPoint: "custodian" },
      { waterPointId: "wp-04", userId: "u-usman", roleOnPoint: "custodian" },
      { waterPointId: "wp-05", userId: "u-grace", roleOnPoint: "custodian" },
      { waterPointId: "wp-06", userId: "u-grace", roleOnPoint: "custodian" },
      { waterPointId: "wp-07", userId: "u-musa", roleOnPoint: "custodian" },
      { waterPointId: "wp-08", userId: "u-esther", roleOnPoint: "custodian" },
      { waterPointId: "wp-09", userId: "u-bitrus", roleOnPoint: "custodian" },
      { waterPointId: "wp-10", userId: "u-usman", roleOnPoint: "custodian" },
      { waterPointId: "wp-09", userId: "u-zainab", roleOnPoint: "assisting_user" },
      { waterPointId: "wp-07", userId: "u-zainab", roleOnPoint: "assisting_user" },
      ...["wp-01", "wp-02", "wp-03", "wp-07", "wp-09"].map((w) => ({ waterPointId: w, userId: "u-sani", roleOnPoint: "technician" as const })),
      ...["wp-04", "wp-05", "wp-06", "wp-08", "wp-10"].map((w) => ({ waterPointId: w, userId: "u-ibrahim", roleOnPoint: "technician" as const })),
    ],
    faults,
    corrections: [
      {
        id: "c-2",
        entityType: "assignment",
        entityId: "wp-08",
        fieldName: "custodian",
        previousValue: "Not assigned",
        newValue: "Esther Danladi",
        reason: "New custodian chosen by the WASH committee.",
        correctedById: "u-yakubu",
        correctedAt: t("2026-11-02T12:15"),
      },
      {
        id: "c-1",
        entityType: "funding_decision",
        entityId: "f-027",
        fieldName: "funder_source",
        previousValue: "Maintenance budget 2026",
        newValue: "Emergency repair fund",
        reason: "Wrong budget line selected at approval.",
        correctedById: "u-halima",
        correctedAt: t("2026-10-29T09:30"),
      },
    ],
    phoneAccessLog: [
      { id: "p-2", viewerId: "u-sani", subjectId: "u-amina", waterPointId: "wp-02", purpose: "Fault follow-up", accessedAt: t("2026-11-13T15:02") },
      { id: "p-1", viewerId: "u-fatima", subjectId: "u-musa", waterPointId: "wp-07", purpose: "Fault follow-up", accessedAt: t("2026-11-13T11:00") },
      { id: "p-0", viewerId: "u-ibrahim", subjectId: "u-usman", waterPointId: "wp-04", purpose: "Fault follow-up", accessedAt: t("2026-11-03T10:40") },
    ],
    faultTypes: [
      { value: "no_water", label: "No water comes out" },
      { value: "low_flow", label: "Water flow is weak" },
      { value: "broken_handle", label: "Handle or pump is broken" },
      { value: "leak", label: "Pipe or tap is leaking" },
      { value: "pump_not_starting", label: "Pump does not start" },
      { value: "other", label: "Something else" },
    ],
    diagnosisCategories: [
      { value: "pump_head", label: "Pump head" },
      { value: "pump_cylinder", label: "Pump cylinder" },
      { value: "rising_main", label: "Rising main" },
      { value: "riser_pipe", label: "Riser pipe" },
      { value: "pipework", label: "Pipework and taps" },
      { value: "solar_controller", label: "Solar controller" },
      { value: "electrical", label: "Electrical" },
      { value: "other", label: "Other" },
    ],
    online: true,
    lastSyncAt: t("2026-11-15T09:00"),
    nextFaultNumber: 35,
    settings: { ...DEFAULT_SETTINGS },
    officerListOpens: ["2026-11-10T08:12", "2026-11-11T09:40", "2026-11-12T08:05", "2026-11-13T16:20", "2026-11-14T08:31"].map((x) => `${x}:00+01:00`),
  };
}
