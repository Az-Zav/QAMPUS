# QAMPUS Client Guide (audit reference)

Scope: the Expo (React Native, JS/JSX, Expo Router) client for **students and guests**. Backend is a mock service layer that imitates Firebase; PRD v1.3 is the source of truth.

**How to use:** open a file, find its card (Part 3) or recipe (Part 4), compare, fix. If code and this guide disagree, this guide wins.

**The restaurant model:** providers and hooks are the kitchen and notice board (they hold data). Components are plates (they only show what they are handed). Screens are waiters (they fetch from hooks and hand data to plates).

## Core rules

| # | Rule |
|---|---|
| R1 | Primitives and item components take **props only**. Screens **always** read hooks and pass data down. Only three singletons may read hooks: `Header`, `BottomNav`, `CalledModal`. |
| R2 | Providers never read each other (Auth is the one exception). Cross-provider logic lives in a composing hook (`useJoinEligibility`). |
| R3 | Providers hold only shared or server-owned data. UI state (modal open, search text, spinner, form fields) stays local to the screen. Derived values are computed, never stored. |
| R4 | Every provider hook returns `{ status, <data>, actions }`. `status` is `'loading' \| 'ready' \| 'error'`. |
| R5 | Actions never throw. They resolve to `{ ok: true, data }` or `{ ok: false, code, message }`. |
| R6 | `ok: false` is an expected outcome (banned, expired scan). `status: 'error'` is a real fault (show the outage `EmptyState`). Network failure during an action is `{ ok: false, code: 'NETWORK' }`. |
| R7 | Actions never set provider state. Data arrives only through the service subscription. |
| R8 | Screens and components import **hooks and utils only**. Never services, never `data/mock.js`. Only `AppProviders` imports provider components. |
| R9 | Only hooks read the clock. Helpers are pure and take `now`. |
| R10 | Rules and copy (limits, policy text, labels) live in `constants/`, never inside components. |
| R11 | Vocabulary: "offense", never "strike". `TicketStatus` includes `cancelledByOffice`. `HistoryStatus` is retired. |

---

# Part 1. Files to add or change

```
src/
├── app/_layout.jsx            [CHANGE] AuthProvider > Gate > AppProviders > CalledModal
├── app/playground.jsx         [CHANGE] later: buttons that simulate staff events on the mock
├── providers/                 [NEW]
│   ├── AuthProvider.jsx        exports AuthProvider + useAuth
│   ├── OfficesProvider.jsx     exports OfficesProvider + useOffices
│   ├── TicketsProvider.jsx     exports TicketsProvider + useTickets
│   ├── BansProvider.jsx        exports BansProvider + useBans
│   ├── NotificationsProvider.jsx  exports NotificationsProvider + useNotifications
│   ├── SettingsProvider.jsx    exports SettingsProvider + useSettings
│   └── AppProviders.jsx        bundles the FIVE data providers (Auth excluded)
├── services/                  [NEW] mock backend, one file per provider
│   ├── createStore.js          shared helper: listeners + notify()
│   └── auth | offices | tickets | bans | notifications | settings .service.js
├── hooks/                     [NEW]
│   ├── useTicketStatus.js
│   ├── useJoinEligibility.js
│   ├── useDeviceCapabilities.js
│   └── useNow.js               (small, see Part 2)
├── utils/                     [NEW]
│   ├── ticket.js               shortNumber, ticketUiStatus
│   ├── bans.js                 isBanned
│   ├── hours.js                officeHours
│   └── time.js                 formatWhen, timeAgo, historyGroup, waitedMinutes
├── types/index.js             [NEW] JSDoc typedefs for every shape in Part 2
├── constants/domain.js        [CHANGE] see below
└── data/mock.js               [CHANGE] reshaped, only services import it
```

