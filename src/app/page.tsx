import {
  ArrowRight,
  Ban,
  BellOff,
  ChevronDown,
  CloudOff,
  CreditCard,
  Download,
  FlaskConical,
  History,
  Map as MapIcon,
  Radio,
  ShieldCheck,
  Timer,
  UserRound,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { ApplyForm } from "@/components/marketing/apply-form";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-chrome";
import {
  ApprovalPanel,
  ConfirmFlowPhone,
  CustodianHomePhone,
  FaultRecord,
  OpenFaultsList,
  ReportFaultPhone,
  TechnicianJobCard,
} from "@/components/patterns/screens";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepDot } from "@/components/ui/lifecycle";
import { Chip } from "@/components/ui/status-pill";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Roles />
        <Field />
        <Limits />
        <Pilot />
        <Faq />
        <Apply />
      </main>
      <SiteFooter />
    </>
  );
}

/* ------------------------------------------------------------------ */

function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-20 ${className}`}>
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-label-md font-semibold tracking-[0.12em] text-primary uppercase">{children}</p>;
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-headline-lg font-semibold text-balance text-on-surface sm:text-display-sm">{children}</h2>;
}

/* ------------------------------ Hero ------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-outline-variant">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20 lg:pb-24">
        <div className="flex flex-col gap-6">
          <Chip tone="primary" className="w-fit">
            Looking for one pilot partner in {site.regions}
          </Chip>
          <h1 className="font-display text-display-sm font-semibold text-balance text-on-surface sm:text-display-md lg:text-display-lg">
            Know when the water came back.
          </h1>
          <p className="max-w-xl text-body-lg text-on-surface-variant sm:text-title-lg sm:leading-8">
            Flowkeep keeps one record of every water point fault. It follows the fault from the custodian&apos;s first report, through
            diagnosis, funding and repair, to the custodian confirming that water is flowing again.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/#apply" size="lg" trailingIcon={<ArrowRight aria-hidden className="size-5" />}>
              Become a pilot partner
            </ButtonLink>
            <ButtonLink href="/#how" size="lg" variant="outlined">
              See how it works
            </ButtonLink>
          </div>
          <p className="text-body-sm text-on-surface-variant">Web app. Works offline on a phone. No charge to your organisation during the pilot.</p>
        </div>
        <div className="relative min-w-0 pb-6 lg:pb-0">
          <FaultRecord compact className="lg:mr-16" />
          <ConfirmFlowPhone className="relative hidden -mt-24 mr-0 ml-auto scale-[0.82] origin-top-right sm:flex sm:-mt-32 lg:absolute lg:-right-6 lg:-bottom-28 lg:mt-0" />
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Problem ----------------------------- */

const CHAIN = ["Community member", "WASH committee", "Local government", "Partner organisation", "Technician", "Estimate on paper or WhatsApp"];

function Problem() {
  return (
    <Section id="problem" className="bg-surface-container-low">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-5">
          <Eyebrow>The problem</Eyebrow>
          <H2>The record goes missing between the report and the repair.</H2>
          <p className="text-body-lg text-on-surface-variant">
            Faults will always happen. The harder problem is that nobody holds a single record of a fault from the first report to
            water flowing again, so decisions about money and repairs are made without one.
          </p>
          <ul className="flex flex-col gap-3 text-body-lg text-on-surface">
            {[
              "When did the fault start?",
              "How long did diagnosis take, and who approved the estimate?",
              "Was the money paid, and did the repair actually work?",
            ].map((q) => (
              <li key={q} className="flex gap-3">
                <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-secondary" />
                {q}
              </li>
            ))}
          </ul>
          <p className="text-body-lg text-on-surface-variant">When a programme officer moves on, the answers usually go with them.</p>
        </div>
        <Card className="flex flex-col gap-5 p-6">
          <p className="text-title-md font-semibold text-on-surface">A typical reporting chain</p>
          <ol className="flex flex-col">
            {CHAIN.map((c, i) => (
              <li key={c} className="relative flex items-center gap-3 pb-4 last:pb-0">
                {i < CHAIN.length - 1 && <span aria-hidden className="absolute top-7 bottom-0 left-[13px] w-0.5 bg-outline-variant" />}
                <StepDot state={i === CHAIN.length - 1 ? "current" : "done"} index={i} />
                <span className="text-body-lg text-on-surface">{c}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-md bg-secondary-container p-4 text-on-secondary-container">
            <p className="text-title-sm font-semibold">Then the estimate waits.</p>
            <p className="text-body-md">No one is sure who approves it. Weeks pass, and none of it is written down in one place.</p>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            This chain is an illustration, not research. Documenting the real chain, and how long each step takes, is part of the pilot.
          </p>
        </Card>
      </div>
    </Section>
  );
}

/* --------------------------- How it works --------------------------- */

const STEPS = [
  { role: "Custodian", title: "Report the fault", body: "The custodian picks the water point and what is wrong. It saves on the phone first, with or without a connection." },
  { role: "Technician", title: "Diagnose and estimate", body: "The technician visits, records what is broken, the parts needed and the cost." },
  { role: "Approver", title: "Decide on funding", body: "A named approver approves or rejects the estimate. A rejection keeps the fault open, with the reason on record." },
  { role: "Approver", title: "Record the disbursement", body: "Approval and payment are separate entries, so the record shows when money actually moved." },
  { role: "Technician", title: "Record the repair outcome", body: "Complete, partial or failed. A failed repair adds to the record. It never erases the diagnosis or the payment." },
  { role: "Custodian", title: "Confirm water is flowing", body: "Only the custodian can confirm it. If water is not flowing, the fault reopens for a new diagnosis." },
];

function HowItWorks() {
  return (
    <Section id="how">
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex flex-col gap-4">
            <Eyebrow>How it works</Eyebrow>
            <H2>Six steps, each recorded by the person who did it.</H2>
            <p className="text-body-lg text-on-surface-variant">
              No step can be skipped. A fault never jumps from reported to fixed, and every entry carries a name, a role and a time.
            </p>
          </div>
          <ol className="flex flex-col">
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative flex gap-4 pb-7 last:pb-0">
                {i < STEPS.length - 1 && <span aria-hidden className="absolute top-8 bottom-0 left-[13px] w-0.5 bg-primary/30" />}
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-label-md font-bold text-on-primary">
                  {i + 1}
                </span>
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-title-md font-semibold text-on-surface">{s.title}</h3>
                    <Chip>{s.role}</Chip>
                  </div>
                  <p className="text-body-lg text-on-surface-variant">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <FaultRecord />
          <p className="text-body-sm text-on-surface-variant">
            The fault record. Each step shows when it happened on the phone and when it reached the server. Sample data.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ Roles ------------------------------ */

function Roles() {
  return (
    <Section id="roles" className="bg-surface-container-low">
      <div className="flex max-w-2xl flex-col gap-4">
        <Eyebrow>Who it&apos;s for</Eyebrow>
        <H2>One record, four people, each seeing their next task.</H2>
        <p className="text-body-lg text-on-surface-variant">
          Flowkeep sends no reminders in its first version, so each person&apos;s first screen is the list of things waiting on them.
        </p>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex min-w-0 flex-col gap-3">
          <RoleHeading icon={<Users className="size-5" />} title="Programme officer" body="Open faults grouped by who has to act next, with how long each has been waiting." />
          <OpenFaultsList />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <RoleHeading icon={<UserRound className="size-5" />} title="Approver" body="The estimate, the diagnosis and the chain of decisions on one panel." />
            <ApprovalPanel />
          </div>
          <div className="flex flex-col gap-3">
            <RoleHeading icon={<UserRound className="size-5" />} title="Technician" body="Assigned faults, each with one clear next action." />
            <TechnicianJobCard />
          </div>
        </div>
      </div>
      <div className="mt-10 grid items-center gap-8 rounded-xl bg-surface-container-lowest p-6 sm:p-10 lg:grid-cols-[1fr_auto]">
        <div className="flex min-w-0 flex-col gap-3">
          <RoleHeading icon={<UserRound className="size-5" />} title="Custodian" body="Two screens: report a fault, then confirm the repair." />
          <p className="max-w-lg text-body-lg text-on-surface-variant">
            The person who lives near the water point. They report the fault and, after the repair, answer one question: is water
            flowing? Custodians without a smartphone can report through a named assisting user, and the record shows both names.
          </p>
        </div>
        <div className="flex flex-col gap-6 sm:flex-row">
          <ReportFaultPhone />
          <div className="hidden sm:block">
            <CustodianHomePhone />
          </div>
        </div>
      </div>
    </Section>
  );
}

function RoleHeading({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="flex items-start gap-3">
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary-container text-on-primary-container">
        {icon}
      </span>
      <div>
        <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
        {body && <p className="text-body-md text-on-surface-variant">{body}</p>}
      </div>
    </div>
  );
}

/* ------------------------------ Field ------------------------------ */

const FIELD = [
  { icon: CloudOff, title: "Works without a connection", body: "Records save on the phone first and sync when data returns. The screen never waits on the network." },
  { icon: History, title: "Two times on every entry", body: "When it happened on the phone, and when it reached the server. Unsynced records are clearly marked." },
  { icon: ShieldCheck, title: "Phone numbers are protected", body: "Consent is recorded before a custodian's number is stored. Every view of a number is logged." },
  { icon: Ban, title: "Nothing is deleted", body: "Faults are never deleted. Changes to a funding decision are written as corrections, with a reason." },
  { icon: Timer, title: "The delays become visible", body: "Time to diagnosis, to decision, to payment and to repair, measured from named entries." },
  { icon: Download, title: "Your records stay yours", body: "Export water point records to CSV at any time. If the pilot ends, you keep everything." },
];

function Field() {
  return (
    <Section id="field">
      <div className="flex max-w-2xl flex-col gap-4">
        <Eyebrow>Built for the field</Eyebrow>
        <H2>Designed for patchy data, shared phones and audits.</H2>
      </div>
      <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-outline-variant bg-outline-variant sm:grid-cols-2 lg:grid-cols-3">
        {FIELD.map(({ icon: Icon, title, body }) => (
          <div key={title} className="flex flex-col gap-3 bg-surface-container-lowest p-6">
            <Icon aria-hidden className="size-6 text-primary" />
            <h3 className="text-title-md font-semibold text-on-surface">{title}</h3>
            <p className="text-body-md text-on-surface-variant">{body}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------ Limits ------------------------------ */

const LIMITS = [
  { icon: Radio, text: "No sensors or automatic monitoring" },
  { icon: BellOff, text: "No automated SMS, alerts or reminders" },
  { icon: CreditCard, text: "No payments inside the platform" },
  { icon: FlaskConical, text: "No water quality testing" },
  { icon: MapIcon, text: "No map view" },
];

function Limits() {
  return (
    <Section id="limits" className="bg-inverse-surface text-inverse-on-surface">
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-4">
          <p className="text-label-md font-semibold tracking-[0.12em] text-inverse-primary uppercase">Plain about the limits</p>
          <h2 className="font-display text-headline-lg font-semibold text-balance sm:text-display-sm">What the first version does not do.</h2>
          <p className="text-body-lg opacity-80">
            Flowkeep starts as a careful record. The data it collects, such as stable water point IDs, fault categories and repair dates,
            is designed so sensors and fault analysis can be added later without starting over.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col divide-y divide-inverse-on-surface/15 rounded-lg border border-inverse-on-surface/15">
            {LIMITS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 px-5 py-4 text-body-lg">
                <Icon aria-hidden className="size-5 opacity-70" />
                {text}
              </li>
            ))}
          </ul>
          <p className="rounded-md bg-inverse-on-surface/10 p-4 text-body-md">
            <strong>&ldquo;Service verified&rdquo; means water is flowing.</strong> It does not mean the water is safe to drink.
          </p>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ Pilot ------------------------------ */

function Pilot() {
  return (
    <Section id="pilot">
      <div className="flex max-w-2xl flex-col gap-4">
        <Eyebrow>The pilot</Eyebrow>
        <H2>One organisation. About ten water points. Real faults.</H2>
        <p className="text-body-lg text-on-surface-variant">
          We are looking for one partner in {site.regions} to run Flowkeep on real faults. The first weeks measure how long repairs take
          today, so there is a baseline to compare against. We will not quote results before that baseline exists.
        </p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card className="flex flex-col gap-4 p-6">
          <h3 className="text-title-lg font-semibold text-on-surface">What your organisation brings</h3>
          <Checklist
            items={[
              "A named approver with authority over repair funding",
              "A source of repair funding for the pilot",
              "An agreed payment or incentive arrangement for technicians",
              "Written confirmation of who owns each water point",
              "Your fault types and diagnosis categories, which we set up with you",
            ]}
          />
        </Card>
        <Card variant="filled" className="flex flex-col gap-4 p-6">
          <h3 className="text-title-lg font-semibold text-on-surface">What we bring</h3>
          <Checklist
            items={[
              "Flowkeep, at no charge to your organisation during the pilot",
              "Setup of your water points, people and roles",
              "A baseline of current response times in the first weeks",
              "Data protection checked against current Nigerian rules before any personal data is collected",
              "An agreed export and handover plan from day one",
            ]}
          />
        </Card>
      </div>
    </Section>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-body-lg text-on-surface">
          <span aria-hidden className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
            <svg viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3.5 8.5l3 3 6-7" />
            </svg>
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------- FAQ ------------------------------- */

const FAQ = [
  {
    q: "Do custodians need a smartphone?",
    a: "No. A custodian with a smartphone reports and confirms directly. A custodian without one can report through a named assisting user, such as a WASH committee member, and the record shows both names. Confirming that water is flowing stays with the assigned custodian.",
  },
  {
    q: "Does it need internet all the time?",
    a: "No. Flowkeep loads once with a connection and then works offline. Entries are saved on the phone and sync when data returns. Records waiting longer than 14 days must be re-entered, and the app warns well before that.",
  },
  {
    q: "Who owns the records?",
    a: "Your organisation. You can export your water point records to CSV at any time, and an export and handover plan is agreed before the pilot starts.",
  },
  {
    q: "Does Flowkeep pay technicians or move money?",
    a: "No. It records that funding was approved and when it was disbursed. Payments happen outside the platform, through your usual process.",
  },
  {
    q: "What does it cost?",
    a: "Nothing for your organisation during the pilot. We have not set pricing for later versions and will not assume you will pay.",
  },
  {
    q: "What happens if we stop partway?",
    a: "You keep your records. The export and handover procedure is agreed at the start for exactly this case.",
  },
];

function Faq() {
  return (
    <Section id="faq" className="bg-surface-container-low">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div className="flex flex-col gap-4">
          <Eyebrow>Questions</Eyebrow>
          <H2>Frequently asked</H2>
        </div>
        <div className="flex flex-col divide-y divide-outline-variant rounded-lg border border-outline-variant bg-surface-container-lowest">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-title-md font-semibold text-on-surface">
                {f.q}
                <ChevronDown aria-hidden className="size-5 shrink-0 text-on-surface-variant transition-transform group-open:rotate-180" />
              </summary>
              <p className="pt-3 text-body-lg text-on-surface-variant">{f.a}</p>
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
      <div className="grid gap-10 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 sm:p-10 lg:grid-cols-[1fr_1.4fr]">
        <div className="flex flex-col gap-4">
          <Eyebrow>Become a pilot partner</Eyebrow>
          <H2>Manage water points in {site.regions}?</H2>
          <p className="text-body-lg text-on-surface-variant">
            Tell us about your organisation and how faults are handled today. We read every enquiry and reply by email.
          </p>
          <p className="text-body-md text-on-surface-variant">
            Prefer email? Write to{" "}
            <a className="font-medium text-primary underline underline-offset-2" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
            .
          </p>
        </div>
        <ApplyForm />
      </div>
    </Section>
  );
}
