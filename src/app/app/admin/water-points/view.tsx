"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowUpRight, Download, Plus } from "lucide-react";
import { cn } from "@/lib/cn";
import { openFaultAt } from "@/lib/demo/analytics";
import { downloadCsv } from "@/lib/demo/csv";
import { custodianOf, fmtDate, technicianOf, usersWithRole } from "@/lib/demo/logic";
import { useDemo } from "@/lib/demo/store";
import type { Role, WaterPoint } from "@/lib/demo/types";
import { CellSelect, Sheet, StatStrip } from "@/components/app/admin-ui";
import { InviteDialog } from "@/components/app/admin-dialogs";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { StatusDot } from "@/components/ui/status-pill";
import { SelectField, TextField } from "@/components/ui/text-field";

type Filter = "all" | "open" | "never" | "missing" | "archived";
const INVITE = "__invite__";

export function WaterPointsView() {
  const demo = useDemo();
  const { state } = demo;
  const router = useRouter();
  const params = useSearchParams();
  const filter = (params.get("filter") as Filter) || "all";
  const setFilter = (f: string) => router.replace(f === "all" ? "/app/admin/water-points" : `/app/admin/water-points?filter=${f}`, { scroll: false });

  const [editing, setEditing] = useState<WaterPoint | "new" | null>(null);
  const [invite, setInvite] = useState<{ role: Role; waterPointIds: string[] } | null>(null);

  const active = state.waterPoints.filter((w) => !w.archived);
  const faultsAt = (id: string) => state.faults.filter((f) => f.waterPointId === id && !f.mergedInto);
  const missing = (w: WaterPoint) => !custodianOf(state, w.id) || !technicianOf(state, w.id);
  const counts = {
    all: active.length,
    open: active.filter((w) => openFaultAt(state, w.id)).length,
    never: active.filter((w) => faultsAt(w.id).length === 0).length,
    missing: active.filter(missing).length,
    archived: state.waterPoints.length - active.length,
  };

  const rows = useMemo(() => {
    const list = filter === "archived" ? state.waterPoints.filter((w) => w.archived) : active;
    return list.filter((w) => {
      if (filter === "open") return !!openFaultAt(state, w.id);
      if (filter === "never") return faultsAt(w.id).length === 0;
      if (filter === "missing") return missing(w);
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, filter]);

  const custodians = usersWithRole(state, "custodian");
  const technicians = usersWithRole(state, "technician");

  function assign(wp: WaterPoint, role: "custodian" | "technician", value: string) {
    if (value === INVITE) setInvite({ role, waterPointIds: [wp.id] });
    else demo.setAssignment(wp.id, role, value || null);
  }

  function exportCsv() {
    const head = ["water_point_id", "name", "kind", "community", "lga", "state", "latitude", "longitude", "sensor_point", "custodian", "technician", "faults", "open_fault_status", "archived"];
    const body = state.waterPoints.map((w) => [w.externalId, w.name, w.kind, w.community, w.lga, w.state, w.latitude, w.longitude, w.installationReference, custodianOf(state, w.id)?.name ?? "", technicianOf(state, w.id)?.name ?? "", faultsAt(w.id).length, openFaultAt(state, w.id)?.status ?? "", w.archived ? "yes" : "no"]);
    downloadCsv("flowkeep-water-points.csv", [head, ...body].map((r) => r.map((v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))).join(",")).join("\n"));
  }

  return (
    <DesktopShell role="admin">
      <PageHeader
        title="Water points"
        sub="Assign people right in the table. Open a row to edit or archive."
        actions={
          <>
            <Button variant="outlined" leadingIcon={<Download aria-hidden className="size-4" />} onClick={exportCsv}>
              Export CSV
            </Button>
            <Button leadingIcon={<Plus aria-hidden className="size-4" />} onClick={() => setEditing("new")}>
              Add water point
            </Button>
          </>
        }
      />

      <StatStrip
        className="mb-6"
        active={filter}
        onSelect={(k) => setFilter(k === filter ? "all" : k)}
        items={[
          { key: "all", label: "Water points", value: counts.all },
          { key: "open", label: "With an open fault", value: counts.open },
          { key: "never", label: "Never reported", value: counts.never, hint: "No fault recorded yet" },
          { key: "missing", label: "Missing a person", value: counts.missing, attention: counts.missing > 0 },
          { key: "archived", label: "Archived", value: counts.archived },
        ]}
      />

      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState title={filter === "missing" ? "Every water point has a custodian and a technician" : "No water points here"} body={filter === "all" ? "Add your first water point to start." : undefined} />
        ) : (
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-outline-variant/70 font-mono text-[11px] tracking-wide text-on-surface-variant uppercase">
              <tr>
                <th className="w-20 px-4 py-2.5 font-normal">ID</th>
                <th className="px-4 py-2.5 font-normal">Water point</th>
                <th className="w-48 px-2 py-2.5 font-normal">Custodian</th>
                <th className="w-48 px-2 py-2.5 font-normal">Technician</th>
                <th className="w-52 px-4 py-2.5 font-normal">Now</th>
                <th className="w-16 px-4 py-2.5 text-right font-normal">Faults</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {rows.map((w) => {
                const c = custodianOf(state, w.id);
                const t = technicianOf(state, w.id);
                const open = openFaultAt(state, w.id);
                const n = faultsAt(w.id).length;
                return (
                  <tr key={w.id} className="group cursor-pointer transition-colors hover:bg-surface-container-low" onClick={() => setEditing(w)}>
                    <td className="px-4 py-2 font-mono text-[12px] whitespace-nowrap text-on-surface-variant">{w.externalId}</td>
                    <td className="px-4 py-2">
                      <button type="button" className="text-left" onClick={() => setEditing(w)}>
                        <span className="block text-label-lg font-medium text-on-surface">{w.name}</span>
                        <span className="block text-body-sm text-on-surface-variant">
                          {w.kind} · {w.lga}, {w.state}
                        </span>
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      <CellSelect label={`Custodian for ${w.externalId}`} value={c?.id ?? ""} onChange={(v) => assign(w, "custodian", v)} className={cn(!c && "text-secondary")}>
                        <option value="">{c ? "Unassign" : "Assign…"}</option>
                        {custodians.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                            {u.status === "invited" ? " (invited)" : ""}
                          </option>
                        ))}
                        <option value={INVITE}>+ Invite someone new…</option>
                      </CellSelect>
                    </td>
                    <td className="px-2 py-2">
                      <CellSelect label={`Technician for ${w.externalId}`} value={t?.id ?? ""} onChange={(v) => assign(w, "technician", v)} className={cn(!t && "text-secondary")}>
                        <option value="">{t ? "Unassign" : "Assign…"}</option>
                        {technicians.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                            {u.status === "invited" ? " (invited)" : ""}
                          </option>
                        ))}
                        <option value={INVITE}>+ Invite someone new…</option>
                      </CellSelect>
                    </td>
                    <td className="px-4 py-2">{open ? <StatusDot status={open.status} className="text-label-md" /> : <span className="text-label-md text-on-surface-variant">{n ? "No open fault" : "No faults yet"}</span>}</td>
                    <td className="px-4 py-2 text-right font-mono text-[12px] text-on-surface-variant">{n}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
      <p className="mt-3 text-body-sm text-on-surface-variant">Changing a custodian or technician applies to new faults. Open faults keep their people; the programme officer reassigns those.</p>

      <WaterPointSheet value={editing} onClose={() => setEditing(null)} />
      <InviteDialog open={!!invite} onClose={() => setInvite(null)} preset={invite ?? undefined} />
    </DesktopShell>
  );
}

const EMPTY = { name: "", community: "", lga: "", state: "Adamawa", kind: "Hand pump", latitude: "", longitude: "", installationReference: "" };

/** Add or edit in one side panel (Twenty). "Save and add another" for bulk entry on day one. */
function WaterPointSheet({ value, onClose }: { value: WaterPoint | "new" | null; onClose: () => void }) {
  const demo = useDemo();
  const { state } = demo;
  const wp = value && value !== "new" ? state.waterPoints.find((w) => w.id === value.id) : undefined;
  const isNew = value === "new";
  const nextId = `WP-${String(state.waterPoints.length + 1).padStart(2, "0")}`;
  const [form, setForm] = useState(EMPTY);
  const [reason, setReason] = useState("");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  // load the record into the form when the sheet opens for a different record
  const key = isNew ? "new" : wp?.id ?? null;
  if (key !== loadedFor) {
    setLoadedFor(key);
    setReason("");
    setForm(
      wp
        ? { name: wp.name, community: wp.community, lga: wp.lga, state: wp.state, kind: wp.kind, latitude: String(wp.latitude), longitude: String(wp.longitude), installationReference: wp.installationReference }
        : EMPTY,
    );
  }
  const set = (k: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const payload = () => ({
    name: form.name.trim(),
    community: form.community.trim(),
    lga: form.lga.trim(),
    state: form.state as WaterPoint["state"],
    kind: form.kind as WaterPoint["kind"],
    latitude: Number(form.latitude) || 0,
    longitude: Number(form.longitude) || 0,
    installationReference: form.installationReference.trim(),
  });
  const valid = form.name.trim() && form.community.trim() && form.lga.trim();
  const faults = wp ? state.faults.filter((f) => f.waterPointId === wp.id && !f.mergedInto) : [];

  function save(again: boolean) {
    if (isNew) {
      demo.addWaterPoint({ ...payload(), externalId: nextId });
      if (again) {
        setForm({ ...EMPTY, state: form.state, lga: form.lga, kind: form.kind });
        return;
      }
    } else if (wp) demo.updateWaterPoint(wp.id, payload(), reason.trim() || undefined);
    onClose();
  }

  return (
    <Sheet
      open={!!value}
      onClose={onClose}
      eyebrow={isNew ? `New · ${nextId}` : `${wp?.externalId}${wp?.archived ? " · archived" : ""}`}
      title={isNew ? "Add water point" : wp?.name ?? ""}
      footer={
        <>
          {!isNew && wp && (
            <Button variant="text" className="mr-auto text-error" onClick={() => (demo.setArchived(wp.id, !wp.archived), onClose())}>
              {wp.archived ? "Restore" : "Archive"}
            </Button>
          )}
          {isNew && (
            <Button variant="outlined" disabled={!valid} onClick={() => save(true)} className="mr-auto">
              Save and add another
            </Button>
          )}
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button disabled={!valid} onClick={() => save(false)}>
            Save
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={(e) => (e.preventDefault(), valid && save(false))}>
        {!isNew && wp && (
          <div className="mb-1 grid grid-cols-3 divide-x divide-outline-variant/70 rounded-lg border border-outline-variant/70">
            {[
              ["Faults", faults.length],
              ["Last report", faults.length ? fmtDate([...faults].sort((a, b) => b.eventTime.localeCompare(a.eventTime))[0].eventTime) : "—"],
              ["Open", openFaultAt(state, wp.id)?.number ?? "None"],
            ].map(([k, v]) => (
              <div key={k as string} className="px-3 py-2.5">
                <p className="text-label-md text-on-surface-variant">{k}</p>
                <p className="font-mono text-label-lg text-on-surface">{v}</p>
              </div>
            ))}
          </div>
        )}
        <TextField label="Name" required value={form.name} onChange={set("name")} placeholder="e.g. Malamawa hand pump" />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Community" required value={form.community} onChange={set("community")} />
          <TextField label="LGA" required value={form.lga} onChange={set("lga")} />
          <SelectField label="State" value={form.state} onChange={set("state")}>
            <option>Adamawa</option>
            <option>Kaduna</option>
          </SelectField>
          <SelectField label="Type" value={form.kind} onChange={set("kind")}>
            <option>Hand pump</option>
            <option>Solar borehole</option>
            <option>Motorised borehole</option>
          </SelectField>
          <TextField label="Latitude" inputMode="decimal" value={form.latitude} onChange={set("latitude")} />
          <TextField label="Longitude" inputMode="decimal" value={form.longitude} onChange={set("longitude")} />
        </div>
        <TextField label="Sensor point" optional value={form.installationReference} onChange={set("installationReference")} helper="Where a future sensor would attach (PRD §15)." />
        {!isNew && <TextField label="Reason for change" optional value={reason} onChange={(e) => setReason(e.target.value)} helper="Saved with each changed field in the activity log." />}
        {!isNew && wp && (
          <Link href={`/app/water-points/${wp.id}`} className="inline-flex w-fit items-center gap-1 text-label-lg font-medium text-primary">
            Fault history <ArrowUpRight aria-hidden className="size-3.5" />
          </Link>
        )}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}
