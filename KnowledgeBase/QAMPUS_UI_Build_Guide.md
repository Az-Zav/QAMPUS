# QAMPUS — UI Build Guide

**v1.1** · UI-only build of the student app (React Native / Expo) and staff web app (React DOM / Vite).

Refs: `QAMPUS_PRD.md` v1.2 (behavior) · `QAMPUS_UIUX.md` v1.1 (screens) · Figma **DOMinions**, pages `QAMPUS v1.2` and `QAMPUS Staff Web App`.

---

## Contents

1. Read this first
2. Design tokens
3. Layout and scrolling
4. Mock data and scenarios
5. Conventions
6. Mobile — structure
7. Mobile — screens
8. Mobile — components
9. Mobile — sensors
10. Staff web — structure
11. Staff web — screens
12. Staff web — components
13. Build order and tasks
14. Done criteria and open decisions

---

## 1. Read this first

**Scope.** Every screen, state, component and modal of both clients, against mock data. Nothing talks to a server.

**Not in scope.** Backend, real auth, real QR decoding, push delivery, persistence, super-admin, analytics.

**Ground rules**

| Rule | Detail |
|---|---|
| JavaScript, not TypeScript | Course requirement. No `.ts`/`.tsx`. |
| No backend | Everything goes through `services/api.js`, which reads `mocks/`. One file changes later. |
| No state library | `useState` in the screen that owns the data; session in a context. |
| Tokens only | No raw hex, no magic numbers in component files. |
| Components are presentational | Props in, UI out. No fetching, no navigation, no mock imports. |
| Mobile styling | `StyleSheet` only. **Web:** CSS modules + custom properties. No Tailwind. |

**Precedence when sources disagree:** PRD → UIUX → Figma. If Figma shows something the PRD forbids, Figma is wrong.

---

## 2. Design tokens

**Color**

| Token | Hex | Use |
|---|---|---|
| `ink` | `#0A0A0A` | Primary text, dark surfaces |
| `gold` | `#FFC72C` | Accent, CTAs, called state |
| `goldDeep` | `#C9982A` | Pressed / active |
| `paper` | `#FAF7F0` | Light background |
| `slate` | `#6E6B63` | Secondary text, terminal states |
| `success` | `#2E7D4F` | In service, completed |
| `danger` | `#B3261E` | Expired, no-show, destructive |

Derived: `surfaceElevated` `#FFFFFF` · `border` ink 12% · `overlay` ink 55% · `textOnDark` paper.

**Type**

| Token | Mobile | Web |
|---|---|---|
| `display` | 32 bold | 48 bold |
| `title` | 24 bold | 32 bold |
| `heading` | 20 semibold | 24 semibold |
| `body` | 16 | 16 |
| `bodySm` | 14 | 14 |
| `label` | 12 semibold uppercase +0.08em | same |

Display screen overrides: now-serving 160, next-three 64, supporting 40.

**Spacing** `4 8 12 16 20 24 32 40 48 64` — referenced as `space[n]`.
**Radius** `sm 8 · md 12 · lg 16 · xl 24 · pill 999`.
**Elevation** `card` · `modal` · `nav`.

Same token names in both apps; `colors.gold` on mobile, `--color-gold` on web.

---

## 3. Layout and scrolling

### 3.1 Grids

| Surface | Frame | Gutter | Content |
|---|---|---|---|
| Mobile | 402 | 20 | 362 |
| Staff web | 1920 | 200 | 1520 (capped, centred) |
| Display | 1920 × 1080 | — | two panes, 1440 + 480 |

Mobile is designed at 402 but renders on any width — never hardcode 402 or 362, use `flex: 1` + `paddingHorizontal: space[20]`.

### 3.2 Mobile — what scrolls

```
SafeArea
├── Header       fixed, sibling of the scroll view
├── ScrollView   flex: 1
└── BottomNav    fixed, sibling
```

- Header and bottom nav are never inside the `ScrollView`.
- `contentContainerStyle.paddingBottom` = nav height + `space[4]` + bottom inset. Without it the last card hides under the nav.
- `SafeAreaView` with `edges={['top']}` on the header, `edges={['bottom']}` on the nav.
- Screens with no nav (S01–S06, S18) still pin their primary button above the bottom inset.

