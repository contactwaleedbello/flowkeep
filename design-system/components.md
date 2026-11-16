# Components (component layer)

All components live in `src/components/ui/`. Each references colour roles only. Merge classes with `cn()` (`src/lib/cn.ts`), which uses tailwind-merge configured with Flowkeep's tokens, so a `className` passed in overrides the default it conflicts with.

| Component | File | Variants / props | Use it for | Reference |
|---|---|---|---|---|
| `Button`, `ButtonLink`, `buttonClasses()` | `button.tsx` | `filled` `tonal` `outlined` `text` `success` `danger` · `sm` 32 / `md` 40 / `lg` 48 · `block`, leading/trailing icon | One filled button per view. `success` only for "Yes, water is flowing". `danger` only for destructive admin actions. | Material 3 |
| `StatusPill` | `status-pill.tsx` | `status` (11 states) · `sm` / `md` | Fault status everywhere. Icon + label; open states tinted, closed states solid. | [Fresha](https://mobbin.com/screens/3b1a8630-7e3d-4e22-aa49-f38180943f60), [Relevance AI](https://mobbin.com/screens/c9df4ae4-6265-48ac-8e16-95220d542fce) |
| `Chip` | `status-pill.tsx` | tone | Roles and non-status tags | n/a |
| `CountBadge` | `status-pill.tsx` | count | Group headers, nav items, tabs | [Linear](https://mobbin.com/screens/610d34b6-6ad8-45ab-80fb-2107b31ed01e) |
| `Card` | `card.tsx` | `outlined` `filled` `elevated` | Panels, list containers, previews | Material 3 |
| `TextField`, `TextArea`, `SelectField` | `text-field.tsx` | `label`, `helper`, `error`, `optional` | Desktop forms. The label sits above the field and stays visible. | n/a |
| `ChoiceList` | `choice-list.tsx` | `choices`, `value` / `defaultValue`, `onChange` | Phone pickers with five or fewer options: fault type, outcome. A radio group shown as full-width rows. | [Woolworths](https://mobbin.com/screens/dfa01bc2-0e3b-420f-8fae-d938123dfcc9), [Bird](https://mobbin.com/flows/4bb0fda2-0003-46b3-b0e0-9ab39d7a7721) |
| `SyncBar` | `feedback.tsx` | `offline` `pending` `syncing` `synced` `stale` · `onSync` (client) / `showSyncButton` (preview) | Top of every field screen. Never blocks. `stale` warns before the 14-day cap. | [Docusign](https://mobbin.com/screens/42948b73-a83c-40c0-819c-6f96133201dc) |
| `SyncTag` | `feedback.tsx` | `synced` | On each unsynced row or record | [Docusign](https://mobbin.com/screens/42948b73-a83c-40c0-819c-6f96133201dc) |
| `Toast` | `feedback.tsx` | `title`, `meta` | "Saved on this phone", kept separate from the sync state | [ClickUp](https://mobbin.com/screens/36a56a25-7486-4fd9-8901-985a5f111453) |
| `Banner` | `feedback.tsx` | `info` `attention` `error` `success` | In-page explanations, e.g. "Funding rejected: resubmit, escalate or abandon" | n/a |
| `EmptyState` | `feedback.tsx` | `title`, `body`, `action`, `icon` | Any empty list. Says what is empty and what to do. Never a blank screen. | PRD §7 |
| `LifecycleStepper` | `lifecycle.tsx` | `current`, `reopened` | Record header (desktop). A reopened fault gets a loop-back note, not a reset. | [incident.io](https://mobbin.com/screens/5b8715c5-d502-4b69-a4b8-d7275ee08a83) |
| `VerticalSteps`, `StepDot` | `lifecycle.tsx` | steps with `done` / `current` / `upcoming` | Phone record view. The current step expands and says who acts next. | [Vestiaire](https://mobbin.com/screens/984bf280-8384-4125-8136-360fc80eddf2), [Bolt Food](https://mobbin.com/screens/9509b853-f44c-425e-81c0-c6e96efffe2c) |
| `Timeline`, `TimelineItem`, `Timestamps`, `Avatar` | `timeline.tsx` | `TimelineEvent` (actor, role, action, from/to, note, eventTime, syncedAt, superseded) | Fault record history. "Name (role) action", old → new status, both times. | [Plane](https://mobbin.com/screens/2be3d4e1-ebd8-42c7-bd36-86d20567c191), [Jira](https://mobbin.com/screens/4ecaec7d-b384-4747-b30e-8735992c5ecf) |
| `QueueTabs` | `tabs.tsx` | tabs with counts and panels | Approver queue: To decide · To disburse · Disbursed | [Acctual](https://mobbin.com/screens/06ec87de-4b09-49d0-8f4f-158a28705fd2) |
| `Logo`, `LogoMark` | `logo.tsx` | n/a | A droplet with a check mark, drawn in role colours, so it follows the theme | n/a |
| `ThemeToggle` | `theme-toggle.tsx` | n/a | Switches the `.dark` class and saves the choice | n/a |

## Server and client

`ChoiceList`, `QueueTabs`, `TextField`/`TextArea`/`SelectField` and `ThemeToggle` are client components. Everything else renders on the server. Don't pass functions such as `onSync` from a Server Component; on server-rendered previews use `showSyncButton`.

## Still to build for the app

Dialog (for "reject with reason" and "abandon with reason"), a data table with sort and filter chips, a sidebar nav, a phone bottom bar, a currency input, and a date-time display with server/device time-zone handling. Add each one here with its Mobbin reference.
