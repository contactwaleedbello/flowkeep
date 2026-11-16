# Flowkeep Product Requirements Document

## 1. Overview

Flowkeep is a maintenance record for community water points. It tracks a fault from the first report to confirmed water flow. The organisation can see what broke, what was approved, what was disbursed, what was repaired, and whether service returned.

Version one is a web application with offline support. It targets one partner organisation and about ten water points. The partner is not yet secured. This PRD describes the prototype that will be used to attract a partner.

Version one has no revenue model. It does not process payments and does not charge the organisation.

Version one does not use sensors and does not send automated messages.

## 2. Tech Stack

This section is the locked build stack. Do not propose alternatives unless the user asks.

Application layer:
- Next.js with React for the web application.
- Tailwind CSS for styling.
- Progressive Web App support with a service worker and a manifest.

Data layer:
- Supabase free tier for Postgres, authentication, storage, and row level security.
- IndexedDB via Dexie.js for offline data capture on the device.

Sync layer:
- A client side sync queue. Writes go to IndexedDB first, then to Supabase when a connection returns.
- Manual sync button plus optional background sync.
- No real time sync in version one.

Hosting:
- Vercel free tier for the Next.js application.

Version control and delivery:
- GitHub for source control.
- GitHub Actions free tier for basic checks if needed.

Testing:
- Manual test script for the pilot. Document the steps in the repository.
- No paid test tooling.

Monitoring:
- Free tier error logging only. Verify current free tier limits at build time.

Payments:
- None in version one.

Free tier limits change. Verify every free tier limit at build time before the pilot starts.

## 3. Problem Statement

The scene below is illustrative. It is not research. The actual reporting chain must be documented during the baseline period.

A borehole stops working. A community member tells the WASH committee. The committee tells the local government. The local government tells the partner organisation. The partner asks a technician to visit. The technician writes an estimate on paper or sends it by WhatsApp. The estimate sits because no one is sure who approves it. Weeks pass. No one records when the fault started, how long diagnosis took, or whether the repair was completed. When a new programme officer takes over, the history is gone.

The problem is not that faults happen. The problem is that no one holds a single record of a fault from report to confirmed water flow. Decisions about money and repairs are made without that record.

The cost of this downtime is unknown. It must be measured during the baseline period. Do not invent a figure.

## 4. Goals and Non-Goals

Goals for version one:
- Record every fault reported through the product on an assigned water point, from a named custodian or a named assisting user.
- Record a technician diagnosis and estimate as a separate step from the report.
- Record a funding decision by a named approver as a separate step from the estimate.
- Record a funding disbursement as a separate step from the funding decision.
- Record a repair completion by the technician, including partial repair and failed repair.
- Record a restoration confirmation by the custodian.
- Show the water point record as a list of past faults with their states and dates.
- Work offline for data capture and sync when a connection returns.

Non-goals for version one:
- No sensors or automatic monitoring.
- No automated messages, alerts, or reminders.
- No AI diagnosis or AI recommendations.
- No in-platform payments or subscriptions.
- No water quality testing or water safety claims.
- No map view.
- No separate custodian app or technician app.
- No predictive maintenance.
- Single organisation record only. Row level security enforced at the organisation_id level. No multi-tenant billing.

Adoption is measured in section 13.

## 5. Target Users and Roles

Primary user: a WASH programme officer inside the partner organisation. This person owns the water point portfolio and needs one place to see open faults, pending estimates, funding decisions, and confirmed repairs.

This is a task driven product. The routine trigger is the daily or weekly check of the open faults list. The product must not pretend there is a reason to open it without a task or a routine check.

Portfolio size assumption: the pilot covers ten water points. The programme officer in a real RUWASSA or LGA WASH department may manage far more. The pilot must test whether the officer experience holds at a larger portfolio size. Flag this in section 16.

Roles:
- Custodian: a person near the water point. Reports a fault. Later confirms whether water is flowing.
- Assisting user: a named assigned user who reports on behalf of a custodian who cannot use the product.
- Technician: a person who visits the water point. Records a diagnosis and an estimate. Records repair completion, partial repair, or failed repair.
- Approver: a person inside the partner organisation with authority to approve or reject repair funding.
- Organisation admin: a staff member who manages water points, assignments, and user invitations.

