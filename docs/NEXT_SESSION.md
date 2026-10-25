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
2. **6.6 Guests / anonymous sign-in**: DONE and pushed.
3. **6.4 Public display**: built, awaiting the developer's test.
4. **Slices that need a new native package, batched into ONE dev build** (so only one rebuild): QR scan with `expo-camera`,
   biometric unlock with `expo-local-authentication`, and `expo-notifications` for push (its JS waits for the relay). Plan LOCKED in 6.5.
5. **UI polish**: improve spacing of components on the screens, responsiveness (phone sizes and the staff web at different widths),
   and remove the dev preview states (`// DEV-PREVIEW` markers, `usePreview`, `src/dev/previews.jsx`, `playground.jsx`).
6. **Deploy as a preview for end-to-end testing** (EAS preview build/update for the apps, and a hosted preview of the staff web;
   decide the hosting when reached). Also decide then whether to use a separate dev Firebase project.

### 6.7 Small issues (DONE 2026-10-25, tested and pushed; the optional cutoff tweak was left out on purpose)
- Edit Profile: `useSession().updateProfile` saves a student's program (`saveStudentProgram`); the student ID is locked (R-01, and the
  rules already refuse a change once it is set). A guest's edit changes memory only until 6.6.
- A refused staff action shows a red banner on every console screen (`ActionNotice` in `ConsolePage`, text in `ACTION_ERROR_COPY`,
  state `notice` in `QueueProvider`), auto-dismissed after 8 seconds.
- The stray root `app.json` (a different EAS project and owner than `apps/mobile/app.json`) was removed and the root `README.md`
  rewritten. Root `eas.json` was left alone (looks like a leftover too; decide with the developer).
- Still open for later: the `ui-mock-final` tag (a pushed tag is outward-facing: ask first) and the separate dev Firebase project
  question (decide at the preview deployment step).

### 6.6 Guests (DONE 2026-10-25, tested and pushed; reasons in DECISIONS.md)
Anonymous sign-in on the device, a guest form that issues a unique `G` + six digits, `institutionalIds/{id}` claims (`{ uid }`,
create-only) for guest and student IDs (a taken student ID is refused), guests use the app like students, guest sign-out warns that the
identity is lost, `packages/backend/src/identity`. Students with an ID saved before 6.6 have no claim (not backfilled).