Exceptions: **S11 Scan** does not scroll. **S09 / S10** let the gold header scroll away while the search bar and switcher stick below the fixed header. **S01–S03** are fixed — if content doesn't fit, cut content.

### 3.3 Web — what scrolls

```css
.shell  { height: 100dvh; display: flex; flex-direction: column; }
.topBar { position: sticky; top: 0; z-index: 20; }
.banner { position: sticky; top: var(--topbar-h); z-index: 19; }
.main   { flex: 1; overflow-y: auto; overflow-x: hidden; }
.footer { position: sticky; bottom: 0; z-index: 20; }
```

- The page never scrolls horizontally.
- **W03** is two columns inside `main`; each scrolls independently, the page does not.
- **W04 / W05** tables scroll in their own container with a sticky table header.
- **D01** never scrolls — `overflow: hidden` on the root.

### 3.4 Overflow rules

| Content | Behavior |
|---|---|
| Ticket number | Never truncate, never wrap |
| Person name, program, guest type | Truncate, one line |
| Office name | Truncate on cards and rows; wrap to two lines in headers |
| Reason text | Wrap, max 3 lines, then ellipsis (full text in `title` on web) |
| Notification body | Wrap, max 2 lines |
| Lists and tables | Scroll the container, never the page |

Mocks include one over-long name, one over-long reason, and an office with no location. Test against them.

### 3.5 Breakpoints — **decision, needs sign-off**

Mobile: one width, fluid, no breakpoints.

Staff web is a browser tab beside other work, so it must survive half-width:

| Width | Behavior |
|---|---|
| ≥ 1920 | Content capped 1520, centred |
| 1280–1919 | Fluid, gutter 48 |
| 1024–1279 | W03 columns stack |
| < 1024 | Plain "needs a wider window" message |

D01 is exempt. **This table is not in the PRD or UIUX — confirm before building.**

### 3.6 Polling feedback

Small "Updated just now" indicator, never a blocking spinner over data that already exists. First load only uses skeletons.

---

## 4. Mock data and scenarios

### 4.1 The API seam

```js
// services/api.js
export async function api(path, { method = 'GET', body } = {}) {
  await delay(300);
  return mocks.resolve(path, method, body, scenario.current());
}
```

When the backend lands, only this body changes.

### 4.2 Shapes

```js
Ticket {
  id, ticketNumber: 'R-09-21-005',   // stored
  shortNumber: 'R-005',              // display (R-08a)
  officeId, officeName, officeCode,
  status: 'WAITING',   // WAITING CALLED IN_SERVICE COMPLETED CANCELLED NO_SHOW
  expired: false,      // CALLED + grace lapsed — display state only
  position, peopleAhead, estimatedWaitMinutes, nowServing,
  joinedAt, calledAt,  // calledAt drives the countdown
  cancelledByOffice: false,
}

Office {
  id, code: 'R', name, location,
  status: 'OPEN',      // OPEN CLOSED
  nowServing, queueLength, averageServiceMinutes,
  joinable: true,
  joinBlockedReason: null,  // CLOSED | CUTOFF | BANNED | TICKET_LIMIT
  opensAt, closesAt, manualCode: '418902',
}

User {
  id, role: 'STUDENT',  // STUDENT GUEST STAFF
  name, email,
  institutionalId: '2512269',   // students 7 digits; guests 'G104728', no dash
  program, guestType,           // PARENT_GUARDIAN ALUMNI REPRESENTATIVE
  strikeCount, bannedUntil, pushEnabled, assignedOffice,
}

Notification { id, type, title, message, ticketShortNumber, isRead, createdAt }
// type: QUEUE_CONFIRMED YOUR_TURN APPROACHING_TURN NO_SHOW QUEUE_CANCELLED
//       SERVICE_COMPLETED WARNING GLOBAL_ANNOUNCEMENT OFFENSE_REVOKED

Offense { id, type, ticketNumber, officeName, occurredAt, resultedInBan, revokedAt }
// type: NO_SHOW | CANCELLED_AFTER_CALL · active when revokedAt is null

LogEntry { id, occurredAt, ticketNumber, action, fromStatus, toStatus, actor, reason }
// actor is a name or 'System'
```