These roles are separate in the data model. In the pilot, one person may hold more than one role if the partner confirms it. The product must not assume one person holds more than one role by default.

## 6. User Stories by Role

Custodian:
1. As a custodian, I want to report a fault on a water point I am assigned to, so the organisation knows there is a problem.
2. As a custodian, I want to confirm whether water is flowing after a repair, so the record shows whether service returned.

Assisting user:
3. As an assisting user, I want to report a fault on behalf of a custodian, so the record shows both the custodian and me.

Technician:
4. As a technician, I want to see faults assigned to me, so I know what to work on.
5. As a technician, I want to record a diagnosis and an estimate, so the organisation can decide on funding.
6. As a technician, I want to record a partial repair or a failed repair, so the record shows what actually happened.
7. As a technician, I want to mark a repair as complete, so the custodian can confirm water flow.

Approver:
8. As an approver, I want to see open estimates for my organisation, so I can approve or reject funding.
9. As an approver, I want to record my decision with a date and an optional note, so the record shows why funding was given or withheld.
10. As an approver, I want to record a disbursement, so the record shows money actually moved.

WASH programme officer:
11. As a programme officer, I want to see all open faults grouped by status, so I know what needs action.
12. As a programme officer, I want to act on a rejected funding decision, so I can resubmit, escalate, or abandon the fault.
13. As a programme officer, I want to open a water point record, so I can see its fault history, costs, and restoration confirmations.
14. As a programme officer, I want to reassign a custodian or technician, so the fault does not stall.
15. As a programme officer, I want to export the water point records, so I can use them in reports.

Organisation admin:
16. As an admin, I want to add and edit water points, so the portfolio matches what the organisation manages.
17. As an admin, I want to assign custodians and technicians to water points, so faults reach the right people.
18. As an admin, I want to invite users and set their roles, so only the right people see the right data.
19. As an admin, I want to record consent for a custodian phone number, so the platform complies with data protection rules.
20. As an admin, I want to merge duplicate faults, so the record is clean. This is optional in version one and may be cut.

## 7. Functional Requirements

Feature one: Report a fault.
- The custodian or the assisting user selects a water point from a list of assigned water points.
- The reporter selects a fault type from a short list. The list is defined by the organisation.
- The reporter may add a free-text note.
- The system creates a fault record with water point, reporter name, assisting user name if any, date, time, fault type, optional note, and status `reported`.
- The fault record is stored locally first if the device is offline.
- If the reporter is an assisting user, the record shows both the custodian and the assisting user.

Feature two: Record a diagnosis and estimate.
- The technician opens a fault assigned to them.
- The technician selects a confirmed fault category from a short list.
- The technician writes the parts needed as free text.
- The technician enters an estimated cost as a number and a currency.
- The system creates a diagnosis record and an estimate record linked to the fault.
- The fault status becomes `estimate submitted`.
- If a later diagnosis replaces this one, the earlier diagnosis is marked as superseded.

Feature three: Approve or reject funding, then record disbursement.
- The approver sees a list of estimates with status `estimate submitted` for their organisation.
- The approver selects one and records `approved` or `rejected`.
- The approver may add a free-text note.
- The system creates a funding decision record with approver name, decision, date, time, optional note, and funder source.
- The fault status becomes `funding approved` or `funding rejected`.
- When money actually moves, the approver records a disbursement with date, amount, and note.
- The fault status becomes `funding disbursed`.
- No payment is made inside the platform.

Feature four: Record repair outcome and confirm service restoration.
- The technician marks the repair as `complete`, `partial`, or `failed`.
- The system creates a repair outcome record with date and time.
- The fault status becomes `repair reported complete`, `partially repaired`, or `repair failed`.
- The custodian sees the fault in their list with the repair outcome.
- The custodian selects `water is flowing` or `water is not flowing`.
- The system creates a restoration confirmation record with custodian name, selection, date, and time.
- If `water is flowing`, the fault status becomes `service verified`.
- If `water is not flowing`, the fault status becomes `repair failed` and the fault returns to `reported` for a new diagnosis.
- This step confirms water flow. It does not confirm water safety.