**`constants/domain.js` changes:** add `ERROR_CODE`, `GRACE_PERIOD_SECONDS = 60`, `MAX_ACTIVE_TICKETS = 3`, `NOTIFICATION_ROUTE`, `BADGE_STYLE`, `NOTIFICATION_STYLE`, `OFFICE_ICON`, `EMPTY_COPY`, `INFO_COPY`; add `TicketStatus.CANCELLED_BY_OFFICE = 'cancelledByOffice'`; remove `HistoryStatus`.

**`data/mock.js` reshape:** camelCase everywhere; merge active and history tickets into one `MOCK_TICKETS`; add `MOCK_BANS` and `MOCK_SETTINGS` keyed by user ID; every user-owned item gets `userId`; offices get `hours` (weekday map), `avgServiceMinutes`, `queue.nowServingSequence`, `queue.cutoffOverridden`; `tkt_hist_003` belongs to the guest; add one history ticket with `cancelledBy: 'OFFICE'`; seed timestamps are built when the service starts (not at import).

**Provider nesting (root layout):**

```
_layout.jsx
└── AuthProvider                always on
    └── Gate                    null user -> login; incomplete profile -> complete-profile; else app
        ├── (auth) screens      read Auth only, system theme
        └── AppProviders        Settings, Offices, Tickets, Bans, Notifications (mount only when signed in)
            ├── (tabs) + (profile) screens
            └── CalledModal     over any screen
```

Signing out unmounts `AppProviders`, wiping the old account's data.

---

# Part 2. Data layer cheat sheet

## Providers

| Provider (hook) | Data | Actions |
|---|---|---|
| Auth (`useAuth`) | `user` (null if signed out); derived `profileComplete` = `user.institutionalId !== null` | `signInWithGoogle`, `continueAsGuest`, `completeProfile`, `updateProfile`, `signOut` |
| Offices (`useOffices`) | `offices` | none |
| Tickets (`useTickets`) | `active` (WAITING, CALLED, IN_SERVICE), `history` (COMPLETED, CANCELLED, NO_SHOW) | `joinQueue`, `cancelTicket`, `verifyArrival` |
| Bans (`useBans`) | `offenses`, `offenseCount`, `ban` | none |
| Notifications (`useNotifications`) | `items`, `unreadCount` | `markRead`, `markAllRead` |
| Settings (`useSettings`) | `theme` (`system\|light\|dark`), `biometricsEnabled`, `pushEnabled` | `setTheme`, `setBiometrics`, `setPush` |

Bans `status` becomes `ready` only after both `bans/{userId}` and `offenses` have delivered. Settings data loads after sign-in, so auth screens use the system theme.

## Action inputs and outputs

| Action | Pass | `data` on success | Error codes |
|---|---|---|---|
| `joinQueue` | `officeCode` | new `Ticket` | `BANNED`, `TICKET_LIMIT`, `QUEUE_CLOSED`, `CAPACITY_REACHED` |
| `cancelTicket` | `ticketId` | `Ticket` (CANCELLED) | none |
| `verifyArrival` | `officeCode` (scan or typed, same operation) | `Ticket` (IN_SERVICE) | `WRONG_OFFICE`, `NO_CALLED_TICKET`, `EXPIRED` |
| `signInWithGoogle` | nothing | `User` | `INVALID_DOMAIN`, `SIGN_IN_CANCELLED` (show nothing) |
| `continueAsGuest` | nothing | `User` | none |
| `completeProfile` | student `{ institutionalId, program }`; guest `{ name, email?, guestType }` | `User` | `STUDENT_ID_TAKEN` |
| `updateProfile` | student `{ program }`; guest `{ name, email, guestType }` | `User` | none |
| `signOut` | nothing | `null` | none |
| `markRead(id)` / `markAllRead()` | see left | `Notification` / `null` | none |
| `setTheme` / `setBiometrics` / `setPush` | value | `Settings` | none |

Shared by every action: `NETWORK`, `UNAUTHENTICATED`, `UNKNOWN`. The client never passes a user ID. Field validation (7-digit ID, required name) happens in the form before the call.

## Entity shapes (client-facing, camelCase, timestamps are ISO strings)

