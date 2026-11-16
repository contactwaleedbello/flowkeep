import {
  ArrowRight,
  BellOff,
  CloudOff,
  CreditCard,
  Download,
  FlaskConical,
  History,
  Map as MapIcon,
  Plus,
  Radio,
  ShieldCheck,
  Timer,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { AppWindowPreview } from "@/components/marketing/app-preview";
import { ApplyForm } from "@/components/marketing/apply-form";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import { ApprovalPanel, ConfirmFlowPhone, OpenFaultsList } from "@/components/patterns/screens";
import { ButtonLink } from "@/components/ui/button";
import { SyncBar, Toast } from "@/components/ui/feedback";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Product />
        <Field />
        <Pilot />
        <Faq />
        <Apply />
      </main>
      <SiteFooter />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Layout primitives for this page                                     */
/* ------------------------------------------------------------------ */

function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-16 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">{children}</div>
    </section>
  );
}

function SectionHeader({ kicker, title, body, center = false }: { kicker: string; title: ReactNode; body?: ReactNode; center?: boolean }) {
  return (
    <div className={`flex max-w-2xl flex-col gap-4 ${center ? "mx-auto items-center text-center" : ""}`}>
      <p className="text-label-lg font-medium text-primary">{kicker}</p>
      <h2 className="text-headline-lg font-semibold text-balance text-on-surface sm:text-display-sm">{title}</h2>
      {body && <p className="text-body-lg text-pretty text-on-surface-variant sm:text-title-lg sm:leading-8 sm:font-normal">{body}</p>}
    </div>
  );
}

/* ------------------------------ Hero ------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* soft glow in the primary role colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[640px] opacity-60 dark:opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, color-mix(in oklch, var(--md-primary) 14%, transparent), transparent 70%)",
        }}
      />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pt-20 text-center sm:px-6 sm:pt-28">
        <a
          href="#pilot"
          className="group mb-8 inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest/70 py-1 pr-3 pl-1.5 text-label-lg text-on-surface-variant shadow-1 backdrop-blur transition-colors hover:text-on-surface"
        >
          <span className="rounded-full bg-primary px-2 py-0.5 text-label-md font-semibold text-on-primary">Pilot</span>
          <span className="sm:hidden">Looking for one partner</span>
          <span className="hidden sm:inline">Looking for one partner in {site.regions}</span>
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>

        <h1 className="max-w-4xl text-display-md font-semibold text-balance text-on-surface sm:text-display-lg lg:text-display-xl">
          Know when the water came back.
        </h1>
        <p className="mt-6 max-w-2xl text-body-lg text-pretty text-on-surface-variant sm:text-title-lg sm:leading-8 sm:font-normal">
          Flowkeep keeps one record of every water point fault, from the first report to the moment the custodian confirms
          water is flowing again.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <ButtonLink href="/#apply" size="lg" trailingIcon={<ArrowRight aria-hidden className="size-4" />}>
            Become a pilot partner
          </ButtonLink>
          <ButtonLink href="/app" size="lg" variant="text">
            Try the demo
          </ButtonLink>
        </div>

        <div className="relative mt-16 w-full sm:mt-20">
          <AppWindowPreview />
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-surface to-transparent" />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Problem ----------------------------- */

const QUESTIONS = [
  { q: "When did it break?", a: "The first report sits in a phone call or a WhatsApp chat." },
  { q: "Who approved the money?", a: "Estimates wait because no one is sure who decides." },
  { q: "Did the repair work?", a: "Nobody asks the people who use the water point." },
];

function Problem() {
  return (
    <Section id="problem">
      <p className="max-w-4xl text-headline-md font-medium text-balance text-on-surface-variant sm:text-display-sm sm:font-medium">
        Faults will always happen.{" "}
        <span className="text-on-surface">The real problem is that no one holds the record</span> from the first report to
        water flowing again, so money and repair decisions are made without it.
      </p>
      <div className="mt-16 grid gap-10 sm:grid-cols-3 sm:gap-8">
        {QUESTIONS.map(({ q, a }) => (
          <div key={q} className="flex flex-col gap-2 border-t border-outline-variant pt-6">
            <p className="text-title-md font-semibold text-on-surface">{q}</p>
            <p className="text-body-lg text-on-surface-variant">{a}</p>
          </div>
        ))}
      </div>
      <p className="mt-10 text-body-sm text-on-surface-variant">
        Based on a typical reporting chain, not on research. Measuring the real one is part of the pilot.
      </p>
    </Section>
  );
}

/* --------------------------- How it works --------------------------- */