Feature five: View the water point record.
- Any assigned role can open a water point.
- The screen shows current status, open faults, and a list of past faults.
- Each past fault shows dates, fault category, diagnosis category, estimate amount, funding decision, disbursement, repair outcome, and restoration confirmation.
- If a fault has no diagnosis, the record shows no cost.
- If a fault has no disbursement, the record shows `funding approved, not disbursed`.
- If a fault has no custodian confirmation, the record does not show `service restored`.
- If a water point has no recorded faults, the record shows an empty history with a clear label, not a blank screen.
- Every record shows both `event_time` and `synced_at`.

## 8. Data Model and Entities

| Entity | Key fields | Created by | Notes |
|---|---|---|---|
| organisations | id, name, created_at | system | One organisation per pilot. |
| users | id, organisation_id, full_name, phone, phone_consent_at, phone_consent_purpose, email, role, status | admin invite | Role is one of custodian, assisting_user, technician, approver, programme_officer, admin. |
| water_points | id, organisation_id, external_id, name, community, latitude, longitude, installation_reference, current_status, created_at | admin | external_id is the stable identifier. installation_reference describes where a future sensor attaches. |
| water_point_assignments | id, water_point_id, user_id, role_on_point | admin | Links custodians and technicians to a water point. |
| faults | id, water_point_id, fault_type, note, event_time, synced_at, status | custodian or assisting user | Status values listed in section 11. |
| fault_reporters | id, fault_id, user_id, reporter_role | custodian or assisting user | Supports more than one reporter per fault. |
| diagnoses | id, fault_id, technician_user_id, diagnosis_category, parts_needed, diagnosed_at, superseded_by | technician | superseded_by is null when current. |
| estimates | id, fault_id, diagnosis_id, amount, currency, submitted_by_user_id, submitted_at, superseded_by | technician | superseded_by is null when current. |
| funding_decisions | id, estimate_id, approver_user_id, decision, note, funder_source, decided_at | approver | decision is `approved` or `rejected`. |
| funding_disbursements | id, funding_decision_id, amount, currency, disbursed_by_user_id, disbursed_at, note | approver | Records that money actually moved. |
| repair_outcomes | id, fault_id, technician_user_id, outcome, completed_at, note | technician | outcome is `complete`, `partial`, or `failed`. |
| restoration_confirmations | id, fault_id, custodian_user_id, water_flowing, confirmed_at, note | custodian | water_flowing is true or false. |
| corrections | id, entity_type, entity_id, field_name, previous_value_json, corrected_by_user_id, reason, corrected_at | any assigned role | Append only. Never delete a funding decision. |
| phone_access_log | id, user_id, subject_user_id, water_point_id, purpose, accessed_at | system | Logs every view of a custodian phone number. |

## 9. Offline and Connectivity Behavior

- The app is a PWA. It loads once with a connection and works offline after that.
- Data is written to IndexedDB first via Dexie.js.
- A sync queue holds unsynced records.
- Every record stores two timestamps. `event_time` is set on the device when the user acts. `synced_at` is set by the server when the record arrives.
- When a connection returns, the app syncs the queue to Supabase.
- Sync is manual or background. Real-time sync is not required for version one.
- The user can see which records are pending sync.
- Conflict rule: last `event_time` wins. If two records have the same `event_time`, the server breaks the tie by upload order.
- The record view must show both `event_time` and `synced_at`.
- The offline queue is capped at 14 days. Records older than 14 days must be re-entered.
- The custodian screen must work on a phone with intermittent data. It must not block on a network call.
- Photos are not part of version one.

## 10. Permissions and Access Control

