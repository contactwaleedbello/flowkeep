import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#roles", label: "Who it's for" },
  { href: "/#pilot", label: "The pilot" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-6 sm:px-6">
        <Link href="/" aria-label="Flowkeep home" className="rounded-sm">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="state-layer rounded-full px-3 py-2 text-label-lg text-on-surface-variant hover:text-on-surface">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <span className="hidden sm:block">
            <ButtonLink href="/#apply" size="md">
              Become a pilot partner
            </ButtonLink>
          </span>
          <span className="sm:hidden">
            <ButtonLink href="/#apply" size="sm">
              Pilot with us
            </ButtonLink>
          </span>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
        <div className="flex max-w-sm flex-col gap-3">
          <Logo />
          <p className="text-body-md text-on-surface-variant">
            A maintenance record for community water points. From the first report to confirmed water flow.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-body-md sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <p className="text-label-lg font-semibold text-on-surface">Product</p>
            <Link href="/#how" className="text-on-surface-variant hover:text-on-surface">How it works</Link>
            <Link href="/#field" className="text-on-surface-variant hover:text-on-surface">Built for the field</Link>
            <Link href="/#limits" className="text-on-surface-variant hover:text-on-surface">What it does not do</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-label-lg font-semibold text-on-surface">Pilot</p>
            <Link href="/#pilot" className="text-on-surface-variant hover:text-on-surface">What a pilot involves</Link>
            <Link href="/#faq" className="text-on-surface-variant hover:text-on-surface">FAQ</Link>
            <Link href="/#apply" className="text-on-surface-variant hover:text-on-surface">Get in touch</Link>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-label-lg font-semibold text-on-surface">Build</p>
            <Link href="/design-system" className="text-on-surface-variant hover:text-on-surface">Design system</Link>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 pb-8 text-body-sm text-on-surface-variant sm:px-6">
        © 2026 Flowkeep. Product previews on this site use sample data.
      </div>
    </footer>
  );
}
