# Foundations

## Direction

**Precise and technical (Linear, Vercel), warmed by people and place.** Concretely:

- The product is crisp, dense and mostly monochrome, with colour only where it means something.
- Mono type carries IDs, timestamps and section indices.
- Warmth comes from sand neutrals, real photography of water points, and plain human copy.

## Colour

Source: [`src/styles/tokens.css`](../src/styles/tokens.css). It has two layers: palettes, then Material 3 roles. Components use roles only.

**v2 palette, approved by the product owner.** It keeps the seven hues of the original file ([`docs/research/tokens-original.css`](../docs/research/tokens-original.css)) and re-tunes them:

- **Lightness:** an even ramp from 25 (0.985) to 975 (0.165), so the low steps are true tints.
- **Saturation:** peaks at 500 and tapers at both ends, which removes the neon tints (the old teal-50 was #26cec6, the old green-50 #32f87c).
- **Gamut:** every step is clamped into sRGB, so colours match across screens.
- **Dark theme:** deep slate (`slate-975`, about #0d1317), not pure black.

| Palette | Role | Meaning in Flowkeep |
|---|---|---|
| Teal | Primary | Brand, primary actions. Light theme `teal-700`; dark theme `teal-300` |
| Amber | Secondary | Attention: needs action, waiting too long, unsynced |
| Violet | Tertiary | Funding approved, not yet disbursed |
| Green | Success (Flowkeep extension) | Service verified: water flowing |
| Red | Error | Repair failed, abandoned, destructive actions |
| Slate | Neutral dark | Text, dark surfaces |
| Sand | Neutral light | Warm light surfaces and hairlines |

**Contrast** (`npm run audit:contrast`): every text pair passes WCAG AA in both themes. `outline` on `surface` is 3.6:1 and is for borders only, where 3:1 is the requirement.

### Usage
- Large areas stay neutral (`surface`, `surface-container-*`). Accent colour appears on status dots, the primary button, links and focus rings.
- Hairlines use `outline-variant`, often at 60 to 80% opacity. Prefer a hairline or spacing over a filled box.
- In dark mode, `surface-container-lowest` equals the page colour, so elevated cards step up to `surface-container-low` with a hairline ring.

## Typography

| Family | Token | Use |
|---|---|---|
| **Inter Tight** | `font-display` (all `h1`–`h3` by default) | Headlines and titles |
| **Inter** (variable, optical sizing) | `font-sans` | Body and UI |
| **Geist Mono** | `font-mono`, `mono-label` | IDs (`F-029`, `WP-02`), timestamps, section indices, table headers |

- **Hausa letters:** I checked the font files. Inter and Inter Tight both contain ɓ ɗ ƙ ƴ and their capitals. Geist Mono is only used for ASCII.
- **Figures:** use `num` (tabular figures) for money, counts and durations.
- **Hosting:** all three fonts are self-hosted through `next/font`, so there are no runtime requests to Google.

| Token | Size / line height | Tracking | Use |
|---|---|---|---|
| `display-xl / lg / md / sm` | 76 / 57 / 45 / 36, line height 1.02 to 1.12 | −0.020 to −0.012em | Marketing headlines |
| `headline-lg / md / sm` | 32 / 28 / 24 | −0.010 to −0.005em | Page and screen titles |
| `title-lg / md / sm` | 22 / 16 / 14 | — | Record and card titles |
| `body-lg / md / sm` | 16 / 14 / 12 | — | Phone body (16px minimum), desktop body, helper text |
| `label-lg / md / sm` | 14 / 12 / 11 | — | Buttons, rows, chips |

## Shape

These are precise corners, not pills:

| Token | Radius | Use |
|---|---|---|
| `rounded-xs` | 4 | — |
| `rounded-sm` | 6 | Status badges, chips |
| `rounded-md` | 8 | Buttons, inputs, nav items |
| `rounded-lg` | 12 | Cards, lists |
| `rounded-xl` | 16 | Dialogs, app window |
| `rounded-2xl` | 20 | Bento tiles |
| `rounded-full` | — | Avatars and dots only |

## Elevation

Depth comes from tonal surfaces and hairlines first. Shadows are soft and layered:

| Token | Use |
|---|---|
| `shadow-1` | Buttons, inputs, the active nav item |
| `shadow-2` | Floating cards, the current step |
| `shadow-3` | Dialogs, the demo dock, the hero window |

## Photography

Photos are the main carrier of warmth (direction c). Rules are in `src/lib/photos.ts`:

- **Licences:** only openly licensed photos (CC0, CC BY, CC BY-SA) or photos the team owns.
- **Captions:** state the place and the photographer, with the licence and a link to the source.
- **Honesty:** never present a third-party photo as Flowkeep pilot work.
- **Until a photo is added:** the slot shows a line drawing of a hand pump in role colours (`PumpIllustration`).

## Spacing and touch

- 4px base (Tailwind default).
- Field screens: buttons `size="lg"` (48px), choice rows of at least 56px, with 12px or more between tap targets.
- Desktop: buttons `size="md"` (40px).

## Motion

`ease-standard` `cubic-bezier(0.2, 0, 0, 1)`, 150ms by default. `prefers-reduced-motion` turns transitions off. The only animation is the spinning icon while syncing.

## State layers

The `state-layer` utility draws Material state layers in the element's text colour: 8% on hover and 12% when pressed. Use it on anything interactive.