| Action | Custodian | Assisting user | Technician | Approver | Programme officer | Admin |
|---|---|---|---|---|---|---|
| Report a fault | Yes, assigned points | Yes, on behalf of assigned points | No | No | No | No |
| Record diagnosis and estimate | No | No | Yes, assigned faults | No | No | No |
| Approve or reject funding | No | No | No | Yes | No | No |
| Record disbursement | No | No | No | Yes | No | No |
| Mark repair outcome | No | No | Yes, assigned faults | No | No | No |
| Confirm restoration | Yes, assigned points | No | No | No | No | No |
| View water point record | Yes, assigned points | Yes, assigned points | Yes, assigned points | Yes, own organisation | Yes, own organisation | Yes, own organisation |
| Reassign custodian or technician | No | No | No | No | Yes | Yes |
| Act on rejected funding | No | No | No | Yes | Yes | No |
| Add or edit water points | No | No | No | No | No | Yes |
| Invite users | No | No | No | No | No | Yes |
| Record phone consent | No | No | No | No | No | Yes |
| Merge duplicate faults | No | No | No | No | No | Yes |
| Export records | No | No | No | No | Yes | Yes |
| See custodian phone number | Own only | Assigned points | Assigned points | No | Assigned points | Yes |

Access rules:
- The programme officer may see a custodian phone number only for water points in their portfolio. The purpose is fault follow up.
- Every phone number view must be logged in `phone_access_log`.
- The system must never share a custodian phone number with anyone outside the assigned roles.
- The system must never delete a fault record.
- The system must never change a funding decision without writing a correction record.

## 11. Status Lifecycle for a Fault

States:
1. `reported`: a custodian or assisting user has reported the fault. No diagnosis yet.
2. `estimate submitted`: a technician has recorded a diagnosis and an estimate.
3. `funding approved`: an approver has approved the estimate. Money has not moved yet.
4. `funding rejected`: an approver has rejected the estimate.
5. `funding disbursed`: money has moved. Recorded by the approver.
6. `awaiting parts`: the technician has recorded that parts are not available.
7. `repair reported complete`: the technician has marked the repair as complete.
8. `partially repaired`: the technician has marked the repair as partial.
9. `repair failed`: the repair did not restore water flow, or the technician marked it as failed.
10. `service verified`: the custodian has confirmed water is flowing.
11. `abandoned`: the organisation has closed the fault without a repair. A reason is required.

Transitions:
- `reported` to `estimate submitted` when a technician submits a diagnosis and estimate.
- `estimate submitted` to `funding approved` or `funding rejected` when an approver decides.
- `funding approved` to `funding disbursed` when an approver records a disbursement.
- `funding disbursed` to `awaiting parts`, `repair reported complete`, `partially repaired`, or `repair failed`.
- `repair reported complete`, `partially repaired`, or `repair failed` to `service verified` when the custodian confirms water is flowing.
- `repair reported complete`, `partially repaired`, or `repair failed` back to `reported` when the custodian says water is not flowing. This is the "returned to open" transition.
- Any open state to `abandoned` when the organisation closes the fault with a reason.

Rules:
- The system never jumps from `reported` to `service verified`. Each step must be recorded.
- `service verified` means water is flowing. It does not mean water is safe to drink.
- A rejected estimate does not close the fault. The fault stays open with status `funding rejected` until a new estimate is submitted or the fault is abandoned.
- A failed repair does not erase the earlier diagnosis, estimate, or disbursement. It adds to the record.

## 12. Admin and Back-Office Screens

- Water point list and editor: add, edit, and archive water points. Fields include name, external_id, community, latitude, longitude, installation_reference, current status.
- Assignment screen: link custodians, assisting users, and technicians to a water point.
- User management: invite users, set roles, deactivate users.
- Consent screen: record custodian phone consent with date and purpose.
- Duplicate merge: select two faults on the same water point and merge them into one. The merged fault keeps the earlier report date and lists all reporters in `fault_reporters`. Merge must write a correction record. Merge is optional in version one and may be cut if pilot volume is low.
- Correction log: view all correction records with field name, previous value, reason, user, and date.
- Phone access log: view all phone number views with user, subject, water point, purpose, and date.
- Export: download water point records as CSV.

These screens are necessary for the pilot. They are not counted as user-facing features.

