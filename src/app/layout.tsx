import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/*
 * Inter (variable, with optical sizing): one family for product and marketing.
 * latin-ext covers Hausa (ɓ ɗ ƙ ƴ), Fulfulde and Yoruba diacritics.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Flowkeep: a maintenance record for community water points",
    template: "%s · Flowkeep",
  },
  description:
    "Flowkeep tracks a water point fault from the first report to the custodian's confirmation that water is flowing. Offline-first. Looking for a pilot partner.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfaf6" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

/* Sets the theme class before first paint, so there is no flash (see Next docs: preventing-flash-before-hydration). */
const themeScript = `(function(){try{var t=localStorage.getItem('flowkeep-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
