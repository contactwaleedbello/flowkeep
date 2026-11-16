# Flowkeep: Layered Mobbin research (app, screen, component)

Research for the Flowkeep design system and marketing site, organised in three layers:

- **App layer:** the shells and navigation each role lives in.
- **Screen layer:** the compositions for each job. Full write-up: [01-screen-layer-research.md](01-screen-layer-research.md).
- **Component layer:** the primitives the screens are built from.

A fourth set covers the **marketing site** sections.

iOS results stand in for the Android phones likely used in the field (Mobbin has no Android). Every reference links to Mobbin.

---

## 1. App layer

### Desktop shell (programme officer, approver, admin)
| Reference | What it shows | Used in Flowkeep |
|---|---|---|
| [Deel: Action required](https://mobbin.com/screens/ebede796-0ca0-408a-bf05-630420732e1f) | Sub-nav item "Action required (71)" with a count, filter chips over a table with "Pending your approval" pills and inline approve/deny, plus an Actions menu with "Export items on table" | Sidebar with counts; the work queue as the home screen; the export lives on the list |
| [Remote: Things to do](https://mobbin.com/screens/425014d9-aea0-4c7e-a217-d062da016d7f) | The home screen is a "Things to do (4)" list of cards with an icon, a one-line reason and a date; quick actions sit to the side | The "Needs your action" box at the top of each role's home |
| [Zoho CRM: Workqueue](https://mobbin.com/screens/27de1fa4-2064-41f5-a9ce-79702e76eae9) | "Late by 3 days" shown in the due column | "N days in this state" on every fault row |
| [Wrike: My to-do](https://mobbin.com/screens/20ad47f6-2249-48aa-a3c2-e8fb4503b4b0) | Grouped list on the left, detail panel on the right | List plus record split view for the officer (planned) |
| [Gumloop: Tasks](https://mobbin.com/screens/2cc8c0ea-01e2-4a82-8310-fa8283a85363) | Segmented tabs (All, Completed, Approval Required, Failed) above a table | `QueueTabs` |

### Phone shell (custodian, technician)
| Reference | What it shows | Used in Flowkeep |
|---|---|---|
| [Asana: My tasks](https://mobbin.com/screens/986b4600-b4e5-4dbf-a87c-093d8889883c) | Collapsible sections with counts, five-item bottom bar | Grouped technician list |
| [DoorDash Dasher](https://mobbin.com/screens/8a7bf325-46af-48ba-a1db-f8d9733f2fa8) | Large heading, rows tagged "Required", and a progress card that says how long a step usually takes | A large title, plus amber tags for work that needs action |
| [Jobber: Home](https://mobbin.com/screens/6b7ee6db-6399-4183-9696-c06bb51ca166) | Date at the top, a To-do list, bottom bar | Technician home |
| [ClickUp: My Work](https://mobbin.com/screens/0494d348-c628-4602-93f9-d8dfa47221eb) | Grouped by Today and Overdue, with overdue in red | Not used in v1, because the PRD has no due dates |

**Decision.** Every role's first screen is its own work queue (PRD §14 risk 2). Desktop uses a sidebar with counts. The phone uses a sync bar on top, one primary action and a three-item bottom bar (My faults, Report, Synced), so field users have fewer places to tap.

---

## 2. Screen layer

See [01-screen-layer-research.md](01-screen-layer-research.md). Built so far: `OpenFaultsList`, `FaultRecord`, `ApprovalPanel`, `TechnicianJobCard`, `CustodianHomePhone`, `ReportFaultPhone` and `ConfirmFlowPhone` in `src/components/patterns/screens.tsx`.

---

## 3. Component layer

### Status badge
| Reference | Observation |
|---|---|
| [Fresha](https://mobbin.com/screens/3b1a8630-7e3d-4e22-aa49-f38180943f60) | Open states use a tinted pill; the final "Completed" state is solid. **Adopted:** open states tinted, closed states solid. |
| [Relevance AI](https://mobbin.com/screens/c9df4ae4-6265-48ac-8e16-95220d542fce) | The pill carries an icon plus a label ("✓ Completed"), and tabs carry counts. **Adopted:** an icon on every status. |
| [Rox](https://mobbin.com/screens/3618e8a0-cb1e-4006-a050-c73c9243ddd4) | Error pill with an ✕ icon ("Enrichment failed"). **Adopted** for `repair failed`. |
| [Canva](https://mobbin.com/screens/5bc6bcff-a204-4f8f-a674-f065e5ce2c1c) | Amber "Needs review" pill. **Adopted:** amber means attention. |
| [folk](https://mobbin.com/screens/926b7a2c-bb35-4b5b-9613-52d580ccea48) | Beyond about 6 hues, colour stops carrying meaning. **Lesson:** 11 statuses share 6 tones, and the icon and label tell them apart. |

### Lifecycle stepper
| Reference | Observation |
|---|---|
| [Vestiaire Collective](https://mobbin.com/screens/984bf280-8384-4125-8136-360fc80eddf2) | The current step expands into a card with an "IN PROGRESS" badge, the deadline, what happens if it's missed, and an action. Upcoming steps say what to expect. **Adopted:** `VerticalSteps`. |
| [Bolt Food](https://mobbin.com/screens/9509b853-f44c-425e-81c0-c6e96efffe2c) | Times in a left column, done steps as green checks, the current step as an outlined ring. **Adopted:** the dot states. |
| [CVS Health](https://mobbin.com/screens/6ade5a53-e2a8-423e-b5d9-c135e5bf010c) | Check, filled current dot and hollow upcoming dots; the current label is bold and upcoming labels are grey. |
| [X Card](https://mobbin.com/screens/485ba275-39a1-4d3f-8e1c-b99c798ddd01) | A dashed line to the upcoming steps, with an "I Received My Card" confirm button below the stepper. The same idea as the custodian confirmation. **Adopted:** a dashed connector for upcoming steps. |
| [Shopee](https://mobbin.com/screens/5bd9141f-8c16-4f6b-b743-5ca9b64fe0ce) | Timestamps ("Today 18:15") in the left column, newest first. |

---

## 4. Marketing site sections

| Section | References | Decision |
|---|---|---|
| Hero | [Mews](https://mobbin.com/sites/sections/9f27c0cd-d796-4577-a68e-c253c571ea9d) (split hero, real product UI on the right), [Coda](https://mobbin.com/sites/sections/575a2e2e-f17f-4150-9673-3200318a9d8b) (problem-first subhead, one CTA), [TravelPerk](https://mobbin.com/sites/sections/add3a1c6-49da-4972-944f-0cc62c2d57d7) (warm off-white, one pill CTA) | Split hero on sand, a serif headline, product UI built from the design system (not a screenshot), one primary CTA |
| How it works | [Railway](https://mobbin.com/sites/sections/35a42526-d3b6-4e26-abf7-47667d6e7479) (vertical numbered steps on a line), [Clay](https://mobbin.com/sites/sections/28c16d19-1b1c-4c38-b06e-660c77901cbc) (numbered cards), [Beside](https://mobbin.com/sites/sections/2cfd3169-f61f-4ca5-bd2a-67627febbc84) (plain, honest copy) | Railway-style vertical steps with role chips, next to a sticky fault record |
| Partner CTA | [Profound](https://mobbin.com/sites/sections/b715d061-f18b-4282-894d-0a84c21af2e0) ("Apply to be a partner… We review applications on a rolling basis"), [MasterClass](https://mobbin.com/sites/sections/7e142e69-e4d9-4405-99cd-20000cb0f57a) (a qualifying question as the headline), [Twenty](https://mobbin.com/sites/sections/44ab2dcf-f350-45e1-af4a-3ae0c654e888) (two buttons) | A qualifying headline ("Manage water points in Adamawa and Kaduna?"), a form, and a plain line on what happens next |

**Rule from the PRD.** The marketing site invents no figures, logos or testimonials. Product previews are labelled as sample data, the reporting chain is labelled as an illustration, and results are not claimed before the baseline exists.
