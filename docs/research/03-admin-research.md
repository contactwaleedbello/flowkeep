# Admin: PRD audit, Mobbin research and recommended flow

## 1. What the PRD asks of the admin

| Source | Requirement |
|---|---|
| §5 | The organisation admin manages water points, assignments and user invitations. |
| §6 story 16 | Add and edit water points. |
| §6 story 17 | Assign custodians and technicians to water points. |
| §6 story 18 | Invite users and set their roles. |
| §6 story 19 | Record consent for a custodian's phone number. |
| §6 story 20 | Merge duplicate faults (optional; may be cut). |
| §10 | The admin views all records, reassigns custodians and technicians, adds and edits water points, invites users, records consent, merges duplicates, exports, and sees all phone numbers. |
| §12 | Water point list and editor (add, edit, **archive**). Assignment screen. User management (invite, set roles, **deactivate**). Consent (date and purpose). Duplicate merge: keeps the earlier report date, lists all reporters, writes a correction. Correction log. Phone access log. CSV export. |
| §13 | Signals: time from report to diagnosis, diagnosis to decision, decision to disbursement, disbursement to repair. Share of faults with a custodian confirmation. Share of water points with at least one fault. Data completeness. Correction count. Merge count. Always presented as signals, not statistics. |
| §14 risk 2 | Measure how often the open faults list is opened. |

## 2. What exists today (`/app/admin`)

| Have | Missing |
|---|---|
| Four tabs: water points, people, corrections, phone access | No overview or home: the admin lands on a raw table |
| Add water point (dialog) | **Edit** and **archive** water points |
| Invite person (name, role, phone) | **Set or change role** and **deactivate** |
| Record consent (one click) | **Assignment screen**: no way to link custodians and technicians to water points |
| Correction log, phone access log (read-only) | Duplicate merge |
| | Export from admin |
| | **Any analytics** |

## 3. Mobbin research

