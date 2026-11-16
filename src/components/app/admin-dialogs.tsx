"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { useDemo } from "@/lib/demo/store";
import type { Role } from "@/lib/demo/types";
import { Dialog } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { SelectField, TextField } from "@/components/ui/text-field";

export const ROLE_INFO: Record<Role, { label: string; help: string }> = {
  custodian: { label: "Custodian", help: "Lives near a water point. Reports faults and confirms water is flowing." },
  assisting_user: { label: "Assisting user", help: "Reports on behalf of custodians without a smartphone." },
  technician: { label: "Technician", help: "Diagnoses, estimates and records repairs." },
  approver: { label: "Approver", help: "Approves funding and records disbursements." },
  programme_officer: { label: "Programme officer", help: "Follows every open fault and acts when one stalls." },
  admin: { label: "Admin", help: "Manages water points, people, roles and consent." },
};

const PLACE_ROLES: Role[] = ["custodian", "assisting_user", "technician"];

/**
 * Invite one person (Dub/Browserbase pattern): name, phone, role with a plain description,
 * and their water points in the same step. Opening it from an assignment cell pre-fills
 * the role and the water point, so "invite and assign" is one form.
 */
export function InviteDialog({
  open,
  onClose,
  preset,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  preset?: { role?: Role; waterPointIds?: string[] };
  onInvited?: (userId: string) => void;
}) {
  const { state, inviteUser } = useDemo();
  return (
    <Dialog open={open} onClose={onClose} title={preset?.waterPointIds?.length ? "Invite and assign" : "Invite a person"}>
      {open && <InviteForm key={JSON.stringify(preset)} preset={preset} points={state.waterPoints.filter((w) => !w.archived)} onCancel={onClose} onSubmit={(u, pts, again) => {
        const created = inviteUser(u, { waterPointIds: pts });
        onInvited?.(created.id);
        if (!again) onClose();
      }} />}
    </Dialog>
  );
}

function InviteForm({
  preset,
  points,
  onCancel,
  onSubmit,
}: {
  preset?: { role?: Role; waterPointIds?: string[] };
  points: Array<{ id: string; externalId: string; name: string }>;
  onCancel: () => void;
  onSubmit: (u: { name: string; role: Role; phone?: string }, waterPointIds: string[], again: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>(preset?.role ?? "custodian");
  const [pts, setPts] = useState<string[]>(preset?.waterPointIds ?? []);
  const placeRole = PLACE_ROLES.includes(role);

  function submit(again: boolean) {
    onSubmit({ name: name.trim(), role, phone: phone.trim() || undefined }, placeRole ? pts : [], again);
    setName("");
    setPhone("");
    if (!preset?.waterPointIds) setPts([]);
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit(false);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" required value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <TextField label="Phone" optional value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
      </div>
      <div className="flex flex-col gap-1.5">
        <SelectField label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {(Object.keys(ROLE_INFO) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_INFO[r].label}
            </option>
          ))}
        </SelectField>
        <p className="text-body-sm text-on-surface-variant">{ROLE_INFO[role].help}</p>
      </div>
      {placeRole && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-label-lg font-medium text-on-surface">
            Water points <span className="font-normal text-on-surface-variant">(optional)</span>
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {points.map((p) => {
              const on = pts.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  title={p.name}
                  onClick={() => setPts(on ? pts.filter((x) => x !== p.id) : [...pts, p.id])}
                  className={cn(
                    "h-7 rounded-sm border px-2 font-mono text-[12px] transition-colors",
                    on ? "border-primary bg-primary text-on-primary" : "border-outline-variant text-on-surface-variant hover:text-on-surface",
                  )}
                >
                  {p.externalId}
                </button>
              );
            })}
          </div>
          {role !== "assisting_user" && pts.length > 0 && (
            <p className="text-body-sm text-on-surface-variant">Each water point has one {ROLE_INFO[role].label.toLowerCase()}. This replaces whoever is assigned now.</p>
          )}
        </fieldset>
      )}
      {role === "custodian" && phone.trim() && (
        <p className="rounded-md bg-secondary-container px-3 py-2 text-body-sm text-on-secondary-container">Record phone consent before relying on this number (PRD §10).</p>
      )}
      <div className="flex flex-wrap justify-end gap-2 pt-1">
        <Button variant="text" onClick={onCancel}>Cancel</Button>
        <Button variant="outlined" disabled={!name.trim()} onClick={() => submit(true)}>Invite and add another</Button>
        <Button type="submit" disabled={!name.trim()}>Invite</Button>
      </div>
    </form>
  );
}

export function ConsentDialog({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const { state, recordConsent } = useDemo();
  const u = state.users.find((x) => x.id === userId);
  const [purpose, setPurpose] = useState("Fault follow-up");
  return (
    <Dialog open={!!userId} onClose={onClose} title="Record phone consent">
      {u && (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            recordConsent(u.id, purpose);
            onClose();
          }}
        >
          <p className="text-body-md text-on-surface-variant">
            Confirm that <strong className="text-on-surface">{u.name}</strong> agreed to their phone number being stored and used only for the purpose
            below. Date and time are recorded now.
          </p>
          <SelectField label="Purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)}>
            <option>Fault follow-up</option>
            <option>Fault follow-up and restoration checks</option>
          </SelectField>
          <p className="text-body-sm text-on-surface-variant">Check the current Nigerian data protection rules before the pilot (PRD §16).</p>
          <div className="flex justify-end gap-2">
            <Button variant="text" onClick={onClose}>Cancel</Button>
            <Button type="submit">Record consent</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