Three offices only: `R` University Registrar · `M` Medical and Dental Services · `S` Student Accounting Office.
Program placeholders: Computer Science · Information Technology · Data Science and Analytics.

### 4.3 Scenario switch

```js
['default','waiting','called','expired','inService','banned','oneStrike',
 'cutoff','queueClosed','ticketLimit','empty','offline','guest']
```

Mobile: long-press the Home greeting. Web: `?scenario=`. Both behind a dev flag.

---

## 5. Conventions

**Files.** Components `PascalCase.jsx`, default export matching the filename. Everything else `camelCase.js`. Screens named for purpose (`HomeScreen.jsx`), ID in a comment on line 1. Component folders only when there's more than one file.

**Props.** Required first, handlers last. `onSomething`, never `handleSomething`. Booleans read positively. State comes in as one `status` string, never several booleans. Max 8 props — past that pass the object. Defaults in the destructure.

**Styling.** One `StyleSheet.create` named `styles` at the bottom (mobile) / one `.module.css` per component (web). Never inline a style object that could be static.

**Imports.** React → third-party → theme → components → services → styles.

**Git.** Branch `feat/<area>-<screen>`. Commit `mobile(S07): add ticket stub cards`. One screen or component per PR; more than six files is too big.

---

## 6. Mobile — structure

```
mobile/
├── App.js
└── src/
    ├── navigation/
    │   ├── RootNavigator.jsx     auth stack vs main tabs
    │   └── TabNavigator.jsx      Home · Scan · Queue
    ├── screens/
    │   ├── onboarding/OnboardingScreen.jsx        S01–S03
    │   ├── auth/
    │   │   ├── LoginScreen.jsx                    S04
    │   │   ├── GoogleAccountScreen.jsx            S04 modal mock
    │   │   ├── CompleteProfileScreen.jsx          S05
    │   │   ├── GuestProfileScreen.jsx             S06
    │   │   └── GuestIdIssuedScreen.jsx            S06-IDIssued
    │   ├── home/HomeScreen.jsx                    S07 · S08 · offline
    │   ├── queue/
    │   │   ├── QueueScreen.jsx                    shell + switcher
    │   │   ├── JoinView.jsx                       S09
    │   │   └── HistoryView.jsx                    S10
    │   ├── scan/ScanScreen.jsx                    S11
    │   ├── notifications/NotificationsScreen.jsx  S12
    │   ├── profile/
    │   │   ├── ProfileScreen.jsx                  S13
    │   │   ├── EditProfileScreen.jsx              S14
    │   │   ├── BansWarningsScreen.jsx             S15
    │   │   ├── SettingsScreen.jsx                 S16
    │   │   └── HelpSupportScreen.jsx              S17
    │   └── misc/BrowserRedirectScreen.jsx         S18
    ├── components/
    │   ├── shell/       ScreenShell · Header · SubHeader · BottomNav · Hero
    │   │                EmptyState · Outage · SectionLabel · SegmentedSwitcher
    │   ├── cards/       TicketStub · OfficeCard · OfficeHoursCard · BanBanner
    │   │                PolicyExplainer · StrikeMeter · FaqCard
    │   ├── rows/        HistoryRow · OffenseRow · NotificationRow · ProfileMenuRow
    │   ├── primitives/  Button · Surface · StatusBadge · CountBadge · NowServingChip
    │   │                Avatar · OfficeIcon · TextField · SearchField · Picker
    │   │                ToggleRow · ThemeSelector · Skeleton
    │   └── modals/      ModalShell + M01–M09
    ├── theme/           colors · typography · spacing
    ├── services/        api.js · scenario.js
    ├── context/         SessionContext.jsx
    ├── hooks/           usePolling · useCountdown · useHaptics
    ├── mocks/           index · tickets · offices · users · notifications · offenses
    └── utils/           formatTicket · formatTime · constants
```

