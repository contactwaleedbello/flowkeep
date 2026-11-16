# Patterns (app and screen layers)

## Fault status map

Source of truth: [`src/lib/fault-status.ts`](../src/lib/fault-status.ts). It follows PRD §11.

| Status | Tone | Icon | Waiting on | Closed |
|---|---|---|---|---|
| Reported | attention (amber) | circle-alert | Technician | no |
| Estimate submitted | primary (teal) | file-text | Approver | no |
| Funding approved | tertiary (violet) | badge-check | Approver (to disburse) | no |
| Funding rejected | attention | ban | Programme officer | no |
| Funding disbursed | primary | banknote | Technician | no |
| Awaiting parts | attention | package | Technician | no |
| Repair reported complete | neutral (slate) | wrench | Custodian | no |
| Partially repaired | attention | hammer | Custodian | no |
| Repair failed | error (red) | circle-x | Custodian | no |
| Service verified | success (green), solid | droplet | n/a | **yes** |
| Abandoned | error, solid | archive | n/a | **yes** |

**The officer's list is grouped by who it is waiting on, not by status.** The group order is: needs programme officer → waiting on approver → waiting on technician → waiting on custodian. Mobbin basis: [Linear](https://mobbin.com/screens/610d34b6-6ad8-45ab-80fb-2107b31ed01e) and [Plane](https://mobbin.com/screens/b274b760-5c97-4900-ae57-115489320c86) group by state, while [Deel](https://mobbin.com/screens/ebede796-0ca0-408a-bf05-630420732e1f) and [Brex](https://mobbin.com/screens/47dfde64-0ad0-41c6-978c-c56480db69de) group by the next action.

> PRD gap: §11 gives `awaiting parts` no exit transition. Until the PRD is updated, assume `awaiting parts → funding disbursed` (parts arrived) and `→ abandoned`.

## App layer

### Desktop shell
Programme officer, approver and admin.
- **Sidebar** (`DesktopShell`, `src/components/app/chrome.tsx`), one component at three widths:
  - **Large screens (1024px and up):** full 240px sidebar, or a 60px icon rail. The person chooses with the Collapse button or the `[` key. The choice is saved per device (`flowkeep-sidebar`) and applied before first paint.
  - **Tablet (768–1023px):** always the icon rail.
  - **Phone:** a menu button in the header opens a drawer from the left with the same links. The header shows the current page name.
  - **Items:** icon, label and count. The active item has a neutral fill, a primary icon and a 2px primary bar on the left edge. Settings is pinned to the bottom, and the person sits in the footer.
  - **In the rail:** each label becomes a tooltip on hover and keyboard focus, so links keep their accessible names. The `rail:` Tailwind variant in `globals.css` drives this and is scoped to `.fk-aside`, so the drawer never collapses.
  - Basis: [Deel](https://mobbin.com/screens/ebede796-0ca0-408a-bf05-630420732e1f), with the Linear collapse pattern.
- A `SyncBar` above the content. On desktop it usually reads "All records synced".
- **The first screen after login is the role's queue** (PRD §14 risk 2): open faults for officers, To decide for approvers.
- The record opens as a split view beside the list ([Wrike](https://mobbin.com/screens/20ad47f6-2249-48aa-a3c2-e8fb4503b4b0)) on wide screens, and as its own page on narrow ones.

### Phone shell
Custodian and technician.
- The `SyncBar` is always on top and never blocks the screen.
- A large screen title, then one primary action (`Button size="lg" block`).
- A three-item bottom bar: My faults · Report (custodian) or Record (technician) · Synced. Basis: [Asana](https://mobbin.com/screens/986b4600-b4e5-4dbf-a87c-093d8889883c), [Jobber](https://mobbin.com/screens/6b7ee6db-6399-4183-9696-c06bb51ca166).

## Screen layer

Implemented in [`src/components/patterns/screens.tsx`](../src/components/patterns/screens.tsx), with sample data from `src/lib/sample-data.ts`.

| Screen | PRD | Composition | Basis |
|---|---|---|---|
| `OpenFaultsList` | §6 story 11 | Card → header with Export CSV → a "waiting on" group header with `CountBadge` → `FaultRow` (ID, water point, community, `StatusPill`, days in state, `SyncTag`) | [Linear](https://mobbin.com/screens/610d34b6-6ad8-45ab-80fb-2107b31ed01e), [hilos](https://mobbin.com/screens/7eac860e-33e9-4de1-8dfe-fe6d1dbe1fb8) |
| `FaultRecord` | §7 feature 5, §13 | Header (ID, water point, `StatusPill`) → `LifecycleStepper` → `Timeline`, plus a Timestamps panel showing the gap between steps and "Not recorded yet" for missing steps | [incident.io](https://mobbin.com/screens/5b8715c5-d502-4b69-a4b8-d7275ee08a83) |
| `ApprovalPanel` | §7 feature 3 | The amount in display type, a diagnosis and parts list, a chain strip (Technician submitted › **You decide** › Disburse), then Reject with reason and Approve | [Aboard](https://mobbin.com/screens/473a91f7-3b9f-4e2b-9c22-ff199209aa7f), [Expensify](https://mobbin.com/screens/3eeed405-32d1-4bc4-bb42-04d44b5286a5) |
| `TechnicianJobCard` | §6 stories 4–7 | `StatusPill`, water point, community and days open, a call button, then one primary action named for the next step | [Jobber](https://mobbin.com/screens/536351e7-656d-444e-867d-38eb7f48e146) |
| `CustodianHomePhone` | §6 stories 1–2 | `SyncBar`, "Report a fault", report cards with status and sync tag, and an inline "Confirm if water is flowing" when it's needed | [talabat](https://mobbin.com/screens/2d1ee2a9-8c70-4868-be60-f4fcc3cd6bfc) |
| `ReportFaultPhone` | §7 feature 1 | Offline `SyncBar`, "What is wrong?", a `ChoiceList` of fault types, Save report, and "Saved on this phone" | [Citi Bike](https://mobbin.com/screens/145c017d-11b2-41dc-8e5b-46c784bcd314), [Bird](https://mobbin.com/flows/4bb0fda2-0003-46b3-b0e0-9ab39d7a7721) |
| `ConfirmFlowPhone` | §7 feature 4, §14 risk 3 | A water point card ("Technician marked repair complete"), the question "Is water flowing at WP-02 now?", two full-sentence buttons, and the safety disclaimer | [Bumble](https://mobbin.com/screens/f7e245fd-40b4-4058-be8a-d6b2e3994f94), [Afterpay](https://mobbin.com/screens/e7c6f4c4-2d00-434e-ab58-81cb6a3078d7) |

### Writing rules for screens

- Buttons name what happens next: "Record repair outcome", not "Continue"; "Reject with reason", not "Reject".
- Timestamps read "Happened …" and "Synced …". Never show only one of them on a record.
- Never write "restored", "fixed" or "safe" unless the matching record exists. Without a custodian confirmation, the record does not say service was restored.
- Rejection, abandonment and corrections always require a reason. The PRD makes the rejection note optional; we recommend making it required.
