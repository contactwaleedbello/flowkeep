# Flowkeep app: front-end demo

A clickable front end for every role in the PRD. **There is no backend.** Data is sample data, held in React state and saved to the browser's `localStorage` (key `flowkeep-demo-v1`). Each browser has its own copy. Use **Reset** in the demo bar to restore the seed.

Open it at **`/app`** and choose a role.

## Routes

| Route | Role | Shell | What it covers (PRD) |
|---|---|---|---|
| `/app` | n/a | n/a | Role chooser |
| `/app/officer` | Programme officer | Desktop | Open faults grouped by who acts next, search, state filter, CSV export (§6 stories 11, 15; §14 risk 2) |
| `/app/faults/[id]` | Programme officer | Desktop | Fault record: stepper, timeline, timestamps, details. Reassign, abandon with reason, act on rejected funding (ask for revision, escalate, abandon), show the custodian's phone number, which is logged (§6 stories 12–14, §7 feature 5, §10) |
| `/app/water-points`, `/app/water-points/[id]` | Programme officer | Desktop | Portfolio and per-point fault history, including the display rules from §7 feature 5 and an empty state |
| `/app/exports` | Programme officer | Desktop | CSV downloads built in the browser |
| `/app/approver` | Approver | Desktop | Queues: To decide, To disburse, Decided and paid. Approve (funder source, optional note), reject (reason required), record disbursement (§7 feature 3) |
| `/app/technician`, `/app/technician/faults/[id]` | Technician | Phone | Assigned faults grouped by what to do. Diagnosis and estimate form; repair outcome (complete, partial, failed, parts not available) (§7 features 2, 4) |
| `/app/custodian`, `/report`, `/faults/[id]` | Custodian | Phone | Report in two steps; confirm whether water is flowing (§7 features 1, 4) |
| `/app/assist`, `/report`, `/faults/[id]` | Assisting user | Phone | Report for a custodian without a smartphone. The record shows both names. Cannot confirm restoration (§5, §10) |
| `/app/admin` | Admin | Desktop | Water points (add), people and roles (invite, record consent), correction log, phone access log (§12) |

## Rules the demo enforces

- **Lifecycle (§11).** Every status change goes through `TRANSITIONS` in `src/lib/demo/logic.ts`; an illegal move is refused. A fault never jumps from reported to service verified.
- **Only the assigned custodian can confirm water flow.** An assisting user sees "Waiting for the custodian".
- **"Water is not flowing" reopens the fault** to `reported`. The earlier diagnosis, estimate and disbursement stay on the record, and the stepper shows a "returned to reported" note.
- **A new diagnosis supersedes the previous one.** The old one stays visible, marked superseded.
- **A rejection keeps the fault open.** The officer can ask for a revised estimate, which goes back to the technician's "Needs diagnosis" list, or escalate, or abandon.
- **Approval and disbursement are separate steps** in separate queues.
- **Abandoning a fault requires a reason**, and so does rejecting funding. The rejection reason is our recommendation; the PRD makes it optional.
- **Every view of a custodian's phone number is logged** (the officer's "Show phone number" and the technician's "Call" button) and appears in the admin phone access log.
- **Two timestamps on every entry (§9).** Turn on **Offline** in the demo bar: new entries get no `synced_at`, the sync bar counts them, and records show "Not synced yet". Turn Offline off and press **Sync now**.
- **Stale queue warning.** The sync bar warns once the oldest unsynced entry is 10 days old (the cap is 14 days).

## Assumptions (to confirm with the PRD owner)

- **`awaiting parts` exits.** The PRD gives none. The demo allows awaiting parts → any repair outcome (parts arrived, work done) or → abandoned.
- **Reassignment** changes the fault's technician or custodian and records an event. It does not change the water point's standing assignments.
- **Currency** is Naira only, and **times** are shown in West Africa Time, `en-GB` format.

## Walkthrough (about 2 minutes)

1. **Custodian** (Amina) → Report a fault → "Water flow is weak" → Save.
2. **Technician** (Sani) → Needs diagnosis → open it → choose a category, parts and cost → Submit estimate.
3. **Approver** (Halima) → To decide → Approve. Then To disburse → Record disbursement.
4. **Technician** → turn **Offline** on → Ready to repair → Complete → Save. The record now says "Not synced yet".
5. **Custodian** → "Your answer is needed" → Yes, water is flowing.
6. Turn **Offline** off → **Sync now** → **Programme officer** → open the fault: every step is shown with a name, both times and the gaps between steps.

## Code

- `src/lib/demo/`: types, seed, logic (transitions, selectors, formatting), store (React context with localStorage), CSV
- `src/components/app/`: demo bar, desktop and phone shells, dialog, fault list and record helpers, field (phone) views
- `src/app/app/`: routes

The store is built so it can be swapped for Supabase and Dexie later. Pages only call `useDemo()` actions such as `report`, `diagnose`, `decide`, `disburse`, `repairOutcome` and `confirm`. Those become writes to IndexedDB plus the sync queue.
