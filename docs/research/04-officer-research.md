# Programme officer: PRD audit, Mobbin research and recommended flow

## 1. What the PRD asks of the programme officer

| Source | Requirement |
|---|---|
| §5 | Primary user. Owns the water point portfolio. Needs **one place** to see open faults, pending estimates, funding decisions **and confirmed repairs**. The routine trigger is a daily or weekly check of the open faults list. |
| §5, §16 | The pilot has ten water points; a real officer may manage far more. The officer experience must hold at a larger portfolio. |
| §6 story 11 | See all open faults grouped by status, to know what needs action. |
| §6 story 12 | Act on a rejected funding decision: resubmit, escalate or abandon. |
| §6 story 13 | Open a water point record: fault history, **costs** and **restoration confirmations**. |
| §6 story 14 | Reassign a custodian or technician so the fault does not stall. |
| §6 story 15 | Export water point records for reports. |
| §7 feature 5 | Water point record display rules: no cost without a diagnosis, "funding approved, not disbursed", no "service restored" without confirmation, a labelled empty history, `event_time` and `synced_at` on every record. |
| §10 | View all water points; reassign; act on rejected funding; export; see custodian phone numbers for portfolio points only, every view logged. Cannot report, diagnose, approve, disburse or confirm. |
| §13 | Time between steps, confirmation rate, points with a fault, completeness. **Signals, not statistics. Do not invent targets before the baseline exists.** |
| §14 risk 2 | The open faults list is the first screen after login. Measure how often it is opened. No notifications in version one. |

## 2. What exists today

| Have | Missing |
|---|---|
| Open faults grouped by who acts next, search, state filter, CSV | **No analytics** on any officer page |
| "1 need you" in the subtitle | No sense of **which faults are stuck**: age is shown, but not whether that is unusual |
| Fault record: stepper, timeline, details, timestamps | **Confirmed repairs** (§5): closed faults are not visible anywhere in the officer's views |
| Reassign, abandon, act on rejected funding (dialogs) | Every action is a dialog behind the full record; nothing can be done from the list |
| Water point list and record | Water point record has **no cost or confirmation summary** (§6 story 13) |
| Exports page: four fixed CSV cards | Exports cannot be filtered by date or status; no report view to read before exporting |
| | Moving through the queue means going back to the list after every fault |
| | State is the only filter: it will not scale past one region (§5, §16) |
| | No officer settings (theme, text size are admin-only today) |

## 3. Mobbin research (web)

