# Flowkeep design system

The design system for Flowkeep, a maintenance record for community water points ([PRD](../docs/prd.md)).

The live reference is at **`/design-system`** when the app is running (`npm run dev`, then open http://localhost:3000/design-system).

## Structure

The system has three layers, matching the Mobbin research in [`docs/research/`](../docs/research/):

| Layer | What it is | Where it lives |
|---|---|---|
| **App** | Shells and navigation: a desktop sidebar for officers, approvers and admins, and a phone shell for custodians and technicians | [patterns.md § App](patterns.md#app-layer), `/design-system#app` |
| **Screen** | Compositions for each role's job | `src/components/patterns/screens.tsx`, [patterns.md § Screen](patterns.md#screen-layer) |
| **Component** | Primitives | `src/components/ui/*`, [components.md](components.md) |

Underneath all three are the **foundations** ([foundations.md](foundations.md)): colour, type, shape, elevation and motion.

## Principles

These come from the PRD:

1. **Show who acts next.** No reminders are sent in v1 (PRD §14 risk 2), so every role's first screen is the list of things waiting on them.
2. **Never block on the network.** Save on the phone first, show the sync state, and keep both `event_time` and `synced_at` visible (PRD §9).
3. **Record, don't overwrite.** Superseded entries stay visible and corrections are appended. Nothing in the UI suggests deleting a record (PRD §10).
4. **Say exactly what is true.** "Service verified" means water is flowing, never that it is safe. A missing step is shown as "Not recorded", never left blank (PRD §7, §11).
5. **Design for the field.** Touch targets are 48px on phone screens, body text is at least 16px, choices are shown as a visible list rather than a dropdown, and the type supports Hausa letters.
6. **Status is never colour-only.** Every status has an icon and a label.

## Token rule

Colours come in two layers ([`src/styles/tokens.css`](../src/styles/tokens.css)): palettes (layer 1) and Material 3 roles (layer 2). **Components use layer 2 only.** Tailwind exposes the roles alone (`bg-primary`, `text-on-surface`, `bg-surface-container-high`…), and the palettes are not mapped. That makes using a palette directly harder by mistake.

## Files

- [foundations.md](foundations.md): colour roles, contrast audit, type, shape, elevation, motion
- [components.md](components.md): every primitive, its variants and when to use it
- [patterns.md](patterns.md): app and screen layer patterns, with the fault status map and the Mobbin references behind them
