# Next session plan

Written 2026-10-24, at commit `892ee14` (branch `claude/expo-google-signin-d8d7du`; stay on it).
Read in this order: `STATUS.md` (what exists), `SCHEMA.md` (data shape), `DECISIONS.md` (why; read the entries for the area you touch),
this file (how we work and what to build next), and `KnowledgeBase/QAMPUS_PRD.md` for the rule IDs quoted below.

## 1. Where things stand
The whole ticket loop is real on Firestore (Spark plan, no Cloud Functions), tested on a phone (student) and a browser (staff):
open queue, join, call, verify arrival (office code or staff ID), complete, no-show, student cancel, office cancel,
three-ticket limit (R-07), one active ticket per office, offenses, strikes, 24-hour ban, revoke (R-11 to R-16).
Still mock: staff activity log, notifications (student and staff), guests, programs list, public display.
`npm test` in `packages/backend` runs 44 passing unit tests. Both apps lint clean and build.

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
- `apps/mobile/src`: `providers/QueueDataProvider` (one set of listeners: offices, today's queues, my tickets, my offenses, my profile),
  hooks `useOffices`, `useMyTickets`, `useJoinQueue`, `useCancelTicket`, `useCheckIn`, `usePenaltyRecord`; the signed-in layout hosts the
  app-wide "your turn" `CalledModal`; Scan tab takes the 6-digit code.
- `apps/staff/src`: providers `SessionProvider`, `OfficeProvider`, `QueueProvider` (real queue, tickets, offenses; the activity log and
  the cutoff override are the only mock state left in its reducer); hooks `useTodayQueue`, `useOfficeTickets`, `useOfficeOffenses`.
- `firestore.rules` helper functions: `isStaff`/`staffOfficeId`, `todayKey`, `validJoin`, `validCall`, `validArrival`, `validFinish`,
  `validCancel`, `validOfficeCancel`, `validOffense`, `validRevoke`, `penaltyMoveOk`, `banWindow`, `revokeMoveOk`.
- Data: `users` (strike_count, banned_until, active_count, active_offices), `offices`, `staff`, `queues/{officeId}_{yyyymmdd}`,
  `tickets/{queueId}_{seq}`, `offenses/{ticketId}`.

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
7. The mobile dev client shows the dev-only warning "Can't perform a React state update on a component that hasn't mounted yet"
   (expo-router `ContextNavigator`). Not traced; to bisect, remove `QueueDataProvider` from `apps/mobile/src/app/_layout.jsx` and reload.

## 6. The plan, in order
Each slice: build, run the checks, deploy rules (developer), test list, commit. Reset test data first when the model changed.

### 6.1 Activity log (`events`), PRD R-28, R-29 (DECIDED with the developer 2026-10-25; follow this plan)
Goal: the staff Activity Log (W05) shows real entries with the real staff name; delete `MOCK_STAFF_ACTIVITY` and the activity half of
the `QueueProvider` reducer. Today `useActivityLog` filters the local mock array `activity` from `QueueProvider`; no Firestore read.
Why events and not "derive from tickets" (the way mobile History works: `watchMyTickets` -> `useMyTickets` -> `toHistoryView`, a view over
ticket docs, no log stored): tickets carry one timestamp per status, so the six ticket actions could be derived, but tickets store no
staff actor, no queue open/close/cancel, no override. The developer needs those, so events are stored.

**Scope.** Actions logged: QUEUE_OPENED, QUEUE_CLOSED, QUEUE_CANCELLED (one event for the whole cancel, ticket count in `reason`),
JOINED, CALLED, OVERRIDE (with reason), SERVICE_STARTED, COMPLETED, CANCELLED (student or office), NO_SHOW. Left out on purpose:
INVALID_SCAN, separate OFFENSE_RECORDED/OFFENSE_REVOKED events (the Offenses screen already shows them), CUTOFF_OVERRIDE (comes with 6.3),
a total count and page jumping.

**Data.** `events/{autoId}`: entity_type, entity_id, action (`ACTIVITY_ACTION`), from_status, to_status, actor_uid, actor_name, reason,
office_id, ticket_number, created_at. Lock it in SCHEMA.md and add a DECISIONS entry in the same commit. Cost: +1 write per action
(about 400 extra writes a day for 100 tickets); no extra reads on the write path.

**Mechanism (write).** One helper `logEvent(tx, db, fields)` in `packages/backend/src/events/` builds the doc and does `tx.set` on a new
auto-id ref inside the transaction that already makes the change, so the line commits or fails with the change. Pure `buildEvent` is
unit tested. Service functions get an `actor` argument `{ uid, name }` (staff: `staff.name` else Google `displayName`; student: profile
name). Write paths (ticketing/service.js, find the exact lines): open queue (~75), join (~117), call and override (~166), complete (~225),
no-show (~255), student cancel (~290), office cancel (~336, one event in the first transaction, not per ticket in the groups of 3).
Verify arrival (`checkInByCode`, `verifyByHolderId`) and close queue are not in the grep of `runTransaction`; find them and add the
event to their write (use a `writeBatch` or the existing transaction). The call for an override passes action OVERRIDE and the reason.

**Rules.** `match /events/{id}`: create only; `created_at == request.time`; `actor_uid == request.auth.uid`; field set fixed with
`hasOnly`; any signed-in user may create (shape checks only, NO lookups, because each extra lookup eats the ~20 limit; staff reads of the
staff doc are probably cached per request, verify on the first call/no-show test); no update, no delete; read only by staff of the office
(`isStaff() && resource.data.office_id == staffOfficeId()`). Accepted weakness (record in DECISIONS): a hand-made client could write
fake lines into an office log; same trust level as the counters. The log is an audit aid, not a gate; rules do not require an event
alongside each transition.

**Mechanism (read, 50 per page, Gmail style).** Query shape for every page:
`where('office_id','==',X), orderBy('created_at','desc'), limit(50)`; optional `where('action','==',A)` and a `created_at` range for the
date filter. Page 1 is a live `onSnapshot` (new events appear at the top). Older pages are one-time `getDocs(... startAfter(lastDoc),
limit(50))` (old entries do not change). The hook keeps `starts = [null, docA, docB...]` (the bookmark where each page begins) and
`page`. Older: push the last doc of the page onto `starts`, load after it, `page + 1`. Newer: `page - 1`, load after `starts[page]`
(page 0 = the live listener again). Label `page*50+1` to `page*50+entries.length`. `hasOlder` = the page came back with 50 entries;
`hasNewer` = `page > 0`. Changing the action or date filter resets `starts = [null]`, `page = 0`. Cache loaded pages in memory so going
back does not re-read. `useActivityLog` returns `{ entries, page, rangeLabel, hasNewer, hasOlder, newer, older }` and
`activity-log.jsx` adds Newer/Older buttons and the label. The date ranges in `ACTIVITY_LOG_COPY.dateRanges` become `created_at`
bounds (campus day UTC+8); `LogRow` keeps its entry shape `{id, action, ticket_number, actor, from, to, reason, note, created_at}`, so map
`actor_name -> actor`, `from_status -> from`, `to_status -> to`.

**Indexes.** New `firestore.indexes.json` (point `firebase.json` at it): (1) `events`: office_id ASC, created_at DESC; (2) `events`:
office_id ASC, action ASC, created_at DESC. The date range reuses index 1. The developer deploys:
`firebase deploy --only firestore:rules,firestore:indexes --project qampus-d0718`. If an index is missing the app logs an error with a
link that creates it.

**Phases (one commit, after the developer confirms).**
1. Helper, rules, indexes: `events/` folder (`buildEvent`, `logEvent`, one unit test), the `events` rule, `firestore.indexes.json`,
   `firebase.json`. Developer deploys rules and indexes.
2. Add the line to every action listed above; pass `actor` through the hooks/providers on both apps (staff `QueueProvider`, mobile
   `useJoinQueue` and `useCancelTicket`).
3. Read side: `watchOfficeEvents` (live page 1) and `loadEventsPage(cursor)`; rewrite `useActivityLog`; screen buttons and label;
   delete `MOCK_STAFF_ACTIVITY` and the reducer's activity half.
4. Checks and test list: `npm test`, lint both apps, staff web export; developer does every action on phone and browser and checks each
   line and the staff name; creates 51+ events to test Older/Newer and the filters; check the rules lookup limit on a no-show.
   Then SCHEMA.md (lock `events`), DECISIONS.md entry, STATUS.md, commit.

### 6.2 Notifications, PRD R-24, R-25 (in-app first) (DECIDED with the developer 2026-10-25; follow this plan; starts after 6.1 is committed)
Goal: the student notifications list and unread count are real; the bell on Home works; delete `MOCK_NOTIFICATIONS`.
Same trick as the events log: a notification is one more write inside a transaction that already exists, so it commits or fails with the
change. It is a doc in the student's mailbox `users/{uid}/notifications/{autoId}`: type, title, message, ticket_id, office_id, is_read
(false), created_at, read_at (null). Lock it in SCHEMA.md and add a DECISIONS entry in the same commit.

**Decisions made.** (1) APPROACHING_TURN is in, because it is cheap: the staff client already holds the waiting list (`useOfficeTickets`),
so the `user_id` of the ticket N places behind is known without a read, and the cost is +1 write with no rules lookup. N = 3 (a constant in
`RULES`). (2) Office cancel writes one QUEUE_CANCELLED notification per ticket, inside the same small groups of 3 (shape-only rules add no
lookups, so the group size stays 3). (3) Build in two stages; stage B starts only when stage A works on the device. (4) Staff notifications
(`MOCK_STAFF_NOTIFICATIONS`) wait for 6.3.

**Stage A, core triggers (the writer is the actor).**
- YOUR_TURN: staff call / override (write in the call transaction, `ticketing/service.js` ~166).
- NO_SHOW: staff no-show (~255).
- WARNING (first strike, "one more offense results in a ban", R-26) and the ban notice (second offense, 24 hours): written with the
  offense in the same transaction (the penalties code in `service.js` ~50-65 builds the offense and the user update).
- OFFENSE_REVOKED: staff revoke (`penalties/service.js`).

**Stage B, extended triggers (only after stage A works).**
- QUEUE_CONFIRMED: the student on join (~117), for themselves.
- APPROACHING_TURN: staff call also notifies the waiting ticket N=3 behind the called one (skip if there is none; the call function takes
  the waiting list or that ticket's `user_id`/id as an argument).
- QUEUE_CANCELLED: office cancel (~336, ~362), one per cancelled ticket, same groups of 3.
- Not in this slice: SERVICE_COMPLETED unless trivial, GLOBAL_ANNOUNCEMENT (needs the `announcements` collection).

**Mechanism (write).** Pure `buildNotification(type, context)` in `packages/backend/src/notifications/` (title and message per type, unit
tested), plus `notify(tx, db, uid, fields)` that does `tx.set` on a new auto-id ref under `users/{uid}/notifications`. A user's
notification doc needs `created_at == request.time`.

**Rules.** `match /users/{uid}/notifications/{id}`: create by staff for any student (`isStaff()`), or by the owner for QUEUE_CONFIRMED
only; field set fixed with `hasOnly`; `created_at == request.time`; `is_read == false`; shape and time checks only, NO lookups (the
~20 limit; the staff doc reads are shared with the ticket rule). Update by the owner only, changing only `is_read` (to true) and
`read_at` (= `request.time`). Read by the owner only. No delete. The developer deploys:
`firebase deploy --only firestore:rules --project qampus-d0718`.

**Mechanism (read).** Listener in `QueueDataProvider` (the mobile app's single set of listeners): `watchMyNotifications(db, uid)` ->
`orderBy('created_at','desc')` with a `limit(50)`; single-field order needs no composite index. `useNotifications` returns the real list
and `markRead(id)` (and `markAllRead`) writing `is_read` / `read_at`; `notifications.jsx` stops using the local `readIds`; the unread count
for the Home bell is `notifications.filter(n => !n.is_read).length`. The "your turn" row still opens `CalledModal` as today.

**Phases (stage commits are optional; the developer confirms before any commit).**
1. Builders and rules: `buildNotification` + tests, the `notifications` rule, developer deploys rules.
2. Stage A writes (YOUR_TURN, NO_SHOW, WARNING/ban, OFFENSE_REVOKED).
3. Read side: `watchMyNotifications`, real `useNotifications`, `markRead`, badge; delete `MOCK_NOTIFICATIONS`. Developer tests stage A.
4. Stage B writes (QUEUE_CONFIRMED, APPROACHING_TURN, QUEUE_CANCELLED per ticket). Developer tests stage B.
5. Checks (`npm test`, lint both apps, builds), docs (SCHEMA lock, DECISIONS, STATUS), one commit after the developer confirms.

**Push is a separate follow-up** (R-25: only "your turn" is pushed, respects `push_enabled`). It needs `expo-notifications` (native, new
dev build), the device token on `users.push_token`, and something to send it. Options to decide with the developer: the staff client
sends through Expo's push API using the student's token (staff may `get` the profile; check browser CORS), or a small relay. Do not start
push without that decision. In-app notifications must work without it.

**Tests.** Unit: message builders. Manual (phone): each trigger yields exactly one notification, in the right mailbox; unread count
drops when one is opened; a refused rule (wrong type from a student) fails. Stage B: cancel an office queue with 4+ tickets and check
that every student gets one.

### 6.3 Capacity cutoff and wait times, PRD R-17, R-18, R-19 (DECIDED with the developer 2026-10-25; follow this plan; after 6.2)
Goal: joining is refused when `(minutes until close) / (average service minutes) < waiting + 1`; staff can override (logged); the wait
estimate uses a measured average; staff see the cutoff banner (UI exists: `HeaderStrip`, `InlineBanner`, modal WM07; `QueueProvider`
currently pins `cutoff_overridden: true` and `cutoff_at: null`).

**Decisions made.** (1) Client-side enforcement only, no rules change: a hand-made client could join past the cutoff; accepted for the
prototype, record in DECISIONS (R-30 prefers server enforcement). (2) Average = today only: `service_seconds_total / completed_count / 60`
from today's queue doc, else the office `default_service_minutes` (the PRD says today and yesterday; record the simplification).
(3) Campus time stays the fixed UTC+8 constant (`campusDate` and `todayHours` in `packages/core/src/format.js`). (4) Seeded hours are fixed
by the developer in the console (the agent has no admin credentials and cannot write Firestore documents; see 6.7).

**Data already stored.** `queues.completed_count`, `service_seconds_total`, `cutoff_overridden`; office `hours` and
`default_service_minutes`. No schema change, so no rules deploy and no index.

**Mechanism.**
- Pure `cutoffState({ office, queue, now })` in `packages/backend/src/ticketing/derive.js`. It returns `{ closesInMinutes, avgMinutes,
  waiting, canJoin, cutoffAt, reason, nextOpen }`. Steps: today's `{ open_min, close_min }` via `todayHours` (null = closed today);
  minutes until close = `close_min` minus the campus minute of `now` (never below 0); `avgMinutes` as in decision 2; `waiting =
  last_seq - last_called_seq` (the existing approximation); `canJoin` when `closesInMinutes / avgMinutes >= waiting + 1`, or the queue's
  `cutoff_overridden` is true; `cutoffAt` = `close_min` minus `(waiting + 1) * avgMinutes` as a clock time (for the staff banner);
  `nextOpen` = the next day in `hours` with an entry ("closes at 17:00, next opens Mon 08:00"). Unit tests: boundary equal / one short,
  closed today, before opening, after closing, override on, no completions yet (default average), weekend rolls to Monday.
- Join side: add the check to the join preflight (`preflight.js`, a new `TicketingError.PAST_CUTOFF` with its message); the mobile
  Join button reads the same function for its disabled reason; the wait estimate in `toTicketView` / `toOfficeView` uses `avgMinutes`
  instead of `default_service_minutes`. Hours are no longer display only for joining, but the queue still has to be OPEN first.
- Staff side: remove the `QueueProvider` pins; `cutoff_at` and the banner come from `cutoffState`. "Override cutoff" is one update of the
  queue doc setting `cutoff_overridden` true. The queue rules must already allow staff to update that field (check the `queues` update
  rule; if it does not, a rules change is needed: say so and ask before editing). Log it as `CUTOFF_OVERRIDE` through the 6.1 `logEvent`
  with the staff `actor`. The override resets with each campus day (new queue doc).
- Staff "cutoff approaching" notification (`MOCK_STAFF_NOTIFICATIONS`): a derived banner/notification from `cutoffState` on the staff
  client when `canJoin` flips to false (no stored doc), or keep the mock text until announcements exist. Prefer the derived version.

**Phases.**
1. `cutoffState` + unit tests (`npm test`).
2. Join side: preflight error, Join button reason, wait estimate from the measured average.
3. Staff side: real banner and cutoff time, real Override with the event, delete the pins and the mock override reducer path.
4. Developer fixes the seeded hours (6.7) and tests: set `close_min` a few minutes ahead of now to watch the cutoff trigger, join until it
   refuses, override from staff, and complete some tickets to see the measured average change the estimate.
5. Docs (DECISIONS entry with the three simplifications, STATUS), one commit after the developer confirms.

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
2. Run `npm test` in `packages/backend` (expect 44 passing).
3. Ask the developer which slice to start (recommended order: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6; 6.7 whenever convenient) and answer the
   "Decision for the developer" questions of that slice before writing code.