```js
Ticket   { id, userId, officeId, officeCode, officeName, ticketNumber /* 'R-09-28-015' */, dailySequence,
           status /* TICKET_STATUS */, joinedAt, calledAt, serviceStartedAt, completedAt, cancelledAt, noShowAt,
           cancelledBy /* 'USER'|'OFFICE'|null */, counterNumber,
           positionInQueue, aheadCount, estimatedWaitMinutes /* server-computed, null once not waiting */ }
Office   { id, code, name, location,
           hours /* MON..SUN: { open:'08:00', close:'17:00' } | null */, avgServiceMinutes,
           queue: { status /* OPEN|CLOSED */, waitingCount, nowServingSequence, estimatedWaitMinutes, cutoffOverridden } }
User     { id, role /* STUDENT|GUEST */, name, email, institutionalId, program, guestType }
Bans     { offenseCount, ban /* null | { expiresAt, offenseIds } */ }
Offense  { id, userId, ticketId, officeName, ticketNumber, type /* NO_SHOW|CANCELLED_AFTER_CALL */,
           causedBan, revokedAt, createdAt }
Notification { id, userId, type /* 9 types */, title, message, isRead, createdAt }
Settings { theme, biometricsEnabled, pushEnabled }
```

The short number (`R-015`) and the UI status are derived, never stored.

## Hooks

| Hook | Returns | Notes |
|---|---|---|
| `useTicketStatus(ticket)` | `{ status, secondsLeft }` | Ticks once per second **only** while `CALLED` and not expired; otherwise no timer and `secondsLeft` is `null`. Reads only the clock. |
| `useJoinEligibility()` | `checkJoin(office)` | Returns `{ allowed: true }` or `{ allowed: false, code, message }`. Advisory only; the server re-checks. |
| `useDeviceCapabilities()` | biometrics hardware, push permission | Device only. Screens check it before calling `setBiometrics` or `setPush`. |
| `useNow()` | current time | Refreshes about once a minute. The one clock hook for screens that need `now` for hours or dates. |

**`checkJoin` order (first failure wins):**

| # | Code | Test |
|---|---|---|
| 1 | `BANNED` | `isBanned(ban, now)`. Message names the expiry and the offenses behind it. |
| 2 | `TICKET_LIMIT` | `active.length >= MAX_ACTIVE_TICKETS` |
| 3 | `QUEUE_CLOSED` | `office.queue.status === 'CLOSED'`. Message says when it next opens. |
| 4 | `CAPACITY_REACHED` | `minutesUntilClose / avgServiceMinutes >= waitingCount + 1` fails. Skipped if `cutoffOverridden`. Message gives closing time and next opening. |

## Helpers (pure, in `utils/`)

| Helper | Signature | Notes |
|---|---|---|
| `shortNumber` | `(officeCode, sequence)` | `('R', 15)` gives `R-015`; pads to 3 digits, grows past 999. Also used for `nowServingSequence`. |
| `ticketUiStatus` | `(ticket, now?)` | Table below. `now` is optional because terminal tickets never depend on it. |
| `isBanned` | `(ban, now)` | True while `ban.expiresAt` is in the future. |
| `officeHours` | `(office, now)` | Returns `{ isOpen, label, minutesUntilClose, nextOpen }`. The only place hours math exists. Used by `checkJoin` and by Home's hours cards. |
| `formatWhen` / `timeAgo` / `historyGroup` / `waitedMinutes` | `(iso, now)` / `(ticket)` | Date text and TODAY, YESTERDAY, EARLIER grouping. Used by History, Notifications, Bans. |

**`ticketUiStatus` mapping:**

| Stored | Check | UI status |
|---|---|---|
| WAITING | none | `waiting` |
| CALLED | under `GRACE_PERIOD_SECONDS` since `calledAt` | `yourTurn` |
| CALLED | at or over the grace period | `expired` (display only; stays CALLED until staff mark NO_SHOW) |
| IN_SERVICE | none | `inService` |
| COMPLETED | none | `completed` |
| CANCELLED | `cancelledBy === 'USER'` | `cancelled` |
| CANCELLED | `cancelledBy === 'OFFICE'` | `cancelledByOffice` (never an offense) |
| NO_SHOW | none | `noShow` |