## 13. Success Metrics

The pilot collects a baseline during the first weeks and compares later. At ten water points, the sample is too small for statistically meaningful percentages. Treat every number below as a signal, not as a statistic. Do not invent targets before the baseline exists.

Signals to record:
- Time from fault report to diagnosis. Measured as the difference between `faults.event_time` and `diagnoses.diagnosed_at`.
- Time from diagnosis to funding decision. Measured as the difference between `estimates.submitted_at` and `funding_decisions.decided_at`.
- Time from funding decision to disbursement. Measured as the difference between `funding_decisions.decided_at` and `funding_disbursements.disbursed_at`.
- Time from disbursement to repair outcome. Measured as the difference between `funding_disbursements.disbursed_at` and `repair_outcomes.completed_at`.
- Share of faults with a custodian restoration confirmation.
- Share of water points with at least one recorded fault in the pilot period.
- Data completeness percentage. This is the share of faults with all required fields filled.
- Number of decisions where the record was cited. Ask each user to note this when they use the record to make a decision.
- Number of correction records written. A high number signals poor data quality.
- Number of duplicate faults merged. A high number signals a reporting problem.

A signal is only useful if the timestamps come from named users. The pilot must state this in every report.

## 14. Risks and Mitigations

Risk one, the partner does not exist yet. This is the most severe risk. The product may fit the wrong organisation type. Mitigation: ship the pilot with a configurable fault type list, a configurable diagnosis category list, and no hard-coded partner fields. Test with the first interested organisation before adding features.

Risk two, no one checks without reminders. Version one has no automated messages. Discovery depends on manual checking. If staff and technicians do not check their lists, the records go stale. Mitigation: the open faults list must be the first screen after login for staff and technicians. The pilot must measure how often the list is opened. If checking does not happen, report that as a finding. Do not add notifications inside version one.

Risk three, restoration confirmation is skipped. The custodian confirmation is the step that separates Flowkeep from a complaint box. If custodians do not confirm, or if the organisation marks faults as restored without confirmation, the central claim is unverified. Mitigation: the system must not allow any role except the assigned custodian to write a restoration confirmation. The pilot must measure the confirmation rate and treat a low rate as a serious finding.

Risk four, the partner does not own the water points. In Nigeria, ownership often sits with the community or the LGA. If the partner cannot commit funding or make decisions, the repair loop breaks. Mitigation: confirm ownership and decision authority in writing before the pilot starts.

Risk five, technicians are not paid and stop using the product. Mitigation: confirm the technician payment or incentive arrangement before the pilot starts. If the product adds work without pay, record it as a pilot finding.

Risk six, the approver does not have budget authority. Mitigation: confirm the approver role in writing before the pilot starts.

Risk seven, the partner withdraws mid-pilot. Mitigation: agree an export and handover procedure at the start. The partner keeps its records.

## 15. Version 1 vs Version 2

Version one collects:
- A stable water point identifier.
- A location that can be matched to a future sensor.
- An installation reference that describes where a sensor would attach.
- A fault category from a short list.
- A diagnosis category from a short list.
- An estimate amount and currency.
- A funding decision with a date.
- A disbursement with a date and amount.
- A repair outcome with a date.
- A restoration confirmation with a date.
- The role of the person who created each record.

Version one does not do:
- Sensors or automatic monitoring.
- Automated alerts, reminders, or messages.
- AI diagnosis or AI recommendations.
- In-platform payments or subscriptions.
- Water quality testing or water safety claims.
- Predictive maintenance.
- Map view.
- Multi-organisation tenancy. One organisation record only.
- Photo attachments.
- Duplicate merge is optional and may be cut.

Version two may use the collected data for sensors, recurring fault analysis, and reminders. Version one must not block those later uses.

The version two pricing case is unproven. It requires discovery with paying organisations. Do not assume willingness to pay.

## 16. Blockers

These items block the pilot. They are not open questions.

