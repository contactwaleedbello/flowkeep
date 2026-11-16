import { extendTailwindMerge } from "tailwind-merge";

/**
 * Class merger aware of Flowkeep tokens, so a later class wins over an earlier one
 * (e.g. `hidden` passed to a component overrides its default `flex`).
 * Custom font sizes and colours must be registered here, or tailwind-merge would
 * treat `text-body-md` and `text-on-surface` as the same group and drop one.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: [
        "display-lg", "display-md", "display-sm",
        "headline-lg", "headline-md", "headline-sm",
        "title-lg", "title-md", "title-sm",
        "body-lg", "body-md", "body-sm",
        "label-lg", "label-md", "label-sm",
      ],
      color: [
        "primary", "on-primary", "primary-container", "on-primary-container",
        "secondary", "on-secondary", "secondary-container", "on-secondary-container",
        "tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container",
        "error", "on-error", "error-container", "on-error-container",
        "success", "on-success", "success-container", "on-success-container",
        "surface", "surface-dim", "surface-bright",
        "surface-container-lowest", "surface-container-low", "surface-container",
        "surface-container-high", "surface-container-highest",
        "on-surface", "on-surface-variant", "surface-variant", "surface-tint",
        "outline", "outline-variant",
        "inverse-surface", "inverse-on-surface", "inverse-primary",
      ],
      radius: ["xs", "sm", "md", "lg", "xl"],
      shadow: ["1", "2", "3"],
    },
  },
});

export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(" "));
}
