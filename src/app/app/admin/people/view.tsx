"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { assignedPoints, fmtDateTime } from "@/lib/demo/logic";
import { useDemo } from "@/lib/demo/store";
import type { Role, User } from "@/lib/demo/types";
import { CellSelect, Meter, Sheet, StatStrip } from "@/components/app/admin-ui";
import { ConsentDialog, InviteDialog, ROLE_INFO } from "@/components/app/admin-dialogs";
import { DesktopShell, PageHeader } from "@/components/app/chrome";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";

type Filter = "active" | "invited" | "deactivated" | "consent";

const ROLE_ORDER: Role[] = ["programme_officer", "approver", "admin", "technician", "assisting_user", "custodian"];
const mask = (p?: string) => (p ? `${p.slice(0, 4)} ••• ${p.slice(-4)}` : "");

export function PeopleView() {
  const demo = useDemo();
  const { state } = demo;
  const router = useRouter();
  const params = useSearchParams();
  const filter = (params.get("filter") as Filter) || "active";
  const setFilter = (f: string) => router.replace(f === "active" ? "/app/admin/people" : `/app/admin/people?filter=${f}`, { scroll: false });
  const [role, setRole] = useState<Role | "all">("all");
  const [inviting, setInviting] = useState(false);
  const [consentFor, setConsentFor] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const custodiansWithPhone = state.users.filter((u) => u.role === "custodian" && u.phone && u.status !== "deactivated");
  const consented = custodiansWithPhone.filter((u) => u.phoneConsentAt);
  const missingConsent = custodiansWithPhone.filter((u) => !u.phoneConsentAt);
  const counts = {
    active: state.users.filter((u) => u.status === "active").length,
    invited: state.users.filter((u) => u.status === "invited").length,
    deactivated: state.users.filter((u) => u.status === "deactivated").length,
  };

  const rows = useMemo(() => {
    const list = filter === "consent" ? missingConsent : state.users.filter((u) => u.status === filter);
    return list
      .filter((u) => role === "all" || u.role === role)
      .sort((a, b) => ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role) || a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, filter, role]);

  const byRole = ROLE_ORDER.map((r) => ({ r, n: state.users.filter((u) => u.role === r && u.status !== "deactivated").length }));

  return (
    <DesktopShell role="admin">
      <PageHeader
        title="People"
        sub="Invite people, set their role and record consent. Open a row for details."
        actions={
          <Button leadingIcon={<UserPlus aria-hidden className="size-4" />} onClick={() => setInviting(true)}>
            Invite person
          </Button>
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_280px]">
        <StatStrip
          active={filter}
          onSelect={(k) => setFilter(k)}
          items={[
            { key: "active", label: "Active", value: counts.active },
            { key: "invited", label: "Invited, not joined", value: counts.invited, attention: counts.invited > 0 },
            { key: "consent", label: "Missing phone consent", value: missingConsent.length, attention: missingConsent.length > 0 },
            { key: "deactivated", label: "Deactivated", value: counts.deactivated },
          ]}
        />
        <Card className="flex flex-col justify-center gap-1 p-4">
          <p className="mb-1 text-label-md text-on-surface-variant">Custodian phone consent</p>
          <Meter x={consented.length} n={custodiansWithPhone.length} label="Custodians with a phone number who gave consent" />
        </Card>
      </div>

      <div role="group" aria-label="Filter by role" className="mb-3 flex flex-wrap gap-1.5">
        {[{ r: "all" as const, n: byRole.reduce((a, b) => a + b.n, 0) }, ...byRole].map(({ r, n }) => (
          <button
            key={r}
            type="button"
            aria-pressed={role === r}
            onClick={() => setRole(r)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-label-md transition-colors",
              role === r ? "border-on-surface bg-on-surface text-surface" : "border-outline-variant text-on-surface-variant hover:text-on-surface",
            )}
          >
            {r === "all" ? "All roles" : ROLE_INFO[r].label}
            <span className="font-mono text-[11px] opacity-70">{n}</span>
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState title={filter === "consent" ? "Every custodian with a phone number has given consent" : "Nobody here"} />
        ) : (
          <table className="w-full min-w-[860px] text-left">
            <thead className="border-b border-outline-variant/70 font-mono text-[11px] tracking-wide text-on-surface-variant uppercase">
              <tr>
                <th className="px-4 py-2.5 font-normal">Name</th>
                <th className="w-48 px-2 py-2.5 font-normal">Role</th>
                <th className="w-44 px-4 py-2.5 font-normal">Water points</th>
                <th className="w-36 px-4 py-2.5 font-normal">Phone</th>
                <th className="w-48 px-4 py-2.5 font-normal">Consent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/50">
              {rows.map((u) => {
                const pts = assignedPoints(state, u.id);
                return (
                  <tr key={u.id} className="cursor-pointer transition-colors hover:bg-surface-container-low" onClick={() => setOpenId(u.id)}>
                    <td className="px-4 py-2">
                      <button type="button" className="flex items-center gap-2.5 text-left" onClick={() => setOpenId(u.id)}>
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-[11px] font-semibold text-on-surface">
                          {u.name.split(" ").map((p) => p[0]).join("")}
                        </span>
                        <span>
                          <span className="block text-label-lg font-medium text-on-surface">{u.name}</span>
                          {u.status === "invited" && <span className="block text-body-sm text-secondary">Invited, not joined</span>}
                        </span>
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      <CellSelect label={`Role for ${u.name}`} value={u.role} onChange={(v) => demo.setRole(u.id, v as Role)}>
                        {(Object.keys(ROLE_INFO) as Role[]).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_INFO[r].label}
                          </option>
                        ))}
                      </CellSelect>
                    </td>
                    <td className="px-4 py-2 font-mono text-[12px] text-on-surface-variant">{pts.map((p) => p.externalId).join(", ") || "—"}</td>
                    <td className="px-4 py-2 font-mono text-[12px] text-on-surface-variant">{u.phone ? mask(u.phone) : u.hasSmartphone === false ? "No phone" : "—"}</td>
                    <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                      {u.role !== "custodian" || !u.phone ? (
                        <span className="text-label-md text-on-surface-variant">Not needed</span>
                      ) : u.phoneConsentAt ? (
                        <span className="inline-flex items-center gap-1.5 text-label-md text-on-surface">
                          <ShieldCheck aria-hidden className="size-3.5 text-success" />
                          <span className="font-mono text-[12px]">{fmtDateTime(u.phoneConsentAt)}</span>
                        </span>
                      ) : (
                        <Button size="sm" variant="outlined" onClick={() => setConsentFor(u.id)}>
                          Record consent
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
      <p className="mt-3 text-body-sm text-on-surface-variant">Phone numbers are masked here. Every full view of a custodian&apos;s number is logged in Activity.</p>

      <PersonSheet userId={openId} onClose={() => setOpenId(null)} onConsent={(id) => setConsentFor(id)} />
      <InviteDialog open={inviting} onClose={() => setInviting(false)} />
      <ConsentDialog userId={consentFor} onClose={() => setConsentFor(null)} />
    </DesktopShell>
  );
}

function PersonSheet({ userId, onClose, onConsent }: { userId: string | null; onClose: () => void; onConsent: (id: string) => void }) {
  const demo = useDemo();
  const { state } = demo;
  const u: User | undefined = state.users.find((x) => x.id === userId);
  const [confirming, setConfirming] = useState(false);
  const pts = u ? assignedPoints(state, u.id) : [];
  const openFaults = u ? state.faults.filter((f) => !f.mergedInto && !["service_verified", "abandoned"].includes(f.status) && (f.technicianId === u.id || f.custodianId === u.id)) : [];
  const close = () => {
    setConfirming(false);
    onClose();
  };
  return (
    <Sheet
      open={!!u}
      onClose={close}
      eyebrow={u ? ROLE_INFO[u.role].label : ""}
      title={u?.name ?? ""}
      footer={
        u && (
          <>
            {u.status === "deactivated" ? (
              <Button variant="outlined" onClick={() => (demo.setUserStatus(u.id, "active"), close())}>Reactivate</Button>
            ) : confirming ? (
              <>
                <span className="mr-auto text-body-sm text-on-surface-variant">They lose access. Their records stay.</span>
                <Button variant="text" onClick={() => setConfirming(false)}>Cancel</Button>
                <Button variant="danger" onClick={() => (demo.setUserStatus(u.id, "deactivated"), close())}>Deactivate</Button>
              </>
            ) : (
              <Button variant="text" className="text-error" onClick={() => setConfirming(true)}>Deactivate</Button>
            )}
          </>
        )
      }
    >
      {u && (
        <div className="flex flex-col gap-6">
          <dl className="grid grid-cols-[120px_1fr] gap-x-4 gap-y-3 text-body-md">
            <dt className="text-on-surface-variant">Status</dt>
            <dd className="text-on-surface">{u.status === "active" ? "Active" : u.status === "invited" ? "Invited, not joined" : "Deactivated"}</dd>
            <dt className="text-on-surface-variant">Role</dt>
            <dd className="text-on-surface">
              {ROLE_INFO[u.role].label}
              <span className="block text-body-sm text-on-surface-variant">{ROLE_INFO[u.role].help}</span>
            </dd>
            <dt className="text-on-surface-variant">Phone</dt>
            <dd className="font-mono text-[13px] text-on-surface">{u.phone ? mask(u.phone) : u.hasSmartphone === false ? "No phone" : "—"}</dd>
            {u.role === "custodian" && u.phone && (
              <>
                <dt className="text-on-surface-variant">Consent</dt>
                <dd className="text-on-surface">
                  {u.phoneConsentAt ? (
                    <>
                      <span className="font-mono text-[13px]">{fmtDateTime(u.phoneConsentAt)}</span>
                      <span className="block text-body-sm text-on-surface-variant">{u.phoneConsentPurpose}</span>
                    </>
                  ) : (
                    <Button size="sm" variant="outlined" onClick={() => onConsent(u.id)}>Record consent</Button>
                  )}
                </dd>
              </>
            )}
          </dl>
          <div className="flex flex-col gap-2">
            <h3 className="text-label-lg font-semibold text-on-surface">Water points</h3>
            {pts.length ? (
              <ul className="divide-y divide-outline-variant/60 rounded-lg border border-outline-variant/70">
                {pts.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-3 py-2 text-body-md">
                    <span className="font-mono text-[12px] text-on-surface-variant">{p.externalId}</span>
                    <span className="flex-1 truncate text-on-surface">{p.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-body-sm text-on-surface-variant">None. Assign water points from the Water points table.</p>
            )}
          </div>
          {openFaults.length > 0 && (
            <p className="rounded-md bg-secondary-container px-3 py-2 text-body-sm text-on-secondary-container">
              {openFaults.length} open {openFaults.length === 1 ? "fault names" : "faults name"} this person. Ask the programme officer to reassign before deactivating.
            </p>
          )}
        </div>
      )}
    </Sheet>
  );
}