**Navigation**

```
RootNavigator (stack)
├── Onboarding                 first launch only
├── Auth (stack)               Login → GoogleAccount → CompleteProfile
│                                   → GuestProfile → GuestIdIssued
└── Main (bottom tabs)
    ├── Home (stack) → Notifications · Profile · EditProfile
    │                  · BansWarnings · Settings · HelpSupport · BrowserRedirect
    ├── Scan          center tab, emphasized
    └── Queue         Join | History switcher
```

Profile and Notifications come from header icons and push onto the Home stack. **Modals are not navigation screens** — they render conditionally inside the screen that owns them, and never stack (M02 → M03 replaces M02).

**ScreenShell** owns the §3.2 rules so no screen re-implements them.

| Prop | Default | Notes |
|---|---|---|
| `header` | — | rendered fixed, outside the scroll |
| `children` | — | inside the `ScrollView` |
| `scroll` | `true` | `false` for S11 |
| `refreshing` | `false` | poll indicator |
| `bottomNav` | `true` | `false` for auth screens |
| `footerAction` | — | pinned above the safe area |

---

## 7. Mobile — screens

| ID | File | Composes | States |
|---|---|---|---|
| S01–03 | `OnboardingScreen` | illustration, dots, Button, Skip | slide 1 · 2 · 3 (Next → Get Started) |
| S04 | `LoginScreen` | `Hero` (SignIn), 2 Buttons | default · loading · error (auth failed / wrong domain) |
| S04b | `GoogleAccountScreen` | mock of Google's chooser | account list |
| S05 | `CompleteProfileScreen` | TextField (ID), Picker (program) | empty · error (≠7 digits, no program) · saving |
| S06 | `GuestProfileScreen` | TextField ×2, Picker (guest type) | empty · error · saving |
| S06b | `GuestIdIssuedScreen` | success icon, generated ID | one |
| S07/08 | `HomeScreen` | Header, greeting, TicketStub ×0–3, OfficeHoursCard ×3 | populated · empty · offline |
| S09 | `JoinView` | SearchField, Switcher, OfficeCard ×3 | default · filtered · no results · cutoff · closed · banned · ticket limit · offline |
| S10 | `HistoryView` | Switcher, SectionLabel, HistoryRow | populated · empty |
| S11 | `ScanScreen` | viewfinder, overlay, manual-code Button | scanning · manual · permission denied · success · 3 invalid reasons |
| S12 | `NotificationsScreen` | SubHeader, CountBadge, NotificationRow | unread · all read · empty · offline |
| S13 | `ProfileScreen` | `Hero` (Student/Guest), ProfileMenuRow ×5 | student · guest |
| S14 | `EditProfileScreen` | Avatar, TextFields, Picker | student · guest · error · saving |
| S15 | `BansWarningsScreen` | BanBanner, StrikeMeter, PolicyExplainer, OffenseRow | clean · one offense (warning line) · active ban · history only |
| S16 | `SettingsScreen` | ToggleRow ×2, ThemeSelector | push on · push off · light · dark |
| S17 | `HelpSupportScreen` | FaqCard ×4, contact Button | collapsed · one expanded |
| S18 | `BrowserRedirectScreen` | message | one |

**Screen notes that matter**

- **S07** orders cards most-urgent-first (CALLED → IN_SERVICE → WAITING), one "Next up" tag on at most one waiting card. Tapping opens M02; an IN_SERVICE card is **not** tappable.
- **S09** Join opens M01 normally, M07 when banned, M08 when closed or past cutoff, and shows the limit message at three tickets. The office card shows no wait estimate — that lives in M01 and on Home cards.
- **S10** shows **full** ticket numbers. Office-cancelled reads "Cancelled by office" in neutral styling, never as a penalty.
- **S11** invalid messages: wrong office → "This code is for a different office." · no called ticket → "You don't have a called ticket at this office right now." · expired → "Your time to check in has passed. Staff will update your ticket."
- **S12** tapping YOUR_TURN on a still-CALLED ticket opens M05; WARNING and NO_SHOW go to S15.
- **S13** the hero's top-right edit icon goes to S14.
- **S16** the biometric toggle is **inert** — it animates and changes nothing. The theme selector switches the whole app between light and dark (see `providers/ThemeProvider`).
- **S04b** is Google's screen, not QAMPUS's — keep it outside the token system. Its "Forgot password?" routes to S18; QAMPUS has no password reset (R-01).
- **S05, S06, S14** are keyboard-aware.