### App layer: admin home
- [Confluence "Mission control"](https://mobbin.com/screens/351d6ba6-5d27-4f35-a02c-62005c23480f): three metrics, each with a change since last week, then a short list of suggested actions.
- [GitBook](https://mobbin.com/screens/f80c74f2-ca25-44d0-a036-05e773ae535f) and [Squarespace](https://mobbin.com/screens/11597f3f-1bd9-4eb6-9ddf-e542e782b69e): a setup checklist ("2/7 tasks") that disappears once the setup is done.
- [Vanta](https://mobbin.com/screens/26569a72-16c2-43a9-b1f9-984acc978658): "Needs attention 7" with an OK/total progress bar for each area. A health view rather than a dashboard.
- [Searchable](https://mobbin.com/screens/1c85a710-adcf-4dfb-8da7-a42087b25aef): "You have 14 outstanding issues", with each issue linking to its fix.

### Screen layer
- **Members:**
  - [Hashnode](https://mobbin.com/screens/8e2f4a34-2689-4461-aae2-e0032539b387) splits Team members and Pending invites into tabs.
  - [Whop](https://mobbin.com/screens/4fedd146-cccc-4350-a962-fc0de2188177) lets you change a role inline in the table.
  - [Square](https://mobbin.com/screens/8958b061-bdcd-4afa-b1e7-49f8cbf321dd) opens a person in a side panel, with a pending-invite warning.
- **Invite:**
  - [Dub](https://mobbin.com/screens/b810f603-540c-4891-a0f2-9358d8714a58) uses one row (email plus role) and "+ Add email".
  - [Browserbase](https://mobbin.com/screens/8a75c30d-da78-4255-811a-bb947588c758) gives each invite row its own access and role.
  - [Emergent](https://mobbin.com/screens/7705fc6b-efdd-4784-bbc8-d07d743ea2c1) explains each role inside the picker.
  - [Calendly](https://mobbin.com/screens/b32a4f5e-1ec5-4a66-9e09-2e638fe954e1) adds an optional "group to join" step.
- **Assignment:**
  - [Jira](https://mobbin.com/screens/8ee03824-8a10-4a60-bdf1-727c0e9ecbb1) and [Notion](https://mobbin.com/screens/bb37c98b-4f9a-4fef-967c-40225bc2e9b6) assign inside the table cell.
  - [Coda](https://mobbin.com/screens/86c1609a-d899-449c-b941-1dc1cea10ffe) puts **"Invite person" inside the picker**.
  - [7shifts](https://mobbin.com/screens/2863ad86-8ba8-4085-99e0-edd4ef735cc7) uses a full assignments matrix, which is too heavy for 10 water points.
- **Record editing:**
  - [Twenty](https://mobbin.com/screens/86a114d8-1a8e-4795-a639-c8dda8ee916a) edits in a side panel next to the table.
  - [Supabase](https://mobbin.com/screens/0a79f28f-5748-4b74-9a0d-c88e810fecf8) has "Create more" for adding records in a row.
  - [Airwallex](https://mobbin.com/screens/7fdaa335-66f2-4f68-b54c-f88f0f8243cf) has "Add another location".
- **Figures above a list:** [Time2book](https://mobbin.com/screens/20f17798-e888-4f07-b3b5-ae220760d13c) shows "Total clients 2 · With active plans 1".
- **Audit log:**
  - [Grok](https://mobbin.com/screens/359bc6c1-d2fd-45ed-871f-e37f4305ce7b) has an events-over-time bar chart above the log, with filters that show counts.
  - [PlanetScale](https://mobbin.com/screens/8af442b9-2a21-43a6-a2b5-5b2ff3fbc79d) writes each entry as a sentence with a mono event code.
  - [Zoho](https://mobbin.com/screens/b27943e6-e8ff-4fc0-8d27-dfe0c33c124f) groups entries by day.
- **Merge:**
  - [folk](https://mobbin.com/flows/b4c3bac2-0e97-461c-bd67-3a18e4fd2981) shows a "Duplicates" page with a count in the sidebar, the two records side by side, and Merge or Don't merge.
  - [Kajabi](https://mobbin.com/flows/239c13c6-33a1-405e-83ee-917713f12742) asks you to confirm with "cannot be undone".
  - [Xero](https://mobbin.com/flows/2001e4f6-f444-40d1-b665-6786b30a7fcf) merges by selecting rows, then using a toolbar action.

### Analytics
- [Plain](https://mobbin.com/screens/72526f03-b98d-4df9-8c99-27e59a321ccc): "Median first response time 1d 12h", with breakdown bars and change arrows. **This is the closest match to the §13 time signals.**
- [n8n Insights](https://mobbin.com/screens/0da64661-4929-44d2-97a9-103a140c21ae): a strip of figures where the selected one drives the chart below.
- [Jobber](https://mobbin.com/screens/a1a771f4-0d94-480d-a179-655950bb7141): "Lead conversion time, 30-day average" next to a stage funnel.
- [TravelPerk](https://mobbin.com/screens/6acbda1a-91cd-4afa-88c0-0f11b855eb53): says "No data for previous period" honestly instead of showing a fake comparison.
- [Apollo data health](https://mobbin.com/screens/b36c564d-0708-41cb-abdb-46e68975f8cf): shares as percentages, each with a "View contacts" action. Every figure leads to the rows behind it.

## 4. Recommendation

### Principles
1. **The admin's work is the setup: people and places.** Four destinations, no more: **Overview, Water points, People, Activity.** Duplicates appear as an item in Overview's needs-attention list when there are any.
2. **Assign where the place is.** Assignment is not a separate screen. Custodian and technician are cells in the water points table, picked inline, with "Invite someone new" inside the picker (Coda). That covers the §12 assignment screen in the fewest steps.
3. **Every figure leads somewhere.** Each number on a page filters the table below it (Apollo, n8n). No decorative charts.
4. **Edit in place, never navigate away.** Rows open a side panel (Twenty, Square). Adding uses the same panel, with "Add another".
5. **Signals, not statistics (§13).** Medians, counts and shares carry a small "n = …" and say "not enough data" honestly (TravelPerk).

### Information architecture

| Destination | Purpose | Analytics on the page |
|---|---|---|
| **Overview** | Setup checklist (hidden when complete), **Needs attention** list, then the §13 signals | Median days for each stage (bars), confirmation rate, water points with a fault, data completeness, corrections and merges, officer list opens this week (§14 risk 2) |
| **Water points** | Table: ID, name, place, custodian ▾, technician ▾, now, faults. Side panel to edit or archive. Add with "Add another". Export CSV | Strip: total · with an open fault · never reported · missing custodian or technician. Each one is a filter |
| **People** | Tabs: Active / Invited / Deactivated. Inline role ▾. Consent column with a one-click "Record". Side panel: water points, consent, deactivate. Invite modal (one row each: name, phone, role, water points) | Strip: count per role · invites pending · custodian phone consent (as a bar) |
| **Activity** | One log for corrections and phone views, filtered by chips. Sentences grouped by day, mono event codes. Export CSV | Events per week (bars), breakdown by type |

### The shortest path to each PRD goal

| Goal | Path | Clicks |
|---|---|---|
| Add a water point | Water points → Add → fill → Save (or Save and add another) | 3 |
| Edit or archive | Row → panel → change → Save / Archive | 3 |
| Assign a technician | Technician cell ▾ → name | 2 |
| Assign someone new | Cell ▾ → "Invite someone new" → name and role → Invite and assign | 4 |
| Invite | People → Invite → row → Send | 3 |
| Change a role | Role cell ▾ → role | 2 |
| Deactivate | Row → panel → Deactivate → confirm | 4 |
| Record consent | Overview "2 custodians missing consent" → Record → confirm | 3 |
| Merge duplicates | Overview "1 possible duplicate" → side by side → Merge → confirm | 3 |
| Export | Export CSV on the table | 1 |

### Duplicate detection (demo rule)
Two open faults at the same water point, both reported within 72 hours. The merge keeps the earlier report date, lists all reporters (§12), and writes a correction.