1. Nigerian data protection compliance. Confirm the current regulation and its requirements with a legal source before collecting any personal data. The current regulation is GAID, which replaced NDPR in September 2025. Verify this with a legal source.
2. A named partner organisation with a signed pilot agreement.
3. A named approver with written budget authority.
4. A confirmed source of repair funding.
5. A confirmed technician payment or incentive arrangement.
6. Written confirmation of who owns each of the ten water points.

## 17. Open Questions

| # | Question | Owner | Due date |
|---|---|---|---|
| 1 | Which organisation type will be the pilot partner? | Builder | Before pilot |
| 2 | Who inside the partner has authority to approve repair funding? | Partner | Before pilot |
| 3 | What is the agreed source of repair funding for the pilot? | Partner | Before pilot |
| 4 | What are the fault types and diagnosis categories? Who defines them? | Partner | Before pilot |
| 5 | What currency and number format does the partner use? | Partner | Before pilot |
| 6 | What languages do custodians, technicians, and staff use? | Partner | Before pilot |
| 7 | Do custodians have smartphones, feature phones, or shared phones? | Partner | Before pilot |
| 8 | Do technicians have smartphones with data? | Partner | Before pilot |
| 9 | What existing records exist for the ten water points? | Partner | Before pilot |
| 10 | What is the baseline downtime and response time? | Builder | First two weeks |
| 11 | Which data protection rules apply? See blockers. | Builder | Before pilot |
| 12 | Whose data protection policy applies to the pilot? | Partner | Before pilot |
| 13 | Who owns the platform account and the records if the partnership ends? | Partner | Before pilot |
| 14 | What happens to open faults if a custodian, technician, or the partner stops participating? | Partner | Before pilot |
| 15 | How long can a fault stay open before it is marked abandoned? | Partner | Before pilot |
| 16 | Who validates a technician diagnosis if the partner disagrees? | Partner | Before pilot |
| 17 | Who pays for hosting, data, and support during the pilot? | Builder | Before pilot |

## 18. Assumptions

- ASSUMPTION: The pilot partner is not yet secured. Reason: the user confirmed this.
- ASSUMPTION: The pilot covers about ten water points in Adamawa and Kaduna. Reason: the user stated this.
- ASSUMPTION: Custodians, technicians, approvers, and the organisation account owner are separate people. Reason: the refined idea says not to collapse these roles. The pilot may allow one person to hold more than one role if the partner confirms it.
- ASSUMPTION: Some custodians have smartphones and some do not. Reason: the user said all device types are present. Version one needs an assisted reporting path for custodians without a smartphone.
- ASSUMPTION: Technicians have smartphones. Reason: they need to record diagnoses and estimates, and the product is offline first.
- ASSUMPTION: The partner organisation enters water point records on day one from whatever paper or spreadsheet exists. Reason: the user said no records are known today.
- ASSUMPTION: Fault types and diagnosis categories are short lists defined by the partner before the pilot starts. Reason: free text alone cannot support recurring fault analysis in version two.
- ASSUMPTION: Version one does not charge the organisation. Reason: the user said payment is not in the picture yet.
- ASSUMPTION: The platform stores custodian phone numbers as personal data and limits access to them. Reason: custodian phone numbers are personal data under Nigerian data protection rules.
- ASSUMPTION: The current Nigerian data protection regulation is GAID, which replaced NDPR in September 2025. Reason: the user asked to check NDPR, and the regulation has changed. This must be confirmed with a legal source. See blockers.
- ASSUMPTION: Export of water point records is a basic right for the partner, not a paid feature. Reason: locking a partner out of its own maintenance history would destroy trust.
- ASSUMPTION: The pilot will measure baseline downtime and response time during the first weeks. Reason: no baseline exists today.
- ASSUMPTION: The builder covers pilot operating costs for hosting, data, and support. Reason: no partner funding is confirmed. This must be confirmed before the pilot starts.
- ASSUMPTION: The partner may withdraw mid-pilot. Reason: no agreement is signed. An export and handover procedure must be agreed at the start.
- ASSUMPTION: The programme officer portfolio in a real partner may be larger than ten water points. Reason: ten points is the pilot size, not the typical portfolio. The pilot must test the officer experience at a larger size.