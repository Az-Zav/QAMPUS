# Next session plan

Updated 2026-10-25 after slices 6.1 to 6.3 (was written 2026-10-24, at commit `892ee14`) (branch `claude/expo-google-signin-d8d7du`; stay on it).
Read in this order: `STATUS.md` (what exists), `SCHEMA.md` (data shape), `DECISIONS.md` (why; read the entries for the area you touch),
this file (how we work and what to build next), and `KnowledgeBase/QAMPUS_PRD.md` for the rule IDs quoted below.

## 1. Where things stand
The whole ticket loop is real on Firestore (Spark plan, no Cloud Functions), tested on a phone (student) and a browser (staff):
open queue, join, call, verify arrival (office code or staff ID), complete, no-show, student cancel, office cancel,
three-ticket limit (R-07), one active ticket per office, offenses, strikes, 24-hour ban, revoke (R-11 to R-16), and since 2026-10-25:
the activity log (`events`, 50 per page, real staff names), in-app notifications (`users/{uid}/notifications`, read by viewing, a banner
from the top while the app is open) and the capacity cutoff with measured wait times (client side, staff override logged).
Still mock: staff notifications (one maintenance text), guests, programs list, public display (`MOCK_OFFICES`). Push is not built.
`npm test` in `packages/backend` runs 65 passing unit tests. Both apps lint clean and build.

## 2. How we work (agreed with the developer)
- **One slice at a time.** Build it, run the checks, hand over a test list, the developer tests on phone and browser and confirms,
  then commit and push (one commit per slice). Do not commit or push before the developer says it works.
- **Commit messages carry no `Co-Authored-By` line and no mention of Claude or the session.** The author is the developer's git identity.
- **Prototype level.** Make it work and keep the code small. The three-ticket limit was first built tamper-proof and the developer
  asked for the simple version; rules that cannot see "why" a field moved are accepted (record it in DECISIONS).
- **Explain before big changes.** For anything that changes a locked schema collection, rewrites a working flow, or adds a new
  collection, say what and why first and wait for a yes. Explain in plain words; the developer asks follow-ups when a design is unclear.
- **A locked collection changes only through a new DECISIONS entry** (see the top of SCHEMA.md). Update SCHEMA.md in the same commit.
- **Docs move with the code.** Overwrite STATUS.md, append to DECISIONS.md (never edit old entries; an unpushed entry may be rewritten).
- **Rules are deployed by the developer**, not by the agent: the permission check blocks production deploys. Give the exact command and
  wait. `firestore.rules` is the only source of truth; a deploy replaces the whole ruleset.

## 3. Environment
- Two terminals: `npm run staff` (web, port 8081) and, from `apps/mobile`, `npx expo start --dev-client --tunnel --port 8082`
  (phone: Expo dev client; JS changes reload, only native changes need a rebuild).
- Accounts: staff signs in with the developer's personal Gmail (doc `staff/{email}`, office `off_reg_001`); the student uses the school
  `@tip.edu.ph` account. Office `off_reg_001` (code R, `check_in_code` 082607) is seeded by hand; its `hours` may need fixing (see 6.7).
- Firebase CLI is installed globally; on this machine `%APPDATA%\npm` is not on PATH in a fresh shell:
  `$env:Path += ";$env:APPDATA\npm"` then `firebase deploy --only firestore:rules --project qampus-d0718`.
- Checks the agent can run: `npm test` (packages/backend), `npx expo lint` in each app, `npx expo export --platform web` (staff) and
  `--platform android` (mobile) as build checks. Rules cannot be tested without the emulator (decided against); the developer's test is the check.
- **Test data reset** (needed after a data-model change or when counters drift): delete the docs in `tickets` and `offenses` and today's
  `queues/off_reg_001_<yyyymmdd>`; on each test student's `users` doc set `active_count` 0, `strike_count` 0, `banned_until` null (a real
  null, not an empty string) and clear `active_offices`.

## 4. Code map
- `packages/core`: `domain.js` (enums, `RULES`), `format.js` (campus day UTC+8: `campusDate`, `todayHours`), `ticket.js`, `mock.js`
  (left: `MOCK_NOTIFICATIONS`, `MOCK_OFFICES`, `MOCK_PROGRAMS`, `MOCK_STAFF_ACTIVITY`, `MOCK_STAFF_NOTIFICATIONS`, `MOCK_USER_GUEST`).
- `packages/backend` (`@qampus/backend`, shared by both apps, one copy): `ticketing/` and `penalties/`, each with pure files
  (`ids`, `derive`, `preflight`, `progress`, `offense`: no Firebase, unit tested in `test/`) and `data.js` (listeners) / `service.js`
  (transactions). Every service function takes `db` first. `plain.js` turns snapshots into plain objects (timestamps as ISO strings).
- `packages/backend/src/events` (`buildEvent`, `logEvent`, `watchOfficeEvents`, `loadEventsPage`) and `notifications` (`buildNotification`,
  `approachingTicket`, `notify`, `watchMyNotifications`, `markNotificationRead`); `ticketing/derive.js` also holds `cutoffState`.