**Offense display state** (inlined in the Bans screen, with a comment): revoked wins over caused-a-ban, which wins over active.

**Constants that drive components:**

| Constant | Maps |
|---|---|
| `BADGE_STYLE` | `TicketStatus` and `OffenseState` keys to `{ label, tone }` |
| `NOTIFICATION_STYLE` | notification type to `{ icon, tone }` |
| `NOTIFICATION_ROUTE` | notification type to screen, or `null` (`WARNING`, `GLOBAL_ANNOUNCEMENT`) |
| `OFFICE_ICON` | office code to icon name, with a default |
| `EMPTY_COPY` | `EmptyState` type to `{ icon, title, message, actionLabel? }` |
| `INFO_COPY` | policy rules and the `banStatus` copy |

---

# Part 3. Component cards

## Universal rules (every component)

**MUST DO**
- Accept a `style` override and apply it last.
- Fall back to the default variant when `type` is unknown.
- Set an accessibility role and label on anything pressable.
- Show status by icon or label, never color alone.
- Use tokens only (`COLORS`, `SPACING`, `RADII`, `TYPOGRAPHY`); no magic numbers.

**MUST NOT**
- Import a service, `mock.js`, or a provider component.
- Call `Date.now()` or `new Date()` for logic.
- Compute status, hours, short numbers or date text inline (use `utils/`).
- Hold rules or copy inline (use `constants/`).
- Duplicate the label and color map for a status (use `Badge`).

## File pattern

Order is always: imports, registry, component, styles. The registry holds data only (colors, sizes, icons, copy); no JSX and no logic.

| Variants differ in | Pattern | Components |
|---|---|---|
| colors or sizes | **style registry**, one layout | `Button`, `Badge`, `Toggle`, `SegmentedSwitcher` |
| icon and copy | **config registry**, one layout | `EmptyState` |
| layout | **body registry**: one small `Body` per type, one shared shell | `InfoCard`, `ListRow` |
| behavior or hooks | **separate components**, no registry | all modals |

```jsx
// style registry (template: Button)
const VARIANTS = { primary: { bg, border, text }, disabled: { bg, border, text } };
const variant = VARIANTS[type] ?? VARIANTS.primary;
const isDisabled = type === ButtonType.DISABLED;   // derived once, in the component

// body registry (InfoCard, ListRow)
function MenuRow({ title, icon }) { /* JSX only, no hooks */ }
const VARIANTS = { menu: { Body: MenuRow, container: 'menu' } };
export default function ListRow({ type = 'menu', onPress, style, ...props }) {
  const { Body, container } = VARIANTS[type] ?? VARIANTS.menu;
  return <Pressable ...><Body {...props} /></Pressable>;   // the ONLY place that looks up type
}
```

If a `Body` grows past about 25 lines or needs a hook, move it to its own file and keep its registry entry. `disabled` may be a variant (a state expressed as a type); the entry and the derived flag both live in the component file.

## primitives/

**`Button`** (style registry)
- Variants: `primary`, `secondary`, `destructive`, `accent`, `disabled`. Sizes: `md`, `sm`.
- Props: `label`, `onPress`, `type='primary'`, `size='md'`, `icon?`, `accessibilityLabel?`, `style?`
- Reads: none
- MUST DO: drop `onPress` when `type` is `disabled`; press feedback.
- MUST NOT: own a loading state (the screen swaps `type`).

**`Hero`**
- Variants: `signIn`, `profile`
- Props: `type`, `name?`, `subtitle?` (institutional ID or guest ID), `role?` (`STUDENT` or `GUEST`, picks the avatar)
- Reads: none
- MUST DO: contain the avatar (no separate `Avatar` component).
- MUST NOT: read Auth.

