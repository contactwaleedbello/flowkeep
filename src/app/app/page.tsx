"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, ClipboardList, HandHelping, Inbox, Settings, Wrench } from "lucide-react";
import { userById } from "@/lib/demo/logic";
import { PERSONA, useDemo } from "@/lib/demo/store";
import { LogoMark } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const CARDS = [
  { key: "officer", href: "/app/officer", title: "Programme officer", body: "Open faults grouped by who acts next. Reassign, follow up, abandon, export.", icon: Inbox, device: "Desktop" },
  { key: "approver", href: "/app/approver", title: "Approver", body: "Decide on estimates, then record when money is disbursed.", icon: BadgeCheck, device: "Desktop" },
  { key: "technician", href: "/app/technician", title: "Technician", body: "Record diagnoses, estimates and repair outcomes. Works offline.", icon: Wrench, device: "Phone" },
  { key: "custodian", href: "/app/custodian", title: "Custodian", body: "Report a fault. After the repair, confirm whether water is flowing.", icon: ClipboardList, device: "Phone" },
  { key: "assist", href: "/app/assist", title: "Assisting user", body: "Report on behalf of a custodian without a smartphone.", icon: HandHelping, device: "Phone" },
  { key: "admin", href: "/app/admin", title: "Admin", body: "Water points, people and roles, consent, correction and access logs.", icon: Settings, device: "Desktop" },
];

export default function ChooseRole() {
  const { state, reset } = useDemo();
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <LogoMark className="size-7" />
          <span className="text-title-md font-semibold text-on-surface">Flowkeep</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto max-w-5xl px-4 pt-10 pb-20 sm:px-6 sm:pt-16">
        <p className="text-label-lg font-medium text-primary">Interactive demo</p>
        <h1 className="mt-3 max-w-2xl text-display-sm font-semibold text-balance text-on-surface sm:text-display-md">Choose who you want to be.</h1>
        <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant sm:text-title-lg sm:leading-8 sm:font-normal">
          Every role works on the same sample record, saved in this browser only. Report a fault as a custodian, diagnose it as a
          technician, approve it, and watch it move through the officer&apos;s list.
        </p>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map(({ key, href, title, body, icon: Icon, device }) => (
            <Link
              key={key}
              href={href}
              className="group flex flex-col gap-4 rounded-xl bg-surface-container-low p-6 ring-1 ring-transparent transition-[box-shadow,background-color] hover:bg-surface-container-lowest hover:shadow-2 hover:ring-outline-variant/70 dark:hover:bg-surface-container"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-md bg-surface-container-lowest text-primary shadow-1 ring-1 ring-outline-variant/60 dark:bg-surface-container-high">
                  <Icon aria-hidden className="size-5" />
                </span>
                <span className="text-label-md text-on-surface-variant">{device}</span>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="flex items-center gap-1.5 text-title-md font-semibold text-on-surface">
                  {title}
                  <ArrowRight aria-hidden className="size-4 opacity-0 transition-[opacity,transform] group-hover:translate-x-0.5 group-hover:opacity-100" />
                </h2>
                <p className="text-body-md text-on-surface-variant">{body}</p>
              </div>
              <p className="mt-auto text-body-sm text-on-surface-variant">As {userById(state, PERSONA[key])?.name}</p>
            </Link>
          ))}
        </div>
        <p className="mt-10 text-body-sm text-on-surface-variant">
          Sample data. No backend: nothing leaves this browser.{" "}
          <button type="button" onClick={reset} className="font-medium text-on-surface underline decoration-outline-variant underline-offset-4">
            Reset demo data
          </button>
        </p>
      </main>
    </div>
  );
}