- `apps/mobile/src`: `providers/QueueDataProvider` (one set of listeners: offices, today's queues, my tickets, my offenses, my profile, my notifications),
  hooks `useOffices`, `useMyTickets`, `useJoinQueue`, `useCancelTicket`, `useCheckIn`, `usePenaltyRecord`; the signed-in layout hosts the
  app-wide "your turn" `CalledModal`; Scan tab takes the 6-digit code.
- `apps/staff/src`: providers `SessionProvider`, `OfficeProvider`, `QueueProvider` (real queue, tickets, offenses; the activity log and
  the cutoff override are the only mock state left in its reducer); hooks `useTodayQueue`, `useOfficeTickets`, `useOfficeOffenses`.
- `firestore.rules` helper functions: `isStaff`/`staffOfficeId`, `todayKey`, `validJoin`, `validCall`, `validArrival`, `validFinish`,
  `validCancel`, `validOfficeCancel`, `validOffense`, `validRevoke`, `penaltyMoveOk`, `banWindow`, `revokeMoveOk`, `validEvent`,
  `validNotification` (plus a staff clause on `queues` to set `cutoff_overridden`).
- Data: `users` (strike_count, banned_until, active_count, active_offices), `offices`, `staff`, `queues/{officeId}_{yyyymmdd}`,
  `tickets/{queueId}_{seq}`, `offenses/{ticketId}`, `events/{autoId}`, `users/{uid}/notifications/{autoId}`.

## 5. Lessons to keep (these cost time once)
1. Rules allow about 20 document lookups per multi-document write; each extra document a write touches costs lookups. Office cancel
   therefore runs in groups of 3.
2. When a rule compares another document's state with `getAfter()`, the client must write the exact number, not `increment()`
   (the join writes `active_count: n + 1`). `increment()` is fine when the rule reads the same document's `request.resource`.
3. Rules cannot query. Anything of the form "does the student already have a ticket here" must live at a known path (`users.active_offices`).
4. Staff can `get` one student profile (never list); they cannot read other users' notifications or tickets outside their office.
5. Edit the console with real types: a cleared field is not `null`; a missing `active_count` reads as 0 in rules and code.
6. Shell: multi-line scripts and text with backticks or `$` break in bash heredocs. Write scripts with the file tool, then run them;
   repo files are CRLF on disk (git normalizes), so edit through scripts that normalize line endings or use the Edit tool.
7. The staff `office` from `useOffice()` is a display VIEW: its `hours` is text ("09:00–09:50"); the stored per-day map is `hoursByDay`.
   Anything that needs the real hours (the cutoff) must use that. The mobile `board.offices` are raw records.
8. A screen can stay mounted behind another one in the stack: effects with side effects (marking read) must run on focus
   (`useFocusEffect`), not on mount. In transactions, all reads come before any write (an event or notification `set` goes last).
9. The mobile dev client shows the dev-only warning "Can't perform a React state update on a component that hasn't mounted yet"
   (expo-router `ContextNavigator`). Not traced; to bisect, remove `QueueDataProvider` from `apps/mobile/src/app/_layout.jsx` and reload.

## 6. The plan, in order
Each slice: build, run the checks, deploy rules (developer), test list, commit. Reset test data first when the model changed.

### 6.1 to 6.3 (DONE 2026-10-25, tested and committed; reasons in DECISIONS.md)
- **6.1 Activity log (`events`)**: `logEvent` (`@qampus/backend/events`) adds one line inside each action's transaction or batch;
  staff actions take `actor { uid, name }`. The staff log reads 50 per page (live page 1, `startAfter` for older pages, arrows) with
  action and date filters; needs the two composite indexes in `firestore.indexes.json`. Not logged: invalid scan, offense lines.
- **6.2 Notifications**: `buildNotification` (pure) plus `notify(db, tx, uid, type, ctx)` write a letter with each cause (your turn,
  approaching turn at place 3, no-show, queue cancelled per ticket, offense revoked, queue confirmed, warning on a called cancel).
  Mobile: one listener in `QueueDataProvider` (tagged mailbox + `notificationsReady`), `useNotifications` (`markRead`),
  `useNotificationToast` + `NotificationToast` (banner, quiet for YOUR_TURN and WARNING), and the Notifications screen marks letters
  read only while it is focused (`useFocusEffect`). Push is NOT built.
- **6.3 Capacity cutoff**: `cutoffState` and `averageServiceMinutes` (derive.js, unit tested); the join check reads the stored office;
  the Join button reason and the staff banner/strip use it; staff Override cutoff = `overrideCutoff` (queue flag + `CUTOFF_OVERRIDE`
  event). Client-side only. An office with no hours that day has no cutoff. The measured average is today's `service_seconds_total /
  completed_count`; very fast test visits make the cutoff sit at closing time (reset both counters in the console to test with the
  default). Candidate follow-up: use the measured average only after 3+ visits and never below 1 minute.

### Roadmap (agreed with the developer 2026-10-25; follow this order)
1. **6.7 Small issues** (in progress; see below). The optional cutoff tweak (measured average only after 3+ visits) is NOT part of it.
2. **6.4 Public display**, planned after 6.7 (design below), then built.
3. **6.6 Guests / anonymous sign-in**: first finalize the flow with the developer, write the plan here, then execute.
4. **Slices that need a new native package, batched into ONE dev build** (so only one rebuild): QR scan with `expo-camera` (6.5),
   push notifications with `expo-notifications` (needs the sender decision first), biometric sign-in/unlock. Plan each when reached.
5. **UI polish**: improve spacing of components on the screens, responsiveness (phone sizes and the staff web at different widths),
   and remove the dev preview states (`// DEV-PREVIEW` markers, `usePreview`, `src/dev/previews.jsx`, `playground.jsx`).
6. **Deploy as a preview for end-to-end testing** (EAS preview build/update for the apps, and a hosted preview of the staff web;
   decide the hosting when reached). Also decide then whether to use a separate dev Firebase project.

### 6.7 Small issues (DONE 2026-10-25, awaiting the developer's test; the optional cutoff tweak was left out on purpose)
- Edit Profile: `useSession().updateProfile` saves a student's program (`saveStudentProgram`); the student ID is locked (R-01, and the
  rules already refuse a change once it is set). A guest's edit changes memory only until 6.6.