---

## 8. Mobile — components

### Button
| Prop | Type | Default |
|---|---|---|
| `label` | string | required |
| `kind` | `primary \| secondary \| destructive \| ghost` | `primary` |
| `disabled` `loading` | bool | `false` |
| `icon` | node | — |
| `fullWidth` | bool | `true` |
| `onPress` | func | — |

Min height 48; icon-only targets 44 × 44.

### TicketStub — hero component
| Prop | Notes |
|---|---|
| `ticket` | full shape |
| `nextUp` | at most one per screen |
| `onPress` | omit for IN_SERVICE |
| `onOpenScanner` | CALLED only |

| State | Content |
|---|---|
| WAITING | position, people ahead, wait, now serving |
| CALLED | "Your turn", countdown from 1:00, Open scanner |
| Expired | "Expired — waiting for staff", 0:00, no scanner |
| IN_SERVICE | "In service" |

Countdown is presentational, from `calledAt` via `useCountdown`. It never decides validity.

### StatusBadge
`status` · `size`. **Always icon + label** — colour is never the only signal.

| Status | Icon | Label | Treatment |
|---|---|---|---|
| WAITING | clock | Waiting | Slate outline |
| CALLED | bell-ring | Your turn | Gold fill |
| EXPIRED | hourglass | Expired | Danger outline |
| IN_SERVICE | user-round-check | In service | Success fill |
| COMPLETED | circle-check | Completed | Success muted |
| CANCELLED | circle-x | Cancelled | Slate |
| NO_SHOW | user-round-x | No-show | Danger muted |

**Ticket number form:** short `CODE-SEQ` on Home, modals, notifications, staff live queue. Full `CODE-MM-DD-SEQ` in history, activity log, offenses. Use `formatTicket.short()` / `.full()`.

### OfficeCard
`office` · `onJoin`. Default → M01 · Cutoff / Closed → M08 · Banned → M07.

### Rows
| Component | Props |
|---|---|
| `HistoryRow` | `ticket`, `status` (+ CANCELLED_BY_OFFICE) |
| `OffenseRow` | `offense`, `state` (active / revoked / causedBan) |
| `NotificationRow` | `notification`, `onPress` — icon and tone from `type` |
| `ProfileMenuRow` | `label`, `icon`, `destructive`, `onPress` |

### Shell
| Component | Props |
|---|---|
| `Header` | `unreadCount`, `onAvatar`, `onBell` |
| `SubHeader` | `title`, `onBack` |
| `BottomNav` | `active`, `onNavigate` |
| `Hero` | `context` (signIn / profileStudent / profileGuest), `user`, `onBack`, `onEdit` |
| `EmptyState` | `context` (home / history / notifications / bans), `action` |
| `Outage` | none — fixed copy |
| `SectionLabel` | `text`, `kind` |
| `SegmentedSwitcher` | `options`, `value`, `onChange` |

### Inputs
| Component | Props |
|---|---|
| `TextField` | `label`, `value`, `onChangeText`, `helper`, `error`, `keyboardType`, `maxLength`, `editable` |
| `SearchField` | `value`, `onChangeText`, `placeholder`, `onClear` |
| `Picker` | `label`, `value`, `options`, `onSelect`, `searchable` |
| `ToggleRow` | `label`, `description`, `value`, `onChange`, `inert` |
| `ThemeSelector` | `value`, `onChange` |

`inert` renders and animates the control but never calls `onChange`.

### Modals
All centered. No bottom sheets. `ModalShell`: `visible`, `onClose`, `dismissible`, `children`.

