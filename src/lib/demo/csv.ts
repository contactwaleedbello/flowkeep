import { FAULT_STATUS } from "@/lib/fault-status";
import { currentEstimate, custodianOf, label, latestOf, signals, technicianOf, userById, wpById } from "./logic";
import type { DemoState, Fault } from "./types";

/** CSV export (PRD §6 story 15, §12). Runs in the browser; nothing is uploaded. */

const esc = (v: unknown) => {
  const s = v === undefined || v === null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function faultsCsv(state: DemoState, faults: Fault[]) {
  const header = [
    "fault",
    "water_point_id",
    "water_point",
    "community",
    "lga",
    "state",
    "fault_type",
    "status",
    "custodian",
    "assisted_by",
    "technician",
    "estimate_ngn",
    "funding_decision",
    "disbursed_ngn",
    "repair_outcome",
    "water_flowing_confirmed",
    "reported_at",
    "diagnosed_at",
    "decided_at",
    "disbursed_at",
    "repair_reported_at",
    "confirmed_at",
  ];
  const rows = faults.map((f) => {
    const wp = wpById(state, f.waterPointId);
    const sig = Object.fromEntries(signals(f).map((s) => [s.label, s.at ?? ""]));
    const dec = latestOf(f, "decided");
    const conf = latestOf(f, "confirmation");
    return [
      f.number,
      wp?.externalId,
      wp?.name,
      wp?.community,
      wp?.lga,
      wp?.state,
      label(state.faultTypes, f.faultType),
      FAULT_STATUS[f.status].label,
      userById(state, f.custodianId)?.name,
      userById(state, f.assistedById)?.name,
      userById(state, f.technicianId)?.name,
      currentEstimate(f)?.diagnosis?.amount,
      dec?.decision?.decision,
      latestOf(f, "disbursed")?.disbursement?.amount,
      latestOf(f, "repair_outcome")?.outcome,
      conf ? (conf.waterFlowing ? "yes" : "no") : "",
      sig["Reported"],
      sig["Diagnosed"],
      sig["Funding decided"],
      sig["Disbursed"],
      sig["Repair reported"],
      sig["Water confirmed"],
    ];
  });
  return [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const row = (r: unknown[]) => r.map(esc).join(",");

export function waterPointsCsv(state: DemoState) {
  const head = ["water_point_id", "name", "kind", "community", "lga", "state", "latitude", "longitude", "sensor_point", "custodian", "technician", "faults", "archived"];
  const body = state.waterPoints.map((w) => [
    w.externalId, w.name, w.kind, w.community, w.lga, w.state, w.latitude, w.longitude, w.installationReference,
    custodianOf(state, w.id)?.name, technicianOf(state, w.id)?.name,
    state.faults.filter((f) => f.waterPointId === w.id && !f.mergedInto).length, w.archived ? "yes" : "no",
  ]);
  return [head, ...body].map(row).join("\n");
}

/** People without phone numbers: numbers are personal data and leave only through the app. */
export function peopleCsv(state: DemoState) {
  const head = ["name", "role", "status", "water_points", "phone_consent_recorded"];
  const body = state.users.map((u) => [
    u.name, u.role, u.status,
    state.assignments.filter((a) => a.userId === u.id).map((a) => wpById(state, a.waterPointId)?.externalId).join(" "),
    u.phoneConsentAt ? "yes" : u.phone ? "no" : "",
  ]);
  return [head, ...body].map(row).join("\n");
}