**`Input`**
- Props: `label?`, `value`, `onChangeText`, `placeholder?`, `error?`, `helper?`, `disabled?`, `icon?`, `keyboardType?`, `maxLength?`, `style?`
- Reads: none
- MUST DO: derive default, focused, error, disabled looks (focus is local state).
- MUST NOT: validate.

**`Picker`**
- Props: `label?`, `value`, `options: { value, label }[]`, `onChange`, `placeholder?`, `disabled?`
- Reads: none
- MUST NOT: own option lists (the screen passes them from constants).

**`SearchInput`**
- Props: `value`, `onChangeText`, `placeholder?`
- Reads: none
- MUST DO: show a clear button when filled.
- MUST NOT: filter.

**`Toggle`**
- Props: `label`, `helper?`, `value`, `onValueChange`, `disabled?` (renders the inert look)
- Reads: none
- MUST NOT: check device support (the screen does).

**`SegmentedSwitcher`** (style registry)
- Props: `options: string[]`, `value`, `onChange`
- Reads: none
- MUST NOT: know `QueueView` (the screen passes `Object.values(QueueView)`).

## shell/

**`Badge`** (style registry)
- Variants: `status`, `count`
- Props: status: `type='status'`, `status` (key of `BADGE_STYLE`); count: `type='count'`, `label`, `tone` (`neutral\|warning`)
- Reads: none
- MUST DO: be the only status pill in the app; `ListRow` renders it.
- MUST NOT: keep its own label map.

**`DetailRow`**
- Props: `label`, `value`, `icon?`
- Reads: none
- MUST NOT: format values.

**`ModalShell`**
- Props: `visible`, `onClose`, `children`
- Reads: none
- MUST DO: backdrop, safe area, dismiss on backdrop press.
- MUST NOT: hold content.

**`Header`** (singleton)
- Variants: `home`, `queue`, `sub`
- Props: `type`, `title?`, `onBack?`
- Reads: `useNotifications().unreadCount` (bell dot)
- MUST DO: `sub` shows a back button and title.
- MUST NOT: read Auth (the greeting is in the screen body).

**`BottomNav`** (singleton)
- Props: none
- Reads: router pathname (active tab); no provider
- MUST DO: navigate between `AppTab` values.
- MUST NOT: take an `active` prop.

## profile/

**`ConfirmModal`**
- Props: `visible`, `title`, `message`, `confirmLabel`, `cancelLabel='Cancel'`, `destructive?`, `busy?`, `onConfirm`, `onCancel`
- Reads: none
- MUST DO: compose `ModalShell` and `Button`; disable both buttons while `busy`.
- MUST NOT: know ticket rules (the screen picks the copy). Used for cancel (free and offense copy) and log out.

**`InfoCard`** (body registry)
- Variants and props:

| type | props |
|---|---|
| `officeHours` | `title`, `subtitle`, `hours`, `open` |
| `banStatus` | `state` (`clean\|warning\|banned`), `offenseCount`, `expiresLabel?`, `items?` (`{ label, ticket }[]`) |
| `policy` | none (copy from `INFO_COPY`) |
| `faq` | `title`, `body`, `expanded`, `onPress` |

- Reads: none
- MUST DO: each registry entry decides its own danger styling.
- MUST NOT: contain offense limits or copy inline; keep a separate `StrikeMeter` (it merges into `banStatus`).

**`ListRow`** (body registry)
- Variants: `menu`, `notification`, `offense`, `history`
- Props: `type`, `title`, `subtitle?`, `meta?`, `icon?`, `tone?`, `status?` (key of `BADGE_STYLE`), `pill?`, `unread?`, `destructive?`, `onPress?`
- Reads: none
- MUST DO: render `Badge` for status; type-specific layout (alignment, dividers) lives in the registry entry.
- MUST NOT: take entity props (the screen maps entity to props); format dates; derive status.

## queue/

**`EmptyState`** (config registry)
- Variants: `home`, `history`, `notifications`, `bans`, `outage`
- Props: `type`, `onAction?`
- Reads: none
- MUST DO: take icon, title, message and action label from `EMPTY_COPY[type]`.
- MUST NOT: use boolean icon hacks (`showIconCircle`); accept two names for one prop.

