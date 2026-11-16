# Foundations

## Colour

Source: [`src/styles/tokens.css`](../src/styles/tokens.css), supplied by the product owner. Values there are not to be changed without updating this page.

| Palette | Role | Meaning in Flowkeep |
|---|---|---|
| Teal | Primary | Brand, primary actions, work in progress |
| Amber | Secondary | Attention: needs action, waiting too long |
| Violet | Tertiary | Funding approved, not yet disbursed |
| Green | Success (Flowkeep extension) | Service verified: water flowing |
| Red | Error | Repair failed, abandoned, destructive actions |
| Slate | Neutral dark | Text and dark surfaces; repaired, waiting for confirmation |
| Sand | Neutral light | Light surfaces |

Light theme is the default. Dark theme applies when `<html>` has the `.dark` class. A script in `layout.tsx` sets it before first paint, from the saved choice or the OS setting.

### Tailwind names

The roles map one to one: `--md-primary` → `bg-primary`, `text-primary`, `border-primary`; `--md-on-surface-variant` → `text-on-surface-variant`; and so on. The palette steps (`teal-600` and the rest) are deliberately **not** available as utilities.

### Contrast audit

To run it: `npm run audit:contrast` (script: [`scripts/contrast-audit.mjs`](../scripts/contrast-audit.mjs)). Results for the current file:

- **Every `on-X` / `X` text pair passes WCAG AA (4.5:1) in both themes.** The lowest is `on-secondary` on `secondary` in light, at 4.64.
- Every palette colour is inside the sRGB gamut.
- `secondary` (amber) used as **text** on `surface` in light is **4.45:1**. That's fine for icons, borders and large text, but small amber text should use `text-on-secondary-container` instead.
- `outline` on `surface` in light is 3.98:1, which passes the 3:1 minimum for borders and other non-text UI.

### Usage notes

- `primary-container` (teal-50, #26cec6) and `success-container` (green-50, #32f87c) are very saturated. Use them only for small elements such as pills, chips, selected options and small highlights. For large tinted areas, use `surface-container-*`.
- In dark mode, `surface-container-lowest` is the same colour as `surface`. Elevated cards step up to `surface-container-low` and add an `outline-variant` ring (see `Card`).
- Toasts and the offline sync bar use `inverse-surface`, so they stand out in both themes.

## Typography

| Family | Use |
|---|---|
| **Noto Sans** (`font-sans`) | All product UI. It covers Latin Extended, including Hausa ɓ ɗ ƙ ƴ, Fulfulde and Yoruba diacritics. |
| **Noto Serif Display** (`font-display`) | Marketing headlines only |

Both fonts are self-hosted through `next/font`, so the app never requests Google Fonts at runtime.

Type scale (Material 3), as Tailwind utilities `text-{role}-{size}`:

| Token | Size / line height | Use |
|---|---|---|
| `display-lg / md / sm` | 57/64, 45/52, 36/44 | Marketing headlines |
| `headline-lg / md / sm` | 32/40, 28/36, 24/32 | Page titles; phone screen titles |
| `title-lg / md / sm` | 22/28, 16/24, 14/20 | Record titles, card titles |
| `body-lg / md / sm` | 16/24, 14/20, 12/16 | Phone body (16px minimum), desktop body, timestamps |
| `label-lg / md / sm` | 14/20, 12/16, 11/16 | Buttons, pills, chips |

## Shape

`rounded-xs` 4 · `sm` 8 (fields, toasts) · `md` 12 (choice rows, banners) · `lg` 16 (cards) · `xl` 28 (feature panels) · `full` (buttons, pills, tabs).

## Elevation

Depth comes mostly from tonal surfaces (`surface-container-lowest` → `highest`). Shadows (`shadow-1/2/3`) are only for floating things: hover on filled buttons, elevated previews, toasts.

## Spacing and touch

- 4px base (Tailwind default).
- Field screens: buttons `size="lg"` (48px), choice rows of at least 56px, with 12px or more between tap targets.
- Desktop: buttons `size="md"` (40px).

## Motion

`ease-standard` `cubic-bezier(0.2, 0, 0, 1)`, 150ms by default. `prefers-reduced-motion` turns transitions off. The only animation is the spinning icon while syncing.

## State layers

The `state-layer` utility draws Material state layers in the element's text colour: 8% on hover and 12% when pressed. Use it on anything interactive.
