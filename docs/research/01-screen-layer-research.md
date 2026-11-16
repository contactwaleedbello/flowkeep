# Flowkeep: Mobbin Research Summary

## Research goal
Find real-app references for the Flowkeep v1 screens where design decisions carry the most risk: the officer's open faults list (PRD §6 story 11, §14 risk 2), the fault record and timeline (§7 feature 5, §11), funding approval and disbursement (§7 feature 3), the custodian report form (§7 feature 1), the technician job list (§6 stories 4–7), offline and sync status (§9), and the restoration confirmation (§7 feature 4, §14 risk 3).

## Searches used
Web (programme officer, approver, admin):
- `search_screens` "issue tracker list view grouped by status with count per group"
- `search_screens` "ticket detail page with activity timeline of status changes and who made each one"
- `search_screens` "expense approval detail with approve and reject buttons and a comment field"
- `search_screens` "asset detail page with current status and maintenance history table"

iOS (stand-in for the phone screens custodians and technicians use; Mobbin has no Android):
- `search_screens` "report a problem form with issue type selection and optional note"
- `search_screens` "field service technician job list with assigned work orders and status"
- `search_screens` "offline banner with changes waiting to sync"
- `search_screens` "confirmation question asking if the issue was resolved with yes and no buttons"
- `search_flows` "reporting a problem with a public service and tracking its status"

## Pattern clusters