| Modal | Props | Confirm |
|---|---|---|
| M01 JoinConfirm | `office`, `estimatedWait` | issues ticket, back to Home |
| M02 Ticket | `ticket`, `onCancel`, `onOpenScanner` | routes to M03 / M04 |
| M03 CancelWaiting | `ticket` | cancels, free |
| M04 CancelCalled | `ticket` | cancels, records an offense |
| M05 Called | `ticket`, `onOpenScanner` | closing doesn't affect the ticket |
| M06 InService | `ticket` | X only |
| M07 Banned | `bannedUntil`, `offenses` | — |
| M08 CapacityCutoff | `office` | — |
| M09 LogOut | — | back to Login |

M02's Cancel routes by state: WAITING → M03 · CALLED or expired → M04 · IN_SERVICE → no Cancel.
**Destructive confirmations keep the safe choice primary** ("Keep ticket"); the consequential action is secondary and labelled by its effect.

### Skeleton
`variant` (ticketStub / row / card), `count`. First load only.

---

## 9. Mobile — sensors

Both required by the rubric.

**Camera** (`expo-camera`, S11 only) — request permission on screen focus. Denied or unavailable → manual-code entry becomes the default view with a one-line explanation; this is a supported path (R-21), not an error. In the UI phase nothing decodes; a dev-only button fires success and each failure.

**Haptics** (`expo-haptics`) — your turn → `notificationAsync(Success)` · successful verification → `impactAsync(Medium)` · invalid scan → `notificationAsync(Error)` · destructive confirm → `impactAsync(Heavy)`. All behind `useHaptics`.

---

## 10. Staff web — structure

```
staff/
├── index.html
└── src/
    ├── main.jsx
    ├── App.jsx                   router + session guard
    ├── routes/
    │   ├── SignIn.jsx            W01
    │   ├── NotAssigned.jsx       W02
    │   ├── Queue.jsx             W03
    │   ├── Offenses.jsx          W04
    │   ├── ActivityLog.jsx       W05
    │   └── Display.jsx           D01  /display/:officeCode
    ├── components/
    │   ├── shell/       AppShell · TopBar · StatusFooter · AccountMenu
    │   │                InlineBanner · EmptyState · Outage · BrandLockup
    │   ├── queue/       HeaderStrip · CurrentTicketPanel · WaitingTable · ManualCode
    │   ├── records/     RecordRow · RecordList · Filters
    │   ├── display/     CheckInPane · QueueStrip · TicketStubLarge
    │   ├── primitives/  Button · SearchField · TextField · StatusPill
    │   │                StatusBadge · Tooltip · Skeleton
    │   └── modals/      ModalCard + WM01–WM08
    ├── theme/           tokens.css · base.css
    ├── services/        api.js · scenario.js
    ├── context/         SessionContext.jsx
    ├── hooks/           usePolling · useCountdown
    ├── mocks/           index · queue · offenses · log · staff
    └── utils/           formatTicket · formatTime
```

**Routes**

| Route | Screen | Auth |
|---|---|---|
| `/staff/sign-in` | W01 | none |
| `/staff/queue` | W03 | session + assignment |
| `/staff/offenses` | W04 | session + assignment |
| `/staff/log` | W05 | session + assignment |
| `/display/:officeCode` | D01 | none |

Guard: no session → sign-in · session without assignment → W02 · otherwise render. `/display/*` renders outside `AppShell` — no top bar, footer or navigation.

`AppShell` takes `topBar`, `banner`, `footer`, `children` and owns the §3.3 CSS.

---

## 11. Staff web — screens

| ID | File | Composes | States |
|---|---|---|---|
| W01 | `SignIn` | BrandLockup, hero pane (880px), sign-in card | default · loading · error (wrong domain) |
| W02 | `NotAssigned` | shield icon, message, sign-out | one |
| W03 | `Queue` | TopBar, HeaderStrip, CurrentTicketPanel, WaitingTable, StatusFooter | see below |
| W04 | `Offenses` | title, SearchField, RecordRow, EmptyState | default · search · no results · offline |
| W05 | `ActivityLog` | title, Filters, RecordRow | populated · filtered · empty · offline |
| D01 | `Display` | BrandLockup, CheckInPane, QueueStrip | called · nobody called · empty · closed · offline |

