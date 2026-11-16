# Approver: PRD audit, Mobbin research and recommended flow

## 1. What the PRD asks of the approver

| Source | Requirement |
|---|---|
| §5 | A person inside the partner with authority to approve or reject repair funding. A separate role; one person may hold more than one only if the partner confirms it. |
| §6 story 8 | See open estimates for the organisation, to approve or reject. |
| §6 story 9 | Record the decision **with a date** and an optional note, so the record shows why funding was given or withheld. |
| §6 story 10 | Record a disbursement, so the record shows money actually moved. |
| §7 feature 3 | List of `estimate submitted` faults. Decision record: approver name, decision, date, time, optional note, **funder source**. Disbursement: **date, amount, note**. |
| §10 | Approve or reject; record disbursement; **act on rejected funding**; view water point records for the organisation. Cannot export, cannot see custodian phone numbers. |
| §10 rules | Never change a funding decision without a correction record. |
| §11 | `estimate submitted` → `funding approved` / `funding rejected`; `funding approved` → `funding disbursed`. A rejected estimate keeps the fault open. |
| §13 | Two of the four timing signals are the approver's: estimate → decision, and decision → disbursement. Signals, not statistics; no invented targets. |
| §14 risk 6, §16 | The approver may not have budget authority; a named approver with a confirmed funding source is a pilot blocker. |

## 2. What exists today

| Have | Missing |
|---|---|
| One page, three tabs: To decide, To disburse, Decided and paid | **No analytics** of any kind |
| List plus a side panel with amount, diagnosis, parts, technician | **No context for the decision**: no spend history for the water point, nothing to say whether the amount is normal for this kind of repair |
| Approve (funder source + note), reject (reason), disburse (amount + note) as dialogs | **No date** on decisions or disbursements: always "now", so a payment made on Friday and entered on Monday is recorded wrong (story 9, §7) |
| Waiting time on each row | No sense of whether the wait is long; approved but unpaid faults do not stand out |
| | A disbursement can differ from the approved amount with no note |
| | No way to correct a decision or disbursement (§10 rule) |
| | Rejected faults disappear from the approver's view; §10 says the approver can act on them |
| | No water point records, no settings, a single nav item |
| | Funder sources are a fixed list in the code |

## 3. Mobbin research (web)

### App layer: one queue in two stages, money totals on top
- [Xero expenses](https://mobbin.com/screens/e4a6f6e1-5668-4e73-98ae-2ab3bb4f7274): one list grouped "Awaiting approval 1" and "Awaiting payment 4", with "Submitted" and "To be paid" totals above it, and a quick **Approve** or **Pay** button on each row, the rest in "⋯".
- [Acctual bills](https://mobbin.com/screens/4b992650-0ce5-4fc7-9efb-8407b7ac70ac): the same stages as tabs (Approve 2, Ready for payment 3, Paid 2) with approve and reject icons on each row.
- [Deel](https://mobbin.com/screens/ebede796-0ca0-408a-bf05-630420732e1f): "Approve all your pending (71)". Shown here as the thing **not** to copy: funding decisions are named, one at a time.

### Screen layer: decide from a side panel
- [Mercury reimbursement](https://mobbin.com/screens/acd32944-7f4b-445f-a510-5a7750b11a19): list on the left, panel on the right with the amount large, a two-step timeline (Submitted, Pending review), then Approve, Decline and More.
- [Expensify report](https://mobbin.com/screens/3eeed405-32d1-4bc4-bb42-04d44b5286a5): Reject opens a small inline popover with a memo field, not a full dialog.
- [Aboard expense](https://mobbin.com/screens/34eeed30-63b2-4adb-96b6-2d33487866c7): approved items carry one primary button, "Mark as reimbursed", under the approval trail.
- [Mercury payment](https://mobbin.com/screens/d5836a65-9b13-4804-a552-6a192126b1f5) and [Melio payment summary](https://mobbin.com/screens/1d9bfa79-45d3-46f7-aff4-026b7ed81af7): a payment is confirmed back as amount, then a short list of facts including the **date it was paid**.

### Spending view
- [Copilot category](https://mobbin.com/screens/e4104151-c47b-47fb-9971-327ce2ad89c4): spent figure, a monthly trend, then the transactions that make it up.
- [Wise spending](https://mobbin.com/screens/a48799b7-4e7c-4a57-a568-10f4c37fb8ff): monthly bars, two figures (average, this month), then a breakdown by category with bars.
- [Monarch](https://mobbin.com/screens/5e9f66a0-5b8c-434a-841f-9c6cb2199bfd) and [Rocket Money](https://mobbin.com/screens/e8e471f9-dc5d-47a7-8d02-8b62c096149b) show budget against actual. The PRD has no budgets, so Flowkeep shows **what was committed and what was paid**, never a budget it would have to invent.

## 4. Recommended approver flow

Three pages: Funding (the queue), Spending, Water points (read only). Plus Settings.

### 4.1 Funding (first screen)
1. **Summary strip, clickable as filters:** To decide (count and ₦ total), Approved, not paid (₦), Paid this month (₦), Slower than usual.
2. **One list, grouped by stage** (as Xero): "To decide", then "Approved, waiting for payment". A third group, "Rejected, waiting for a new estimate", is read only. Paid faults move to a **History** tab.
3. **Quick action on each row:** Approve or Record payment. Reject sits in "⋯" so it is never one stray click away.
4. **"Slower than usual"** reuses the officer rule (1.5× the portfolio's own median for that step, at least 2 days over, n ≥ 3), written in words: "Approved 9 days ago, not paid · usual 3".
5. **Side panel for the selected fault** (as Mercury): amount large, diagnosis, parts, technician, earlier estimates and why they were rejected, then context:
   - *This water point:* faults recorded, ₦ disbursed to date.
   - *Same repair elsewhere:* the median estimate for this diagnosis type, from n past estimates (only when n ≥ 3). Shown as a fact, not a limit.
6. On phones the list is full width and the panel opens as a full screen.

### 4.2 Recording a decision or a payment
1. **Approve:** funder source (defaults to the last one used), **date** (defaults to today, can be earlier), optional note.
2. **Reject:** reason inline in a small popover (as Expensify), required if the admin setting says so.
3. **Record payment:** amount prefilled with the approved amount, **date paid**, note. If the amount differs from what was approved, the difference is shown and the **note becomes required**.
4. Every record keeps both times: when it happened and when it was entered.
5. **Correct a decision or payment** from History: changes the field and writes a correction record with a reason (§10).

### 4.3 Spending
1. Period (30 days, 90 days, pilot to date).
2. Strip: Disbursed, Approved not paid, Days from estimate to decision (median), Days from decision to payment (median). The last two are §13 signals.
3. Disbursed per month (bars) and **by funder source** (bars). No budget lines.
4. No export: §10 gives export to the officer and admin only.

### 4.4 Water points (read only)
The officer's list and record without custodian phone numbers or any reassign actions (§10).

### 4.5 Settings
Profile and Appearance, the same as the officer.

## 5. Decisions needed

1. **Paying a different amount from the one approved:** allow it with a required note (recommended), or block it and ask for a new estimate?
2. **Funder sources:** a list the admin manages in Settings (recommended), or free text typed by the approver?
3. **Bulk approve:** leave it out, so each decision is named and deliberate (recommended), or add it?