### 6.4 Public display (D01), PRD R-20, R-21 (DONE 2026-10-25, tested and pushed)
The staff Queue screen's strip has a **Launch public display** button: `window.open('/display/{office code}', '_blank')`. The display
(`apps/staff/src/app/display/[code].jsx`, designed on a 1920x1080 canvas and scaled) shows Now Serving, the next three numbers, the
office QR (`checkInPayload`: `qampus://check-in/{code}/{check_in_code}`), the manual code, and "This queue is closed" with the next
opening. Data: `watchOfficeByCode` (offices where code == X) and `watchQueue`, shaped by the pure `displayState` (unit tested):
now serving is the queue's current ticket (its number is the last segment of `current_ticket_id`), next is the numbers after
`max(last_called_seq, current)` up to `last_seq`. Accepted imprecision: cancelled numbers can appear and a ticket called out of order
is skipped past. Session: `usePublicSession` reuses the browser's session (a tab opened from the console is the staff session) and
signs in anonymously only when there is none (the counter's TV; needs the Anonymous provider, already enabled for guests); the staff
`SessionProvider` ignores anonymous accounts. No rules change (offices and queues are readable by any signed-in user; tickets stay
private). A listener error shows the Outage screen. `MOCK_OFFICES` and the `?outage=1` dev aid are gone. No fullscreen button (use F11).

### 6.5 The native-package batch (PLAN LOCKED 2026-10-25 for QR scan and biometric; push is blocked, see below)
Strategy: install all three packages (`npx expo install expo-camera expo-local-authentication expo-notifications` in `apps/mobile`)
and add their plugins in ONE change, so ONE rebuild (`eas build --profile development --platform android`, run by the developer)
covers the camera, biometric and the future push JS. After the packages are installed the OLD dev client cannot run this branch
(missing native module), so test only on the new APK, and never `eas update` to the `development` channel before it is installed.
Build the QR scan and biometric now; push JS follows later as an over-the-air update once its blockers are cleared.

**A. QR scan on the Scan tab (`expo-camera`; R-20, R-21, R-31). Decisions: a QR of another office gets its own message; an invalid
scan does NOT log an `INVALID_SCAN` event (skipped).**
- The display QR encodes `qampus://check-in/{officeCode}/{check_in_code}`. A shared pure pair in `@qampus/backend` (new
  `ticketing/checkin.js`): `checkInPayload(office)` (moved from the staff utils, which then imports it) and
  `parseCheckInPayload(data)` -> `{ officeCode, code }` or null (wrong scheme or host, not 6 digits, extra segments). Unit tested.
- Scan screen: `CameraView` (`facing="back"`, `barcodeScannerSettings={{ barcodeTypes: ['qr'] }}`, `onBarcodeScanned`) inside the
  existing corner frame. It is mounted only while the tab is focused (`useIsFocused`) and no dialog is open (one preview at a time).
  `onBarcodeScanned` fires repeatedly, so a ref locks after the first valid read until the result dialog closes. The digits go to the
  same `useCheckIn().checkIn(code)` as manual entry (identical validation). A parsed `officeCode` different from the called ticket's
  office code shows "This QR is for a different office" (new `TicketingError.WRONG_OFFICE`, checked in the screen/hook before the write).
- Permission states from `useCameraPermissions()`: loading = nothing; not asked = an "Allow camera" button; denied for good
  (`canAskAgain` false) = a message and an "Open settings" button (`Linking.openSettings()`); the manual field is always shown.
- `app.json`: `["expo-camera", { "cameraPermission": "Allow Qampus to use the camera to scan the office QR code and check you in.", "recordAudioAndroid": false }]`.
- Tests (phone, new APK, display on another screen): scan with a called ticket checks in; no called ticket = "no ticket being
  called"; another office's QR or a random QR = the right message; camera denied still allows typing and Open settings works; leaving and
  returning to the tab restarts the camera; a scan after the 60 s grace says expired.

**B. Biometric unlock (`expo-local-authentication`). Decisions: it only UNLOCKS an already signed-in session (it never replaces
sign-in); it applies to students and guests; the switch is the existing "Biometric login" row in Settings (today a disabled, always-on
placeholder reading "Not available in this version"; PRD V1 scope lists Biometric Login).**
- Setting: a per-device preference in AsyncStorage keyed by uid (`qampus.biometric.{uid}`), default OFF; it is not stored in Firestore.
  The toggle is disabled with "Set up a fingerprint or face on this device first" unless `hasHardwareAsync()` and `isEnrolledAsync()`;
  turning it on first requires a successful `authenticateAsync` (proves it works).
- Lock: a `LockScreen` cover in the signed-in layout (`(app)/_layout.jsx`, with an `AppState` listener). It shows on a cold start and
  when the app returns from the background after more than 60 seconds, while the setting is on, until `authenticateAsync({ promptMessage,
  cancelLabel })` succeeds. It has an "Unlock" retry button. The device PIN/pattern fallback stays enabled (`disableDeviceFallback`
  false), so nobody is locked out; no sign-out escape is needed (a guest sign-out would delete their identity). The cover renders until
  the stored preference has been read, so there is no flash of the app.
- Honest limit: this gates the screen only; the Firebase session still sits in AsyncStorage. Good enough for the prototype.
- `app.json`: `"expo-local-authentication"` (iOS `faceIDPermission` text only if iOS is ever built).
- Tests: toggle needs a fingerprint or face; enable then close and reopen = lock appears; fail or cancel stays locked; device PIN
  works; a guest gets it too; sign out and in as another account = that account's own (off) setting; background 10 s = no lock, 90 s = lock.

**C. Push notifications (`expo-notifications`): DECIDED 2026-10-25: option A, a relay on Cloudflare Workers (free); nothing built yet.
Order of work: (1) developer: Phase 1 credentials (service account key uploaded to EAS); (2) the rebuild from the batch; (3) student
app JS (token, channel, settings switch, sign-out clears the token); (4) the relay in `relay/` (repo root, outside the npm
workspaces, `wrangler.jsonc`, tested with `npx wrangler dev` at localhost:8787 before any deploy); (5) staff console calls the relay
after a call commits; (6) developer deploys with `npx wrangler deploy` and puts the URL in the staff `.env`
(`EXPO_PUBLIC_PUSH_RELAY_URL`); (7) test list in the chat history of 2026-10-25 (credential via expo.dev/notifications, relay by curl,
background push, foreground silent, switch off, sign-out). Rejected: Firebase Cloud Functions (Blaze plan, a billing card).**
- Blockers: (1) Spark has no server and Cloud Functions need the Blaze plan; (2) the staff browser cannot call Expo's push API itself
  (verified 2026-10-25: its CORS preflight returns no `Access-Control-Allow-Origin`), so a small RELAY is needed; (3) Android push needs
  the FCM V1 service-account key uploaded to the EAS project (a developer step in the Expo and Firebase consoles); (4) the native module
  must be in the rebuild (covered above); (5) the Settings "Push notifications" switch only changes local state, it does not save
  `users.push_enabled` yet.
- Relay (one HTTPS endpoint, e.g. a Cloudflare Worker, free and no card; or a plain Node script on the developer's PC for a
  prototype test): the staff console POSTs `{ token, ticketId, officeName }` with its Firebase ID token. The relay verifies that ID
  token against Google's public keys, then reads `staff/{email}` over the Firestore REST API with that same ID token (the rules already
  let a user read only their own staff doc), so no admin credentials are stored. If the caller is staff it builds a fixed message
  ("It's your turn at {office}. Check in within 1 minute.", no personal data) and POSTs it to Expo's push API server to server,
  with CORS headers for the staff origin. It sends nothing else.
- Student app: ask permission, create the Android channel first, `getExpoPushTokenAsync({ projectId })`, save `users.push_token`
  (users may update their own doc; staff may `get` it); respect `push_enabled`; `setNotificationHandler` shows nothing in the foreground
  (the in-app banner and dialog already do); a tap opens Notifications.
- Staff app: after the call transaction commits, best effort (a failure never undoes the call), read the student's `push_token` and
  `push_enabled` and call the relay.

## 7. Start of the next session
1. Read the four docs above; confirm `git status` is clean and the branch is `claude/expo-google-signin-d8d7du`.
2. Run `npm test` in `packages/backend` (expect 65 passing, plus any added since).
3. Continue the roadmap in section 6 in order. After 6.7 is committed: plan 6.4 with the developer (the questions listed there), then
   build it; then finalize and plan 6.6 before executing it.