### W03 states

| State | Renders |
|---|---|
| Open, no current ticket | Panel empty state, Call Next enabled |
| Ticket CALLED | Holder details + grace countdown; Verify by ID enabled; Mark No-Show **visible but disabled**, with a tooltip |
| Ticket expired | Panel danger-outlined, "Expired. Mark as no-show to continue."; Mark No-Show enabled |
| Ticket IN_SERVICE | Complete Service enabled |
| Empty waiting list | `EmptyState` (NoOneWaiting) |
| Queue closed | Read-only, Call Next disabled, Open Queue prominent |
| Cutoff approaching | `InlineBanner` (warning) with Override cutoff |
| Account menu open | Overlay under the account button |
| Offline | `Outage` replaces `main` |

**Action enablement**

| Action | Enabled when |
|---|---|
| Call Next | No current ticket, or it's completed / marked |
| Verify by ID | Current ticket CALLED and not expired |
| Mark No-Show | Current ticket CALLED **and** expired |
| Complete Service | Current ticket IN_SERVICE |

A disabled action always shows a tooltip saying when it becomes available.

**Other notes.** Header strip holds the manual code with a copy button, queue readout, join indicator, Open/Close Queue and Cancel Queue. W04 and W05 use **full** ticket numbers; W04 is scoped to the staff member's own office and keeps revoked rows visible. **D01 never shows names** — ticket numbers only. W05 actions: joined, called, service started, completed, cancelled, no-show, override, invalid scan, queue cancelled, queue closed, cutoff override, offense recorded, offense revoked.

**Outage** is shared by W03–W05 and D01: plain unavailable state in the QAMPUS visual system, not a browser error. Clears itself when polling succeeds. No local authority, no persistence.

---

## 12. Staff web — components

### TopBar
`officeName` · `queueStatus` (OPEN/CLOSED) · `activeTab` · `unreadCount` · `user` · `onNavigate` `onBell` `onAccount`.
Height is a token (`--topbar-h`) — the sticky banner offset depends on it.

### CurrentTicketPanel
`ticket` (null → empty state) · `expired` · `onCallNext` `onVerifyById` `onMarkNoShow` `onComplete`.
Renders large `CODE-SEQ`, holder name, institutional ID, program or guest type, StatusBadge, grace countdown while CALLED, and the four actions with §11 enablement.

### WaitingTable
`tickets` (FIFO) · `onOverride`. Columns: position · `CODE-SEQ` · name · joined · Override. FIFO candidate highlighted as "Next". Sticky table header inside its own scroll container.

### RecordRow
`kind` (log / offenseActive / offenseRevoked) · `record` · `onRevoke`.
Log rows: time · full ticket number · action · from → to badges · actor (or "System") · reason. Missing reason renders nothing, not a dash.

### Others
| Component | Props |
|---|---|
| `InlineBanner` | `tone` (warning / info / danger), `message`, `action`, `onDismiss` |
| `StatusFooter` | `lastUpdated`, `centerText`, `rightText` |
| `EmptyState` | `context` (NoOneWaiting / NoRecords / NoSearchResults) |
| `Skeleton` | `variant` (panel / tableRow / recordRow) |

### Modals — `ModalCard` + WM01–WM08
`field` (none / id / reason) · `title` · `body` · `confirmLabel` · `onConfirm` · `onCancel` · `destructive` · `reasonRequired`.

| Modal | Field | Confirm |
|---|---|---|
| WM01 Override | none | calls that ticket; queue not reordered |
| WM02 Verify by ID | id | CALLED → IN_SERVICE; no match and expired change nothing |
| WM03 Mark No-Show | none | NO_SHOW + offense + strike; Call Next stays separate |
| WM04 Complete | none | COMPLETED |
| WM05 Close Queue | none | CLOSED; existing tickets stay valid |
| WM06 Cancel Queue | reason **required** | all CANCELLED, users notified, nobody penalized |
| WM07 Cutoff Override | none | joining reopens; logged |
| WM08 Revoke | reason optional | offense revoked, strike reversed, ban lifted |