**`OfficeCard`** (item)
- Props: `office`, `eligibility` (result of `checkJoin`), `onJoin(office)`
- Reads: `shortNumber` (now-serving chip), `OFFICE_ICON`
- MUST DO: show the state from `eligibility.code` (`CAPACITY_REACHED` as cutoff, `QUEUE_CLOSED` as closed, `BANNED` as banned); call `onJoin` on every tap.
- MUST NOT: call `checkJoin`, read Bans or Tickets, do hours math.

**`JoinConfirmModal`** (item)
- Props: `visible`, `office`, `busy?`, `onConfirm`, `onClose`
- Reads: none
- MUST DO: show office name, location, waiting count, estimated wait.
- MUST NOT: check eligibility.

**`NoticeModal`**
- Props: `visible`, `title`, `message`, `actionLabel='OK'`, `onClose`
- Reads: none
- MUST NOT: build messages (they come from `eligibility.message`).

## tickets/

**`TicketStubCard`** (item)
- Props: `ticket`, `onPress`
- Reads: `useTicketStatus(ticket)`, `shortNumber`, `Badge`
- MUST DO: waiting shows position, ahead count and estimated wait; called shows counter and `secondsLeft`; expired and inService have their own looks.
- MUST NOT: derive status itself.

**`TicketModal`** (item)
- Props: `visible`, `ticket` (the live ticket), `onCancelTicket`, `onClose`
- Reads: `useTicketStatus(ticket)`
- MUST DO: show details with `DetailRow`; hide Cancel when `inService`.
- MUST NOT: choose the cancel-confirm copy or call `cancelTicket` (the screen does).

**`CalledModal`** (singleton)
- Props: none
- Reads: `useTickets().active`, `useTicketStatus`
- MUST DO: show the earliest-called CALLED ticket with a countdown; dismiss is local state; offer a route to Scan.
- MUST NOT: call `verifyArrival` (Scan does).

## Retired

`HistoryRow`, `OfflineState` (folded into `ListRow` and `EmptyState`). Not components: NowServing chip (inline in `OfficeCard`), office icon tile (`OFFICE_ICON`), section label (styled `Text` in screens), surface (card styles), theme selector (inline in Settings), logo (asset).

---

# Part 4. Screen recipes

Every screen reads hooks, keeps UI state local, and maps entities to component props. If a data provider's `status` is `loading`, show a loading state; if `error`, show `<EmptyState type="outage" />`.