### App layer: the officer's home is a work queue with a summary on top
- [Zendesk dashboard](https://mobbin.com/screens/e470e94f-f275-40f1-8441-7b3ec672e2fe): small "Open tickets: you / groups" figures above "Tickets requiring your attention (25)", grouped by priority. Figures first, then the queue.
- [Asana inbox](https://mobbin.com/screens/45ed5fd9-5b1f-4c5a-b035-5bccd57bb15f): "Requires your action" summary on top, then overdue items grouped by day, with the late date in red.
- [Zoho CRM workqueue](https://mobbin.com/screens/27de1fa4-2064-41f5-a9ce-79702e76eae9): "Late by 3 days" written in words on each row, not as an icon.
- [Plain](https://mobbin.com/screens/fd1b6ca0-36c4-48dc-aae8-fe2af470ed72): views in the sidebar with counts (Todo, Snoozed, Done), filters as removable chips above the list.

### Screen layer
- **List:** [Linear](https://mobbin.com/screens/2579f037-4e90-4330-ac35-19323ca9828a), [Plane](https://mobbin.com/screens/b274b760-5c97-4900-ae57-115489320c86) and [hilos](https://mobbin.com/screens/7eac860e-33e9-4de1-8dfe-fe6d1dbe1fb8): collapsible status groups with counts; one "Add filter" menu that scales to many fields instead of a row of fixed toggles. hilos puts "Recommended next" above the groups.
- **Record:** [incident.io](https://mobbin.com/screens/fe969887-afe1-41ae-991e-cda75c5a50d7): timeline on the left; properties on the right, including **"Timestamps and durations"**, and a single Escalate action in the header. [Jira](https://mobbin.com/screens/4ecaec7d-b384-4747-b30e-8735992c5ecf): assignee is edited **in place** in the details panel ("Assign to me"). [Linear issue](https://mobbin.com/screens/62c94bcd-0559-4356-9d0e-bce71c021d88): "2 / 5" with up and down arrows to step through the list without going back.
- **Water point record:** [Jobber job](https://mobbin.com/screens/50f5f03d-9bbb-4e5b-aae8-7051e509dbd6): one cost strip on top (total, labour, expenses, margin) before the line items. [AWS budget](https://mobbin.com/screens/92bc0ac5-f7f8-4e2b-9738-75d11897f30f): health summary, then details, then history.
- **Reports:** [Better Stack "Resolved"](https://mobbin.com/screens/acb885f3-2a0c-46b6-832d-593c00ae6045): filters on top, one chart, four figures (count, total length, MTTR, MTTA) and **Export CSV directly under the figures it exports**. [Front workload](https://mobbin.com/screens/32987909-e219-442e-89a4-249ab388376b): key metrics on the left, one trend chart on the right.

### Component layer
- **Row actions:** [Uxcel](https://mobbin.com/screens/5fabe12a-1f7f-4c6e-8fb3-5027c9ecbba2) and [Productboard](https://mobbin.com/screens/4cc50c8a-c184-4f73-b4f6-6faa9acde2cf): a "⋯" on hover opening a short menu of the row's actions.
- **Saved views:** [Attio](https://mobbin.com/screens/a1cca18c-6359-46c4-a986-a46332943a05): a views dropdown above the table.

## 4. Recommended officer flow

Four pages, one job each. Every page has a summary strip on top that doubles as its filters (as in admin).

### 4.1 Open faults (first screen, §14 risk 2)
1. **Summary strip, clickable as filters:** Open · Needs you · Slower than usual · Waiting on custodian. A small "reported vs closed, last 8 weeks" chart sits at the right.
2. **"Needs you" first.** Rejected funding sits above the groups with its three actions inline (Ask for revision, Escalate, Abandon). No need to open the record.
3. **"Slower than usual" flag on each row.** A fault is flagged when it has been in its current step longer than the portfolio's median for that step (needs at least 3 past examples). This uses the baseline itself, so no target is invented (§13). The row says it in words: "12 days with technician · usual 4".
4. **Row "⋯" menu:** Reassign technician, Reassign custodian, Show custodian phone (logged), Open water point.
5. **Groups collapse**, and the state toggle becomes an **"Add filter"** menu (state, LGA, fault type, technician) so it scales to a large portfolio.
6. **View tabs:** Open · Closed. Closed lists restored and abandoned faults with time to restore, and covers "confirmed repairs" (§5).

### 4.2 Fault record
1. **"3 of 7" with up and down arrows** (and j / k keys) to move through the current list.
2. **One primary next action** in the header, chosen by status (for example "Ask for revised estimate" when rejected). Everything else goes in a "⋯" menu.
3. **Technician and custodian editable in place** in the details panel; this replaces the Reassign dialog.
4. **"Time in this step"** with the portfolio median beside it, under the stepper.

### 4.3 Water points
1. **Strip:** With an open fault · No faults recorded · Restored this period · Disbursed to date.
2. **Table gains "Days without water"** (age of the open fault) and **"Spent"** (disbursed to date).
3. **Water point record:** a cost and outcome strip on top (faults, disbursed, median days to restore, confirmations "x of n"), then the history as now, keeping every §7 feature 5 display rule.

### 4.4 Reports (replaces Exports)
1. Period filter (last 30 / 90 days / pilot to date) and state.
2. The §13 signals for the portfolio: median days per step (bars), confirmation rate, points with a fault, completeness, spend disbursed per month.
3. **Export under what it exports:** "Export these faults", "Export water points".

### 4.5 Settings (new for the officer)
Profile and Appearance only, reusing the admin settings sections.

## 5. Decisions needed

1. **"Slower than usual"**: compare against the portfolio median (recommended, PRD-safe), or fixed day limits set by the admin?
2. **Opening a fault**: full page with "3 of 7" arrows (recommended), or a side panel over the list?
3. **Officer settings page** with Profile and Appearance: yes (recommended) or no?