- A refused staff action shows a red banner on every console screen (`ActionNotice` in `ConsolePage`, text in `ACTION_ERROR_COPY`,
  state `notice` in `QueueProvider`), auto-dismissed after 8 seconds.
- The stray root `app.json` (a different EAS project and owner than `apps/mobile/app.json`) was removed and the root `README.md`
  rewritten. Root `eas.json` was left alone (looks like a leftover too; decide with the developer).
- Still open for later: the `ui-mock-final` tag (a pushed tag is outward-facing: ask first) and the separate dev Firebase project
  question (decide at the preview deployment step).

### 6.4 Public display (D01), PRD R-20, R-21 (the developer's model; plan in detail after 6.7)
Model: in the staff web app a **"Launch public display" button** opens the display in a **new browser tab or window**
(`window.open` to `/display/[code]`), meant for the TV at the counter. The display shows Now Serving, the next three tickets, the manual
code and the **office QR that encodes `check_in_code`** (`checkInPayload` already builds `qampus://check-in/{code}/{check_in_code}`),
with a "This queue is closed" state; it needs no staff action once launched. Delete `MOCK_OFFICES` and `useOfficeByCode`'s mock.
To settle when planning: the display page's sign-in (a new tab of the same browser already has the staff session, so it may simply
reuse it; a separate TV browser needs `signInAnonymously` and the Anonymous provider enabled in Firebase Auth, which the developer
does), a QR component for the web (a small library or SVG), full-screen button, and auto-refresh via the existing queue listener.
Now serving comes from `queues.last_called_seq`; the next three are the following numbers up to `last_seq` (cancelled numbers can
appear, the same accepted imprecision as the waiting count). Rules already let any signed-in user read `offices` and `queues`.

### 6.6 Guests / anonymous sign-in (flow to be finalized with the developer before any code)
Goal: guest sign-in (anonymous account, device bound), guest profile (name, type, optional email) and a unique Guest ID `G` + six
digits (PRD R-02, R-30). Starting design: `institutionalIds/{id}` claim docs (create-only, `uid`) keep student and guest IDs unique;
the student `complete-profile` should claim the student ID too (two students can currently save the same ID). The rules already allow
a GUEST `users` create for anonymous accounts. `QueueDataProvider` currently subscribes for students only; include guests. Replace
`MOCK_USER_GUEST` in the mobile `SessionProvider`. Guest ID under Spark: pick a random candidate and claim it in a transaction,
retry on collision (a client helper; rules enforce uniqueness; this departs from R-30's "server issues it"). Questions for the
planning conversation: what a guest may do (limits vs students), what happens when the device loses its anonymous account, and
whether a guest can later link to a school account.

### 6.5 and the native slices (after 6.6, one rebuild)
- QR scan on the student Scan tab (R-20, R-21, R-31): `npx expo install expo-camera`, the camera permission plugin in
  `apps/mobile/app.json`; parse the payload, take the digits, call the same `checkInByCode` as manual entry (identical validation);
  camera denied or unavailable falls back to the manual field.
- Push (R-25: only "your turn" is pushed, respects `push_enabled`): `expo-notifications`, the device token on `users.push_token`, and
  a sender (the staff client through Expo's push API using the student's token, or a small relay). Decide the sender first. In-app
  notifications already work without it.
- Biometric sign-in/unlock: to be planned (likely `expo-local-authentication`).
The developer runs the build: `eas build --profile development`.

## 7. Start of the next session
1. Read the four docs above; confirm `git status` is clean and the branch is `claude/expo-google-signin-d8d7du`.
2. Run `npm test` in `packages/backend` (expect 65 passing, plus any added since).
3. Continue the roadmap in section 6 in order. After 6.7 is committed: plan 6.4 with the developer (the questions listed there), then
   build it; then finalize and plan 6.6 before executing it.
