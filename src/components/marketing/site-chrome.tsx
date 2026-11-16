import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#product", label: "Product" },
  { href: "/#pilot", label: "Pilot" },
  { href: "/#faq", label: "FAQ" },
  { href: "/app", label: "Demo" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/50 bg-surface/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center gap-4 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link href="/" aria-label="Flowkeep home" className="w-fit rounded-sm">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3 py-1.5 text-label-lg text-on-surface-variant transition-colors hover:text-on-surface"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-1">
          <ThemeToggle />
          <ButtonLink href="/#apply" size="sm">
            Pilot with us
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-body-sm text-on-surface-variant">© 2026 · Previews use sample data</span>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-body-md text-on-surface-variant">
          <Link href="/#how" className="hover:text-on-surface">How it works</Link>
          <Link href="/#pilot" className="hover:text-on-surface">Pilot</Link>
          <Link href="/#faq" className="hover:text-on-surface">FAQ</Link>
          <Link href="/design-system" className="hover:text-on-surface">Design system</Link>
        </nav>
      </div>
    </footer>
  );
}
