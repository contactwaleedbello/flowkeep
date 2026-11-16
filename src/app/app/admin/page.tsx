"use client";

import { useState } from "react";
import { Plus, ShieldCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { assignedPoints, fmtDateTime, userById, wpById } from "@/lib/demo/logic";
import { useDemo } from "@/lib/demo/store";
import type { Role, WaterPoint } from "@/lib/demo/types";
import { DesktopShell, Dialog, PageHeader } from "@/components/app/chrome";
import { ROLE_LABEL } from "@/components/app/fault-bits";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Chip, CountBadge } from "@/components/ui/status-pill";
import { SelectField, TextField } from "@/components/ui/text-field";

type Tab = "points" | "people" | "corrections" | "access";

const th = "px-4 py-3 font-medium";
const td = "px-4 py-3";

export default function Admin() {
  const demo = useDemo();
  const { state } = demo;
  const [tab, setTab] = useState<Tab>("points");
  const [dialog, setDialog] = useState<null | "point" | "invite" | { consent: string }>(null);

  const tabs: Array<[Tab, string, number]> = [
    ["points", "Water points", state.waterPoints.length],
    ["people", "People and roles", state.users.length],
    ["corrections", "Correction log", state.corrections.length],
    ["access", "Phone access log", state.phoneAccessLog.length],
  ];

  return (
    <DesktopShell role="admin">
      <PageHeader
        title="Admin"
        sub={state.organisation.name}
        actions={
          tab === "points" ? (
            <Button leadingIcon={<Plus aria-hidden className="size-4" />} onClick={() => setDialog("point")}>Add water point</Button>
          ) : tab === "people" ? (
            <Button leadingIcon={<UserPlus aria-hidden className="size-4" />} onClick={() => setDialog("invite")}>Invite person</Button>
          ) : undefined
        }
      />
      <div role="tablist" className="mb-6 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-surface-container p-1">
        {tabs.map(([key, text, count]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full px-4 text-label-lg whitespace-nowrap",
              tab === key ? "bg-surface-container-lowest font-medium text-on-surface shadow-1 dark:bg-surface-container-high" : "text-on-surface-variant",
            )}
          >
            {text} <CountBadge count={count} />
          </button>
        ))}
      </div>

      {tab === "points" && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-body-md">
            <thead className="border-b border-outline-variant/70 text-label-md text-on-surface-variant">
              <tr>
                <th className={th}>ID</th>
                <th className={th}>Name</th>
                <th className={th}>Location</th>
                <th className={th}>Coordinates</th>
                <th className={th}>Sensor point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/70">
              {state.waterPoints.map((w) => (
                <tr key={w.id}>
                  <td className={cn(td, "font-mono text-body-sm text-on-surface-variant")}>{w.externalId}</td>
                  <td className={cn(td, "font-medium text-on-surface")}>{w.name}</td>
                  <td className={cn(td, "text-on-surface-variant")}>{w.community}, {w.lga}, {w.state}</td>
                  <td className={cn(td, "text-on-surface-variant tabular-nums")}>{w.latitude.toFixed(4)}, {w.longitude.toFixed(4)}</td>
                  <td className={cn(td, "text-on-surface-variant")}>{w.installationReference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "people" && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-body-md">
            <thead className="border-b border-outline-variant/70 text-label-md text-on-surface-variant">
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Role</th>
                <th className={th}>Water points</th>
                <th className={th}>Phone</th>
                <th className={th}>Consent</th>
                <th className={th}>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/70">
              {state.users.map((u) => {
                const pts = assignedPoints(state, u.id);
                return (
                  <tr key={u.id}>
                    <td className={cn(td, "font-medium text-on-surface")}>{u.name}</td>
                    <td className={td}><Chip>{ROLE_LABEL[u.role]}</Chip></td>
                    <td className={cn(td, "text-on-surface-variant")}>{pts.map((p) => p.externalId).join(", ") || "—"}</td>
                    <td className={cn(td, "text-on-surface-variant tabular-nums")}>
                      {u.phone ? `${u.phone.slice(0, 4)} ••• ${u.phone.slice(-4)}` : u.hasSmartphone === false ? "No phone" : "—"}
                    </td>
                    <td className={td}>
                      {u.role !== "custodian" ? (
                        <span className="text-on-surface-variant">—</span>
                      ) : u.phoneConsentAt ? (
                        <span className="inline-flex items-center gap-1 text-on-surface">
                          <ShieldCheck aria-hidden className="size-4 text-success" /> {fmtDateTime(u.phoneConsentAt)}
                        </span>
                      ) : u.phone ? (
                        <Button size="sm" variant="outlined" onClick={() => setDialog({ consent: u.id })}>Record consent</Button>
                      ) : (
                        <span className="text-on-surface-variant">No phone stored</span>
                      )}
                    </td>
                    <td className={td}>
                      <Chip tone={u.status === "invited" ? "attention" : "neutral"}>{u.status === "active" ? "Active" : u.status === "invited" ? "Invited" : "Deactivated"}</Chip>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "corrections" && (
        <Card className="overflow-x-auto">
          {state.corrections.length === 0 ? (
            <EmptyState title="No corrections" />
          ) : (
            <table className="w-full min-w-[820px] text-left text-body-md">
              <thead className="border-b border-outline-variant/70 text-label-md text-on-surface-variant">
                <tr>
                  <th className={th}>When</th>
                  <th className={th}>Record</th>
                  <th className={th}>Field</th>
                  <th className={th}>Previous → new</th>
                  <th className={th}>Reason</th>
                  <th className={th}>By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/70">
                {state.corrections.map((c) => (
                  <tr key={c.id}>
                    <td className={cn(td, "whitespace-nowrap text-on-surface-variant")}>{fmtDateTime(c.correctedAt)}</td>
                    <td className={cn(td, "text-on-surface")}>{c.entityType.replace("_", " ")} · {state.faults.find((f) => f.id === c.entityId)?.number ?? c.entityId}</td>
                    <td className={cn(td, "font-mono text-body-sm text-on-surface-variant")}>{c.fieldName}</td>
                    <td className={cn(td, "text-on-surface")}>
                      <span className="text-on-surface-variant line-through">{c.previousValue}</span> → {c.newValue}
                    </td>
                    <td className={cn(td, "text-on-surface-variant")}>{c.reason}</td>
                    <td className={cn(td, "text-on-surface")}>{userById(state, c.correctedById)?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="border-t border-outline-variant/70 px-4 py-3 text-body-sm text-on-surface-variant">Append only. Corrections are never edited or deleted.</p>
        </Card>
      )}

      {tab === "access" && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-body-md">
            <thead className="border-b border-outline-variant/70 text-label-md text-on-surface-variant">
              <tr>
                <th className={th}>When</th>
                <th className={th}>Viewed by</th>
                <th className={th}>Whose number</th>
                <th className={th}>Water point</th>
                <th className={th}>Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/70">
              {state.phoneAccessLog.map((p) => (
                <tr key={p.id}>
                  <td className={cn(td, "whitespace-nowrap text-on-surface-variant")}>{fmtDateTime(p.accessedAt)}</td>
                  <td className={cn(td, "text-on-surface")}>{userById(state, p.viewerId)?.name}</td>
                  <td className={cn(td, "text-on-surface")}>{userById(state, p.subjectId)?.name}</td>
                  <td className={cn(td, "text-on-surface-variant")}>{wpById(state, p.waterPointId)?.externalId}</td>
                  <td className={cn(td, "text-on-surface-variant")}>{p.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-outline-variant/70 px-4 py-3 text-body-sm text-on-surface-variant">
            Every view of a custodian&apos;s phone number is logged. Try &ldquo;Show phone number&rdquo; on a fault record.
          </p>
        </Card>
      )}

      <AddPointDialog open={dialog === "point"} onClose={() => setDialog(null)} onSubmit={(wp) => (demo.addWaterPoint(wp), setDialog(null))} next={state.waterPoints.length + 1} />
      <InviteDialog open={dialog === "invite"} onClose={() => setDialog(null)} onSubmit={(u) => (demo.inviteUser(u), setDialog(null))} />
      <Dialog open={typeof dialog === "object" && dialog !== null} onClose={() => setDialog(null)} title="Record phone consent">
        {typeof dialog === "object" && dialog !== null && (
          <div className="flex flex-col gap-4">
            <p className="text-body-md text-on-surface-variant">
              Confirm that {userById(state, dialog.consent)?.name} agreed to their phone number being stored, for fault follow-up only. Check the
              current data protection rules before the pilot (PRD §16).
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="text" onClick={() => setDialog(null)}>Cancel</Button>
              <Button onClick={() => (demo.recordConsent(dialog.consent, "Fault follow-up"), setDialog(null))}>Record consent</Button>
            </div>
          </div>
        )}
      </Dialog>
    </DesktopShell>
  );
}

function AddPointDialog({ open, onClose, onSubmit, next }: { open: boolean; onClose: () => void; onSubmit: (wp: Omit<WaterPoint, "id">) => void; next: number }) {
  const [f, setF] = useState({ name: "", community: "", lga: "", state: "Adamawa", kind: "Hand pump", lat: "", lng: "", ref: "" });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  return (
    <Dialog open={open} onClose={onClose} title="Add water point">
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            externalId: `WP-${String(next).padStart(2, "0")}`,
            name: f.name,
            community: f.community,
            lga: f.lga,
            state: f.state as WaterPoint["state"],
            kind: f.kind as WaterPoint["kind"],
            latitude: Number(f.lat) || 0,
            longitude: Number(f.lng) || 0,
            installationReference: f.ref,
          });
          setF({ name: "", community: "", lga: "", state: "Adamawa", kind: "Hand pump", lat: "", lng: "", ref: "" });
        }}
      >
        <div className="sm:col-span-2">
          <TextField label="Name" required value={f.name} onChange={set("name")} />
        </div>
        <TextField label="Community" required value={f.community} onChange={set("community")} />
        <TextField label="LGA" required value={f.lga} onChange={set("lga")} />
        <SelectField label="State" value={f.state} onChange={set("state")}>
          <option>Adamawa</option>
          <option>Kaduna</option>
        </SelectField>
        <SelectField label="Type" value={f.kind} onChange={set("kind")}>
          <option>Hand pump</option>
          <option>Solar borehole</option>
          <option>Motorised borehole</option>
        </SelectField>
        <TextField label="Latitude" inputMode="decimal" value={f.lat} onChange={set("lat")} />
        <TextField label="Longitude" inputMode="decimal" value={f.lng} onChange={set("lng")} />
        <div className="sm:col-span-2">
          <TextField label="Sensor point" optional value={f.ref} onChange={set("ref")} helper="Where a future sensor would attach (PRD §15)." />
        </div>
        <p className="text-body-sm text-on-surface-variant sm:col-span-2">Stable ID: WP-{String(next).padStart(2, "0")}. It never changes.</p>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button type="submit">Add</Button>
        </div>
      </form>
    </Dialog>
  );
}

function InviteDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (u: { name: string; role: Role; phone?: string }) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("custodian");
  const [phone, setPhone] = useState("");
  return (
    <Dialog open={open} onClose={onClose} title="Invite a person">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({ name: name.trim(), role, phone: phone.trim() || undefined });
          setName("");
          setPhone("");
        }}
      >
        <TextField label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
        <SelectField label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {Object.entries(ROLE_LABEL).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </SelectField>
        <TextField label="Phone" optional value={phone} onChange={(e) => setPhone(e.target.value)} helper="For custodians, record consent before storing a number." />
        <div className="flex justify-end gap-2">
          <Button variant="text" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!name.trim()}>Invite</Button>
        </div>
      </form>
    </Dialog>
  );
}
