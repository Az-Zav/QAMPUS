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

### 6.4 Public display (D01), PRD R-20, R-21
Goal: `/display/[code]` in the staff app shows Now Serving, the next three, the office QR and the manual code, with no staff login; delete `MOCK_OFFICES`.
Design: the display device signs in anonymously (`signInAnonymously`); existing rules already allow any signed-in user to read `offices`
and `queues`, and tickets stay private, so no rules change is expected. Developer step: enable the Anonymous provider in Firebase Auth.
Now serving comes from `queues.last_called_seq` (short number `CODE-SEQ`); the next three are the following numbers up to `last_seq`
(cancelled numbers can appear, accepted imprecision, same as the waiting count). Look the office up by its code (`where code == ...`).
The QR encodes `qampus://check-in/{code}/{check_in_code}` (`checkInPayload` already exists). Closed state: "This queue is closed".
Tests: manual on a second browser window.

### 6.5 QR scan on the student Scan tab, PRD R-20, R-21, R-31
Needs `npx expo install expo-camera`, the camera permission plugin in `apps/mobile/app.json`, and a new dev build
(`eas build --profile development`); the developer runs the build. Parse the payload, take the digits, call the same `checkInByCode` as
manual entry (identical validation, R-21); camera denied or unavailable falls back to the manual field. Do this after 6.4 so the display QR exists to scan.

### 6.6 Guests, PRD R-02, R-30
Goal: guest sign-in (anonymous account, device bound), guest profile (name, type, optional email) and a unique Guest ID `G` + six digits.
Design: `institutionalIds/{id}` claim docs (create-only, `uid`) keep student and guest IDs unique; the student `complete-profile` should
claim the student ID too (not done yet: two students can currently save the same ID). The rules already allow a GUEST `users` create for
anonymous accounts. `QueueDataProvider` currently subscribes for students only; include guests. Replace `MOCK_USER_GUEST` in the mobile
`SessionProvider`. Guest ID generation under Spark: pick a random candidate and claim it with a transaction, retry on collision (a client
helper is acceptable here because rules enforce uniqueness; record that this departs from R-30's "server issues it").

### 6.7 Small issues (can ride along with any slice)
- `edit-profile.jsx` calls `updateProfile`, which `SessionProvider` does not define, so saving throws. Open question to ask first:
  is the student ID editable (PRD R-01 says locked, DoD #22 says editable)?
- Staff actions that are refused only log to the console; add an on-screen message (`InlineBanner` exists).
- Seeded `offices/off_reg_001.hours`: `close_min` should be 1020 and MON to FRI must be present. The developer edits this in the Firebase
  console (the agent cannot write Firestore). Needed before the 6.3 test. Numbers must be the `number` type; a missing day means closed.
  Proposed: `hours` map with MON, TUE, WED, THU, FRI each `{ open_min: 480, close_min: 1020 }` (08:00 to 17:00), no SAT or SUN.
- Stray root `app.json`; root `README.md` is the Expo template; the `ui-mock-final` tag was never created.
- Open question: a separate dev Firebase project?

## 7. Start of the next session
1. Read the four docs above; confirm `git status` is clean and the branch is `claude/expo-google-signin-d8d7du`.
2. Run `npm test` in `packages/backend` (expect 65 passing).
3. Ask the developer which slice to start (recommended order: 6.4, 6.5, 6.6; push; 6.7 whenever convenient) and answer the
   "Decision for the developer" questions of that slice before writing code.