| Screen | Reads | Components | Local state | Actions and notes |
|---|---|---|---|---|
| **root `_layout`** | `useAuth` | `Gate`, `AppProviders`, `CalledModal` | none | Gate: null user to login; `!profileComplete` to complete-profile; else app. |
| **onboarding** | none | `Button` | slide index | Skip and Get Started go to login. |
| **login** | `useAuth` | `Hero(signIn)`, `Button` x2 | `busy` | `signInWithGoogle`; `INVALID_DOMAIN` shows its message, `SIGN_IN_CANCELLED` shows nothing. `continueAsGuest` goes to guest-profile. |
| **complete-profile** (student) | `useAuth` | `Input` (student ID), `Picker` (program), `Button` | form fields, error | Validate 7 digits in the form, then `completeProfile`; `STUDENT_ID_TAKEN` shows on the Input. |
| **guest-profile** | `useAuth` | `Input` x2, `Picker` (guest type), `Button` | form fields, `issuedId` | `completeProfile`; on success show the ID-issued view using `user.institutionalId`, then continue. |
| **home** | `useAuth`, `useTickets`, `useOffices`, `useNow` | `Header(home)`, `TicketStubCard` per active ticket, `InfoCard(officeHours)` per office, `EmptyState(home)`, `TicketModal`, `ConfirmModal` | `selectedTicketId`, `cancelTarget`, `busy` | Greeting from `user.name`. `officeHours(office, now)` feeds `InfoCard`. Tap ticket opens `TicketModal` with the **live** ticket from `active`. |
| **queue: Join view** | `useOffices`, `useJoinEligibility`, `useTickets` | `Header(queue)`, `SearchInput`, `SegmentedSwitcher`, `OfficeCard` per office, `JoinConfirmModal`, `NoticeModal` | `search`, `view`, `selectedOffice`, modal key, `busy` | On `onJoin`: if `!eligibility.allowed`, open `NoticeModal` with `eligibility.message` (covers `TICKET_LIMIT`); else `JoinConfirmModal`. On confirm: `joinQueue(office.code)`; on `ok` close the modal; on `ok: false` show the message. |
| **queue: History view** | `useTickets().history`, `useNow` | same header, `SearchInput`, `SegmentedSwitcher`, `ListRow(history)`, `EmptyState(history)` | `search`, `view` | Group with `historyGroup`. Per ticket: `title` is `officeName`, `subtitle` is `shortNumber(...)` plus `formatWhen`, `meta` is `waitedMinutes`, `status` is `ticketUiStatus(t)`, `icon` is `OFFICE_ICON[code]`. |
| **scan** | `useTickets` | `Button`, `Input` (manual code), `NoticeModal` | `manualCode`, `busy` | Scanned or typed code calls `verifyArrival(code)`; `WRONG_OFFICE`, `NO_CALLED_TICKET`, `EXPIRED` show their messages; on `ok` confirm and go Home. |
| **profile** | `useAuth`, `useBans` | `Hero(profile)`, `ListRow(menu)` x5, `ConfirmModal` (log out) | `logoutOpen` | Menu: Queue History, Bans and Warnings, Settings, Help and Support, Log out (destructive). `signOut` on confirm. |
| **edit-profile** | `useAuth` | `Input`, `Picker`, `Button` | form fields, `busy` | Students edit `program` only; guests edit name, email, guest type. The ID field is read-only (`disabled`). `updateProfile`. |
| **bans** | `useBans`, `useNow` | `Header(sub)`, `InfoCard(banStatus)`, `InfoCard(policy)`, `ListRow(offense)`, `EmptyState(bans)` | none | `state`: banned if `isBanned(ban, now)`, else warning if `offenseCount === 1`, else clean. Offense row `status`: revoked, else caused-a-ban, else active. |
| **notifications** | `useNotifications`, `useNow` | `Header(sub)`, `Badge(count)`, `ListRow(notification)`, `EmptyState(notifications)` | none | Group with `historyGroup`. Style from `NOTIFICATION_STYLE[type]`, `unread` is `!isRead`, `meta` is `timeAgo`. Tap: `markRead(id)` then navigate via `NOTIFICATION_ROUTE[type]` if not null. `markAllRead` in the header area. |
| **settings** | `useSettings`, `useDeviceCapabilities` | `Header(sub)`, `Toggle` x2, theme selector (inline) | none | Push: request OS permission first, call `setPush(true)` only if granted. Biometrics: `disabled` when unsupported. `setTheme('system\|light\|dark')`. |
| **help** | none | `Header(sub)`, `InfoCard(faq)` x4, `Button` | `expandedId` | Static FAQ copy; the Contact Support button opens the redirect screen. |

---

## Open items (not blocking)

- `QueueModalKey.SUCCESS` has no matching Figma modal. Decide what a successful join shows (proposal: close the modal, and the new ticket appears on Home).
- `STUDENT_ID_TAKEN` is the least certain code: the PRD implies unique student IDs but does not state it.
- Whether guests get a Sign out button is unstated in the PRD (guest accounts are device-bound).
- The theme selector shows only Light and Dark in Figma, but Settings is `system | light | dark`.
- `useNow()`, `utils/time.js`, and the extra constants are proposals added for the audit. Trim them if the audit shows they are not needed.
- Fast Refresh caveat: each provider file exports both its component and its hook, which can reset mock state on save in dev only.
