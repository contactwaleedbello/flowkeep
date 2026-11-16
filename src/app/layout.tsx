import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Inter_Tight } from "next/font/google";
import "./globals.css";

/*
 * Inter (variable, with optical sizing): body text in product and marketing.
 * latin-ext covers Hausa (ɓ ɗ ƙ ƴ), Fulfulde and Yoruba diacritics.
 */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  display: "swap",
});

/* Headings. Same skeleton as Inter, tighter fit; also covers the Hausa letters. */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/* IDs, timestamps and figures. ASCII only, so Hausa coverage is not needed. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
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
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1317" },
  ],
};

/* Sets the theme class before first paint, so there is no flash (see Next docs: preventing-flash-before-hydration). */
const themeScript = `(function(){try{var t=localStorage.getItem('flowkeep-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${interTight.variable} ${geistMono.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