### 1. Open faults list: grouped by status, with counts (§6 story 11, §14 risk 2)
- [Linear](https://mobbin.com/screens/610d34b6-6ad8-45ab-80fb-2107b31ed01e) and [Plane](https://mobbin.com/screens/b274b760-5c97-4900-ae57-115489320c86): collapsible status groups with a count in each header. Rows are one line: ID, title, label chips, date, assignee.
- [hilos](https://mobbin.com/screens/7eac860e-33e9-4de1-8dfe-fe6d1dbe1fb8): a "Recommended next" box above the grouped list, each item with its own action button, plus filter dropdowns for status, person and project.
- [Asana](https://mobbin.com/screens/bca47125-14ae-4413-a719-927c75a679fe) and [Airtable](https://mobbin.com/screens/7612f4c4-4104-4dbc-8e5f-579dde687f2b): a total or average for each group, such as summed duration.
- Kanban boards ([Slack](https://mobbin.com/screens/50a69d82-266a-4785-8cfe-7bc829b1c3b2), [Wrike](https://mobbin.com/screens/b519f90f-f918-4c4e-b567-8d5b6031b3ba)) only work with 3 to 5 columns. Flowkeep has 11 states, so a board would not fit.

### 2. Fault record: a step tracker, a timeline, and named timestamps (§7 feature 5, §11, §13)
- [incident.io](https://mobbin.com/screens/5b8715c5-d502-4b69-a4b8-d7275ee08a83) is the closest match. A stage stepper runs across the top (Investigating › Fixing › Monitoring › … › Closed). The feed writes each status change as old → new with the person's name. A side panel lists named timestamps (Declared at, Identified at, Fixed at) and labels duration metrics "Missing timestamps" when a step is missing.
- [Plane history](https://mobbin.com/screens/2be3d4e1-ebd8-42c7-bd36-86d20567c191) and [Jira](https://mobbin.com/screens/4ecaec7d-b384-4747-b30e-8735992c5ecf) phrase each event as "<person> set the state to X", with the old and new values below. Jira separates All, Comments and History into tabs.
- [Basecamp](https://mobbin.com/screens/07446502-ce66-4714-a13d-fd4d6b9707a9) shows a plain vertical history with the date and time above each sentence. It reads well for people who don't use software much.
- [PlanetScale](https://mobbin.com/screens/78880fb1-c0dc-4307-a635-1fb9a0c5527e) marks each decision with a green check or red cross on the person's avatar.
- [Deputy](https://mobbin.com/screens/fd1a02ca-3bc4-47eb-bd05-a63926f531a3) and [HubSpot](https://mobbin.com/screens/5e998e05-4aba-45ea-b1a3-d6f10af9e464) show edits as field rows with a before → after value, who changed it, and when. Deputy also says "updates may take up to 90 seconds", so it admits the delay.
- [Docusign envelope history](https://mobbin.com/screens/3b9577ec-b873-41e6-8a9b-82588f79da3b) puts a metadata block on top (ID, dates, status, holder, **time zone**) above a table with Time, User, Action, Activity and Status, and offers Print and Download Certificate.

### 3. Funding approval: one detail panel, the decision fixed at the bottom (§7 feature 3)
- [Aboard](https://mobbin.com/screens/473a91f7-3b9f-4e2b-9c22-ff199209aa7f): a side panel with amount, date and category, then an "Approval flow" card (Requested by ✓ → Approver, Awaiting approval), with Reject and Approve at the bottom. Approve opens a modal with a comment field.
- [Airwallex](https://mobbin.com/screens/a21ef4c4-38e3-475e-b8b0-2618f40df869): a "Pending your approval" badge, a report activity stepper, and **Request resubmission** next to Approve.
- [Mercury](https://mobbin.com/screens/cbeea523-ac61-492f-b65f-2d715ab9be54): the amount in large type, a two-step mini timeline (Submitted → Pending review), and Approve and Decline placed inline.
- [Expensify](https://mobbin.com/screens/3eeed405-32d1-4bc4-bb42-04d44b5286a5): Reject opens a popover with a memo field, so a reason is collected at the moment of rejection.
- [Acctual](https://mobbin.com/screens/06ec87de-4b09-49d0-8f4f-158a28705fd2): queue tabs for Draft, **Approve (2)**, **Ready for payment (3)** and **Paid (2)**. This is the same approve-then-disburse split as Flowkeep.
- [Remote](https://mobbin.com/screens/746b65b6-be60-487d-8733-c4a22a5b947c): a decided record shows "Reviewed by" and "Reviewed date" as fields of their own.

### 4. Fault report on a phone: a few large choices, then an optional note (§7 feature 1)
- [Citi Bike](https://mobbin.com/screens/145c017d-11b2-41dc-8e5b-46c784bcd314) is a report about public infrastructure: a big "What's the issue?" heading with a short list of types (Damaged station, Blocked path…).
- [Woolworths](https://mobbin.com/screens/dfa01bc2-0e3b-420f-8fae-d938123dfcc9) shows all four types as radio rows, with no dropdown to open.
- [Bird flow](https://mobbin.com/flows/4bb0fda2-0003-46b3-b0e0-9ab39d7a7721) reports damage to a physical asset. Step 1 asks which asset (scan the QR code or enter the ID). Step 2 asks what happened, with full-width pill buttons (Brakes, Throttle, Other). Then "Thanks for reporting" explains what happens next.
- [Zocdoc flow](https://mobbin.com/flows/738493c5-d024-4e02-aa30-54cce4579163) starts the report from the item itself, so the form opens with a filled-in context card at the top.
- [Temu](https://mobbin.com/screens/51c5d893-3cba-4c87-b1c9-995d16501164) offers "or Request a phone call to report", a second way in for people who can't use the form.
- [Klarna](https://mobbin.com/screens/08bc07a4-8fc3-440c-9c8a-aca523d72f7a) puts "Try to avoid sharing sensitive information" under the note field.

### 5. Technician and custodian lists: "what's mine" first, with status on each card (§6 stories 1–7)
- [Jobber](https://mobbin.com/screens/536351e7-656d-444e-867d-38eb7f48e146) shows a job with a status chip, title, address with a directions icon, start date, one large primary button, a call icon, and Job and Notes tabs.
- [Linear Mobile](https://mobbin.com/screens/50ce5570-0d23-48b2-84c3-7b28a0e4414b) has Assigned, Created and Subscribed tabs, with a list grouped by status under each.
- [talabat](https://mobbin.com/screens/2d1ee2a9-8c70-4868-be60-f4fcc3cd6bfc) uses request cards with "Request created: Today, 12:16 PM", a status pill and a title.
- [Angi](https://mobbin.com/screens/4ea190d7-5a91-424e-ac6c-b5609ef2a510) has In progress and Done tabs, and a "Mark as done" button on the card itself.
- [Brex Tasks](https://mobbin.com/screens/47dfde64-0ad0-41c6-978c-c56480db69de) lists only items that need the user, each with an inline action button.

### 6. Offline and sync: save locally and show the queue without blocking (§9)
- [Docusign](https://mobbin.com/screens/42948b73-a83c-40c0-819c-6f96133201dc) is the model: a slim "Syncing offline envelopes" bar, and each row says "Sync pending" next to its local time.
- [ClickUp](https://mobbin.com/screens/36a56a25-7486-4fd9-8901-985a5f111453) shows a toast with "Reminder saved" on the left and "Syncing now" on the right, keeping *saved* separate from *synced*.
- [Gumloop](https://mobbin.com/screens/67b777c8-be9b-4275-9dd5-16bab0abc5ab) puts a "Synced" pill on each history entry.
- [LARQ](https://mobbin.com/screens/6b859147-a151-4dd4-b92e-9e8e5fd0ae81) labels a device "OFFLINE", with a banner saying it "hasn't connected in a while".
- Avoid: [Qantas](https://mobbin.com/screens/18f77caf-19d5-4199-98b4-a36f34096d23), [GoPay](https://mobbin.com/screens/95483b32-a4d7-4025-b6e7-64220245eff5) and [Alta](https://mobbin.com/screens/2b00c4b9-d2a6-4a6a-9d95-2aba49348be1) replace content with an offline error or say nothing can be sent. §9 says the custodian screen must never block on a network call.

### 7. Restoration confirmation: one question, two answers written as sentences (§7 feature 4)
- [Bumble](https://mobbin.com/screens/f7e245fd-40b4-4058-be8a-d6b2e3994f94) uses a bottom sheet asking "Did you and X meet?", with two full-width buttons that are whole answers ("Yes, we met" / "No, we didn't meet") and one line of reassurance.
- [Afterpay](https://mobbin.com/screens/e7c6f4c4-2d00-434e-ab58-81cb6a3078d7) shows a question heading and an explanation, with two stacked full-width buttons that say what happens next.
- [Lyft](https://mobbin.com/screens/5ec1b9d8-8f27-433c-927b-33cfdf6ded3c): "Did this solve your issue?" with Yes and No side by side at equal weight.
- [talabat](https://mobbin.com/screens/a67a01ea-9282-4c1d-9d3d-64a39f92ca51) uses Yes and No radios, an optional comment, and Finish. This takes more taps but captures a note.

## Key observations
1. **Tracking tools group work by status, and approval tools group it by whose turn it is.** Linear and Plane group by state. Acctual and Brex group by the next action. Flowkeep's 11 states are too many to scan, but they reduce to about four "waiting on" groups.
2. **Products where the record matters most show timestamps as named fields, not only a feed.** incident.io and Docusign both pull key times out of the timeline into labelled fields and flag gaps. This matches §13, where every signal is the gap between two named timestamps.
3. **Approval screens show the full chain on the decision screen.** Aboard, Airwallex and Mercury all show who submitted, who is deciding and what happens next. Approvers can see they are one step in a chain, which supports the PRD's separate steps for decision and disbursement.
4. **Rejection usually comes with a reason and a next step.** Expensify asks for a memo, and Airwallex calls it "Request resubmission" instead of a plain reject. That matches §11, where a rejected estimate keeps the fault open.
5. **Good offline apps confirm "saved" right away and treat "synced" as a separate state.** Docusign and ClickUp do this. The apps that block the screen when offline are consumer apps that assume a connection.
6. **Asset reporting starts from the asset.** In Bird and Zocdoc, choosing the object comes first and the problem second, which matches §7 feature 1 (choose the water point, then the fault type).

## UX opportunities
- Turn the officer's first screen (§14 risk 2) into a "waiting on" view instead of a raw status list, so it answers what needs action today.
- Put the §13 signals (time to diagnosis, decision, disbursement, repair) in the fault record as a strip of durations, so the record and the pilot metrics are the same data.
- Make "Sync pending" visible on every record, which §9 already requires, and show both `event_time` and `synced_at` without cluttering the record for people who only report faults.
- Make the custodian's confirmation the easiest screen in the product (§14 risk 3). The confirmation rate is what proves the product works.

## Recommendations
1. **Open faults list (web, §6 story 11):** use Linear/Plane-style grouped rows, but group by *who acts next*:
   - Waiting on technician: `reported`, `funding disbursed`, `awaiting parts`
   - Waiting on approver: `estimate submitted`, `funding approved` (needs disbursement)
   - Waiting on custodian: `repair reported complete`, `partially repaired`, `repair failed`
   - Needs officer: `funding rejected`

   Show the exact status as a pill on each row, along with days in the current state. Add a "Needs your action" box at the top for the signed-in role, like [hilos](https://mobbin.com/screens/7eac860e-33e9-4de1-8dfe-fe6d1dbe1fb8).
2. **Fault record (web, §7 feature 5):** follow [incident.io](https://mobbin.com/screens/5b8715c5-d502-4b69-a4b8-d7275ee08a83).
   - Across the top, a 6-step tracker: Reported › Estimate › Decision › Disbursed › Repair › Verified. A return to `reported` shows as a loop-back marker, not a reset.
   - Below it, a timeline phrased like Plane: "<name> (<role>) <action>", with old → new status.
   - On the right, a "Timestamps" panel with each step's `event_time` and `synced_at`. A step that never happened says "Not recorded" and is never left blank, which follows §7's "no cost" and "not disbursed" rules.
   - Mark superseded diagnoses and estimates with strikethrough, the way incident.io marks old values.
3. **Approval (web, §7 feature 3):** follow [Aboard](https://mobbin.com/screens/473a91f7-3b9f-4e2b-9c22-ff199209aa7f).
   - The approver works in a side panel with the estimate amount in large type, the diagnosis and parts, and a chain card (Technician submitted ✓ → You, awaiting decision).
   - Reject requires a note, like [Expensify](https://mobbin.com/screens/3eeed405-32d1-4bc4-bb42-04d44b5286a5). The PRD makes it optional, but a rejection without a reason leaves the officer nothing to act on under story 12.
   - Approver queue tabs follow [Acctual](https://mobbin.com/screens/06ec87de-4b09-49d0-8f4f-158a28705fd2): **To decide**, **To disburse**, **Disbursed**.
4. **Report a fault (phone, §7 feature 1):** a two-step form like the [Bird flow](https://mobbin.com/flows/4bb0fda2-0003-46b3-b0e0-9ab39d7a7721).
   - Step 1 is the water point list; skip it automatically if only one point is assigned.
   - Step 2 shows fault types as full-width buttons, as in [Woolworths](https://mobbin.com/screens/dfa01bc2-0e3b-420f-8fae-d938123dfcc9), with no dropdown. The note field is optional.
   - For assisting users, add a required "Reporting for:" custodian picker at the top. The receipt names both people.
5. **Technician home (phone):** cards like [Jobber](https://mobbin.com/screens/536351e7-656d-444e-867d-38eb7f48e146), each showing the water point, community, status chip, days open, and one primary button labelled with the next action ("Record diagnosis", "Record repair outcome").
6. **Offline (§9):**
   - A slim persistent bar ("3 records waiting to sync · Sync now"), like [Docusign](https://mobbin.com/screens/42948b73-a83c-40c0-819c-6f96133201dc).
   - A "Sync pending" tag on each row.
   - A toast after every save that says "Saved on this phone" and is separate from the sync state, like [ClickUp](https://mobbin.com/screens/36a56a25-7486-4fd9-8901-985a5f111453).
   - Warn from about day 10, before the 14-day cap: "Some records are 10 days old. Connect to sync before they expire."
   - Never put up a full-screen offline block.
7. **Restoration confirmation (phone, §7 feature 4):** a single screen modelled on [Bumble](https://mobbin.com/screens/f7e245fd-40b4-4058-be8a-d6b2e3994f94) and [Afterpay](https://mobbin.com/screens/e7c6f4c4-2d00-434e-ab58-81cb6a3078d7).
   - A water point card on top with "Technician marked repair complete on <date>".
   - The heading "Is water flowing at <point>?"
   - Two full-width buttons: "Yes, water is flowing" / "No, water is not flowing".
   - A small line underneath: "This confirms water flow only, not that the water is safe to drink" (§11 rule).
   - The "No" path offers an optional note, then returns the fault to `reported`.
8. **Correction log and phone access log (admin, §12):** use [HubSpot](https://mobbin.com/screens/5e998e05-4aba-45ea-b1a3-d6f10af9e464)-style tables with Field, Previous value, New value, Reason, By and Date. Use the [Docusign](https://mobbin.com/screens/3b9577ec-b873-41e6-8a9b-82588f79da3b) layout for the export and print view of a single water point record.

## Reusable patterns
| Pattern | Use in Flowkeep | Reference |
|---|---|---|
| Collapsible group header with count | Officer open faults list | [Linear](https://mobbin.com/screens/610d34b6-6ad8-45ab-80fb-2107b31ed01e) |
| "Recommended next" action box | Top of each role's home | [hilos](https://mobbin.com/screens/7eac860e-33e9-4de1-8dfe-fe6d1dbe1fb8) |
| Stage tracker across the top | Fault lifecycle | [incident.io](https://mobbin.com/screens/5b8715c5-d502-4b69-a4b8-d7275ee08a83) |
| Named timestamps panel with a "missing" label | `event_time` / `synced_at`, §13 signals | [incident.io](https://mobbin.com/screens/5b8715c5-d502-4b69-a4b8-d7275ee08a83) |
| Old → new status event row | Fault timeline | [Plane](https://mobbin.com/screens/2be3d4e1-ebd8-42c7-bd36-86d20567c191) |
| Field before → after diff rows | Correction records | [Deputy](https://mobbin.com/screens/fd1a02ca-3bc4-47eb-bd05-a63926f531a3) |
| Approval chain card | Estimate → decision → disbursement | [Aboard](https://mobbin.com/screens/473a91f7-3b9f-4e2b-9c22-ff199209aa7f) |
| Reject with a required reason | Funding rejection | [Expensify](https://mobbin.com/screens/3eeed405-32d1-4bc4-bb42-04d44b5286a5) |
| Queue tabs split by stage | Approver: decide / disburse | [Acctual](https://mobbin.com/screens/06ec87de-4b09-49d0-8f4f-158a28705fd2) |
| Asset first, then problem type as large buttons | Report a fault | [Bird flow](https://mobbin.com/flows/4bb0fda2-0003-46b3-b0e0-9ab39d7a7721) |
| Status card with created time | Custodian "My reports" | [talabat](https://mobbin.com/screens/2d1ee2a9-8c70-4868-be60-f4fcc3cd6bfc) |
| Job card with one primary next action | Technician home | [Jobber](https://mobbin.com/screens/536351e7-656d-444e-867d-38eb7f48e146) |
| Sync bar plus "Sync pending" on each row | Offline queue | [Docusign](https://mobbin.com/screens/42948b73-a83c-40c0-819c-6f96133201dc) |
| "Saved" toast separate from sync state | Every offline write | [ClickUp](https://mobbin.com/screens/36a56a25-7486-4fd9-8901-985a5f111453) |
| Yes/No buttons that are full answers | Restoration confirmation | [Bumble](https://mobbin.com/screens/f7e245fd-40b4-4058-be8a-d6b2e3994f94) |
| Audit table with metadata header and Print | Water point record export | [Docusign](https://mobbin.com/screens/3b9577ec-b873-41e6-8a9b-82588f79da3b) |

## Gaps
- iOS references stand in for the Android phones that are likely in the field. Check tap-target sizes and how the design holds up on low-end Android screens.
- No references were found for USSD or feature-phone reporting. The assisting user path (§5) is the v1 answer.
- The PRD's `awaiting parts` state has no exit transition in §11. The stepper needs one before it can be built.