const STEPS = [
  { role: "Custodian", title: "Report", body: "Pick the water point and what is wrong. Saved on the phone, even offline." },
  { role: "Technician", title: "Diagnose", body: "Record what is broken, the parts needed and the cost." },
  { role: "Approver", title: "Decide", body: "Approve or reject. A rejection keeps the fault open, with the reason." },
  { role: "Approver", title: "Disburse", body: "Record when money actually moved. Approval and payment are separate." },
  { role: "Technician", title: "Repair", body: "Complete, partial or failed. Failures add to the record, never erase it." },
  { role: "Custodian", title: "Confirm", body: "Only the custodian can say water is flowing. If not, the fault reopens." },
];

function HowItWorks() {
  return (
    <Section id="how" className="bg-surface-container-low">
      <SectionHeader
        kicker="How it works"
        title="Six steps. Each one recorded by the person who did it."
        body="No step can be skipped, and every entry carries a name, a role and a time."
      />
      <ol className="mt-16 grid gap-px overflow-hidden rounded-xl bg-outline-variant/70 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="flex flex-col gap-3 bg-surface-container-lowest p-7 dark:bg-surface-container-low">
            <div className="flex items-center justify-between">
              <span className="font-mono text-label-lg text-on-surface-variant">0{i + 1}</span>
              <span className="text-label-md text-on-surface-variant">{s.role}</span>
            </div>
            <h3 className="mt-6 text-headline-sm font-semibold text-on-surface">{s.title}</h3>
            <p className="text-body-lg text-on-surface-variant">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

/* ------------------------------ Product (bento) ------------------------------ */

function Tile({ title, body, children, className = "" }: { title: string; body: string; children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-xl bg-surface-container-low ${className}`}>
      <div className="relative z-10 flex flex-col gap-1.5 p-7 pb-0">
        <h3 className="text-title-lg font-semibold text-on-surface">{title}</h3>
        <p className="max-w-md text-body-lg text-on-surface-variant">{body}</p>
      </div>
      <div className="relative mt-8 flex-1">{children}</div>
    </div>
  );
}

function Product() {
  return (
    <Section id="product">
      <SectionHeader
        kicker="Product"
        title="Everyone sees the one thing waiting on them."
        body="There are no reminders in the first version, so each person's first screen is their own queue."
      />
      <div className="mt-16 grid gap-4 lg:grid-cols-6">
        <Tile
          className="lg:col-span-4"
          title="Programme officers see who has to act"
          body="Open faults grouped by who acts next, with how long each one has waited."
        >
          <div className="pointer-events-none mx-7 -mb-6 overflow-hidden rounded-t-lg shadow-2 ring-1 ring-outline-variant/70" inert>
            <OpenFaultsList bare className="bg-surface-container-lowest dark:bg-surface-container" />
          </div>
        </Tile>
        <Tile className="min-h-[420px] lg:col-span-2" title="Custodians answer one question" body="Is water flowing? Two clear answers, nothing else.">
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" inert>
            <ConfirmFlowPhone className="w-[260px] shadow-2" />
          </div>
        </Tile>
        <Tile className="lg:col-span-3" title="Approvers decide with the full picture" body="Estimate, diagnosis and the chain of decisions on one panel.">
          <div className="pointer-events-none px-7 pb-7" inert>
            <ApprovalPanel className="shadow-2" />
          </div>
        </Tile>
        <Tile className="lg:col-span-3" title="Works without a signal" body="Saved on the phone first. Synced when data returns. Never blocked.">
          <div className="flex flex-col gap-3 px-7 pb-7" inert>
            <div className="overflow-hidden rounded-lg shadow-2 ring-1 ring-outline-variant/70">
              <SyncBar state="offline" pending={2} />
              <SyncBar state="pending" pending={2} showSyncButton />
              <SyncBar state="synced" />
            </div>
            <Toast title="Saved on this phone" meta="Syncs when online" className="w-fit" />
          </div>
        </Tile>
      </div>
    </Section>
  );
}

/* ------------------------------ Field ------------------------------ */

const FIELD = [
  { icon: CloudOff, title: "Offline first", body: "The screen never waits on the network. Unsynced entries are clearly marked." },
  { icon: History, title: "Two times on every entry", body: "When it happened on the phone, and when it reached the server." },
  { icon: Timer, title: "Delays become visible", body: "Time to diagnosis, decision, payment and repair, from named entries." },
  { icon: ShieldCheck, title: "Phone numbers protected", body: "Consent recorded first. Every view of a number is logged." },
  { icon: Trash2, title: "Nothing is deleted", body: "Changes are written as corrections, with a reason and a name." },
  { icon: Download, title: "Your records stay yours", body: "Export to CSV any time. If the pilot ends, you keep everything." },
];

const NOT_YET = [
  { icon: Radio, text: "Sensors" },
  { icon: BellOff, text: "SMS or reminders" },
  { icon: CreditCard, text: "Payments" },
  { icon: FlaskConical, text: "Water quality testing" },
  { icon: MapIcon, text: "Map view" },
];

function Field() {
  return (
    <Section id="field" className="bg-surface-container-low">
      <SectionHeader kicker="Built for the field" title="Made for patchy data, shared phones and audits." />
      <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {FIELD.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-surface-container-lowest text-primary shadow-1 ring-1 ring-outline-variant/70 dark:bg-surface-container-high">
              <Icon aria-hidden className="size-5" />
            </span>
            <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
            <p className="text-body-lg text-on-surface-variant">{body}</p>
          </div>
        ))}
      </div>

      <div id="limits" className="mt-20 flex flex-col gap-5 border-t border-outline-variant pt-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-title-md font-semibold text-on-surface">Not in the first version</p>
          <p className="text-body-md text-on-surface-variant">
            &ldquo;Service verified&rdquo; means water is flowing. It never means the water is safe to drink.
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {NOT_YET.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant px-3 py-1.5 text-label-lg text-on-surface-variant"
            >
              <Icon aria-hidden className="size-3.5" /> {text}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* ------------------------------ Pilot ------------------------------ */

function Pilot() {
  return (
    <Section id="pilot">
      <SectionHeader
        kicker="The pilot"
        title="One organisation. About ten water points. Real faults."
        body={`We are looking for one partner in ${site.regions}. The first weeks measure how long repairs take today, so there is a baseline. We won't quote results before it exists.`}
      />
      <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-0 md:divide-x md:divide-outline-variant">
        <PilotList
          title="You bring"
          items={[
            "A named approver with authority over repair funding",
            "A source of repair funding for the pilot",
            "A payment or incentive arrangement for technicians",
            "Written confirmation of who owns each water point",
          ]}
          className="md:pr-12"
        />
        <PilotList
          title="We bring"
          items={[
            "Flowkeep, at no charge during the pilot",
            "Setup of water points, people and roles",
            "A baseline of today's response times",
            "Data protection checked against current Nigerian rules first",
          ]}
          className="md:pl-12"
        />
      </div>
    </Section>
  );
}

function PilotList({ title, items, className = "" }: { title: string; items: string[]; className?: string }) {
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      <h3 className="text-title-lg font-semibold text-on-surface">{title}</h3>
      <ul className="flex flex-col divide-y divide-outline-variant/70">
        {items.map((t) => (
          <li key={t} className="flex gap-3 py-4 text-body-lg text-on-surface first:pt-0">
            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------- FAQ ------------------------------- */

const FAQ = [
  {
    q: "Do custodians need a smartphone?",
    a: "No. A custodian without one can report through a named assisting user, such as a WASH committee member, and the record shows both names. Confirming that water is flowing stays with the assigned custodian.",
  },
  {
    q: "Does it need internet all the time?",
    a: "No. Flowkeep loads once with a connection and then works offline. Entries sync when data returns. Records waiting longer than 14 days must be re-entered, and the app warns well before that.",
  },
  {
    q: "Who owns the records?",
    a: "Your organisation. Export to CSV at any time. An export and handover plan is agreed before the pilot starts.",
  },
  {
    q: "Does Flowkeep move money?",
    a: "No. It records that funding was approved and when it was disbursed. Payments happen through your usual process.",
  },
  {
    q: "What does it cost?",
    a: "Nothing for your organisation during the pilot. Pricing for later versions has not been set.",
  },
];

function Faq() {
  return (
    <Section id="faq" className="bg-surface-container-low">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <SectionHeader kicker="FAQ" title="Questions partners ask." />
        <div className="flex flex-col divide-y divide-outline-variant border-y border-outline-variant">
          {FAQ.map((f) => (
            <details key={f.q} className="group py-5 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-title-md font-medium text-on-surface">
                {f.q}
                <Plus aria-hidden className="size-5 shrink-0 text-on-surface-variant transition-transform duration-200 group-open:rotate-45" />
              </summary>
              <p className="pt-3 pr-10 text-body-lg text-on-surface-variant">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ Apply ------------------------------ */

function Apply() {
  return (
    <Section id="apply">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <div className="flex flex-col gap-6">
          <SectionHeader
            kicker="Become a pilot partner"
            title={`Manage water points in ${site.regions}?`}
            body="Tell us about your organisation and how faults are handled today. We read every enquiry and reply by email."
          />
          <p className="text-body-md text-on-surface-variant">
            Or write to{" "}
            <a className="font-medium text-on-surface underline decoration-outline-variant underline-offset-4 hover:decoration-on-surface" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
          </p>
        </div>
        <div className="rounded-xl bg-surface-container-low p-6 sm:p-8">
          <ApplyForm />
        </div>
      </div>
    </Section>
  );
}