All modals trap focus, close on Escape, return focus to the trigger.

**Keyboard** (UIUX §11): everything Tab-reachable, visible focus ring from a token, row actions are real buttons not click handlers on divs.

---

## 13. Build order and tasks

```
1  Foundations   tokens, scaffold, api.js, mocks, scenario switch
2  Shells        ScreenShell + navigation · AppShell + router + guard
3  Primitives    Button, Surface, badges, inputs, Skeleton
4  Composites    cards, rows, panels, tables
5  Screens       in parallel, by work item
6  Modals        after the screens that trigger them
7  Wiring        every state through the scenario switch
```

| # | Work item | Covers | Depends on |
|---|---|---|---|
| F1 | Mobile foundation | scaffold, theme, api, mocks, scenario | — |
| F2 | Web foundation | scaffold, tokens.css, api, mocks, scenario | — |
| F3 | Mobile shell + nav | ScreenShell, navigators, Header, SubHeader, BottomNav | F1 |
| F4 | Web shell + routing | AppShell, TopBar, StatusFooter, guard | F2 |
| P1 | Mobile primitives | Button, Surface, badges, inputs, Skeleton | F1 |
| P2 | Web primitives | Button, SearchField, pills, Tooltip, Skeleton | F2 |
| M1 | Auth flow | S01–S06, S18 | F3, P1 |
| M2 | Home and tickets | S07, S08, TicketStub, M02–M06 | F3, P1 |
| M3 | Queue and scan | S09–S11, OfficeCard, HistoryRow, M01, M07, M08 | F3, P1 |
| M4 | Notifications and profile | S12–S17, rows, Hero, M09 | F3, P1 |
| M5 | Sensors | camera, haptics | M3 |
| W1 | Staff entry | W01, W02 | F4, P2 |
| W2 | Queue screen | W03, CurrentTicketPanel, WaitingTable, HeaderStrip | F4, P2 |
| W3 | Staff modals | WM01–WM08, ModalCard | W2 |
| W4 | Records | W04, W05, RecordRow, Filters | F4, P2 |
| W5 | Public display | D01 + 4 states | F2, P2 |
| X1 | Outage and empty states | both apps | M2, W2 |
| X2 | Scenario pass | every state reachable | all |

Stub early, finish last: S01–S03, S17, the inert Settings toggles.

---

## 14. Done criteria and open decisions

**A screen is done when**

- [ ] Every state in §7 or §11 renders from the scenario switch
- [ ] Scroll and pin behavior matches §3.2 or §3.3
- [ ] The longest mock value doesn't break it
- [ ] Ticket numbers use the correct form
- [ ] Copy matches UIUX §12 exactly
- [ ] No raw hex, no magic numbers, no `console.log`
- [ ] Mobile: runs on a real device via Expo Go · Web: correct at 1280 and 1920, keyboard-operable

**A component is done when** every Figma variant renders, props match §8 or §12, it stays presentational, and missing optional props don't crash it.

**"80% UI"** = every screen navigable with mock data, every state in §7 and §11 reachable through the scenario switch.

**Open decisions**

| # | Decision | Blocks |
|---|---|---|
| 1 | Staff web shrink behavior (§3.5) | W2, W4 |
| 2 | Call Next guard — disabled while CALLED or IN_SERVICE? (UIUX §15 #1) | W2 |
| 3 | Manual code source (UIUX §15 #5) | nothing in UI |
| 4 | Program list source (UIUX §15 #6) | nothing — placeholder in §4.2 |
| 5 | Backend stack | nothing — the api seam absorbs it |

**Documentation debt**

- UIUX §3.6 still says mobile 390 and staff web 1440/1200. Both superseded: 402/20/362 and 1920/200/1520.
- Staff `StatusFooter` is built but unspecified in UIUX §6.3.
- PRD R-24 has no `OFFENSE_REVOKED` type — it's in the mocks and needs adding, then reflected in S12 and S15.
- S18 BrowserRedirect exists in Figma but not in the UIUX inventory.

---

*End of QAMPUS UI Build Guide*
