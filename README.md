# Flowkeep

A maintenance record for community water points. It tracks a fault from the first report to the custodian's confirmation that water is flowing. See the [PRD](docs/prd.md).

The repository currently contains:

- **The marketing site** (`/`), written to recruit one pilot partner.
- **The design system** (`/design-system`, plus docs in [`design-system/`](design-system/README.md)), built on the Flowkeep colour tokens and the PRD.
- **Research** ([`docs/research/`](docs/research/)): Mobbin references at the app, screen and component layers.

The app itself (offline PWA, Supabase, Dexie) is the next phase.

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript · lucide-react icons · Inter through `next/font`. The PRD locks the stack in §2.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 and /design-system
npm run build      # production build
npm run lint
npm run audit:contrast   # WCAG contrast check of every colour role pair
```

## Layout

```
src/
  styles/tokens.css           colour system (palettes → Material 3 roles), as supplied
  app/globals.css             Tailwind theme: roles, type scale, shape, elevation, motion
  app/page.tsx                marketing site
  app/design-system/page.tsx  live design system reference
  components/ui/              component layer (primitives)
  components/patterns/        screen layer (compositions for each role)
  components/marketing/       marketing-only pieces (header, footer, pilot form)
  lib/fault-status.ts         the 11 fault states → tone, icon, "waiting on" group
  lib/sample-data.ts          SAMPLE data for previews only
design-system/                design system docs
docs/                         PRD and research
scripts/contrast-audit.mjs
```

## Before publishing the marketing site

- Set the real pilot inbox in `src/lib/site.ts` (`contactEmail`). It is a placeholder for now.
- Product previews use sample names, places and amounts, and are labelled as such. Do not replace them with figures that are not from the pilot.
