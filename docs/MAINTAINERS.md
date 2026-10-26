# Maintainers' guide

What someone taking over the project needs: how we work, how to run and reset things, the traps we already fell into, where the
project stands, and the decisions that still bind. How the system is built is in `ARCHITECTURE.md`; the product spec is
`KnowledgeBase/QAMPUS_PRD.md`.

_Last updated: 2026-10-26. Keep this file current: overwrite the status sections when things change, and add a row to the decisions
table when a decision is made (section 7)._

## 1. How we work

- **One slice at a time.** Build it, run the checks, hand over a test list, the developer tests on a phone and a browser, then
  commit and push (one commit per slice). Do not commit or push before the developer says it works.
- **Commit messages carry no `Co-Authored-By` line and no mention of an AI assistant or session.** The author is the developer's
  own git identity.
- **Prototype level.** Make it work and keep the code small. Where rules cannot see why a field moved, the weakness is accepted and
  recorded (section 5), not engineered away.
- **Explain before big changes.** For anything that changes the data model, rewrites a working flow or adds a collection, say what
  and why first and wait for a yes.
- **The data model changes only through a decision.** Add a row to section 7 and update the data model in `ARCHITECTURE.md` in the
  same commit.
- **Docs move with the code.** Update this file and `ARCHITECTURE.md` in the commit that changes what they describe. Never put
  secrets in `docs/`.
- **Rules are deployed by the developer,** not by an agent. `firestore.rules` is the only source of truth and a deploy replaces the
  whole ruleset.
- **Expo changes between releases.** Before touching an Expo, EAS or React Native API, read the `expo` major version in
  `package.json` and the matching docs at `https://docs.expo.dev/versions/v<major>.0.0/` (see `AGENTS.md`).
- **Before declaring a task done:** `npm run lint`, `npx tsc --noEmit` where applicable, and `npm test` in `packages/backend`.

## 2. Environment

- Two terminals: `npm run staff` (web, port 8081) and, from `apps/mobile`, `npx expo start --dev-client --tunnel --port 8082`
  (phone: the Expo development build; JavaScript changes reload, only native changes need a rebuild).
- Firebase project `qampus-d0718` (pinned by `.firebaserc`). The dev build, the staff console and the tests all use this one real
  project; there is no separate dev project and no emulator.
- Accounts: staff sign in with an email that has a `staff/{email}` document; students use the school `@tip.edu.ph` account.
  Offices, staff documents and each office's `check_in_code` and `hours` are **seeded by hand** in the Firebase console.
- Firebase CLI deploy commands are in `ARCHITECTURE.md` section 12. The relay is deployed with `npm run deploy` in `relay/` (its
  address is in the staff `.env` as `EXPO_PUBLIC_PUSH_RELAY_URL`).
- **Checks an agent can run:** `npm test` in `packages/backend` and in `relay`, `npx expo lint` in each app, and
  `npx expo export --platform web` (staff) or `--platform android` (mobile) as build checks. Rules cannot be tested without the
  emulator, so the developer's test is the check.
- **Test data reset** (after a data-model change, or when counters drift): delete the documents in `tickets` and `offenses` and
  today's `queues/<officeId>_<yyyymmdd>`; on each test student's `users` document set `active_count` 0, `strike_count` 0,
  `banned_until` null (a real null, not an empty string) and clear `active_offices`.
- **Native changes** (a new native package, `app.json` plugins, `google-services.json`) need a new development build:
  `eas build --profile development --platform android` from `apps/mobile`. Never publish an update to the `development` channel
  before the matching build is installed.

## 3. Lessons that cost time once

1. Rules allow about 20 document lookups per multi-document write; each extra document a write touches costs lookups. Office
   cancel therefore runs in groups of three.
2. When a rule compares another document's state with `getAfter()`, the client must write the exact number, not `increment()` (the
   join writes `active_count: n + 1`). `increment()` is fine when the rule reads the same document's `request.resource`.
3. Rules cannot query. Anything like "does the student already have a ticket here" must live at a known path
   (`users.active_offices`).
4. Staff can `get` one student profile (never list). They cannot read other users' notifications or tickets outside their office.
5. Edit the console with real types: a cleared field is not `null`; a missing `active_count` reads as 0 in rules and code.
6. The staff `office` from `useOffice()` is a display view: its `hours` is text ("09:00–09:50"); the stored per-day map is
   `hoursByDay`. Anything that needs real hours (the cutoff) must use that. The mobile `board.offices` are raw records.
7. A screen can stay mounted behind another in the stack: effects with side effects (marking notifications read) must run on focus
   (`useFocusEffect`), not on mount. In transactions, all reads come before any write.
8. The mobile app runs the React Compiler (`experiments.reactCompiler`). A value that is null until a hook answers
   (`useCameraPermissions`) must be read with `?.` everywhere, even inside event handlers.
9. The dev client shows a dev-only warning, "Can't perform a React state update on a component that hasn't mounted yet"
   (expo-router `ContextNavigator`). Not traced; to bisect, remove `QueueDataProvider` from `apps/mobile/src/app/_layout.jsx`.
10. Repo files may be CRLF on disk (git normalizes). Edit them with an editor tool, not a shell heredoc; backticks and `$` break
    heredocs.

## 4. Where the project stands

### Built (all tested on a phone and in a browser unless noted)

- Sign-in: school Google account (students), anonymous guests with a unique Guest ID, staff Google popup with the `staff/{email}`
  gate.
- The whole ticket loop on Firestore: open and close queue, join, call next, override, verify arrival (office code, QR scan, or
  staff ID check), complete, no-show, student cancel, office cancels the queue.
- Limits and penalties: three active tickets, one per office, offenses, strikes, 24-hour ban, staff revoke with a reason.
- Activity log (`events`), in-app notifications, capacity cutoff with staff override and measured wait times, public display
  (queue numbers and check-in QR), push "your turn" through the relay.
- Biometric unlock, light and dark theme, onboarding and theme remembered across restarts, Terms and Privacy text for students and
  staff (a draft for the school's data protection officer to review), thumb-friendly sizes, and the staff console hosted on Firebase
  Hosting (`https://qampus-staff.web.app`).
- Nothing in either app is mock data any more; the program list is the school's catalogue in `core/src/programs.js`.

### Awaiting the developer's test

- Single-reason dialogs: only Cancel entire queue and Revoke offense ask for a reason (one radio choice plus "Other"). Override
  and No-show are plain confirmations; a verified (IN_SERVICE) no-show stores a fixed reason because the rules require one.
- Terms and Privacy screens on the phone.
- Narrow-width staff console (top bar, wrapping rows, stacked filters) and the Scan screen's computed layout.

### Next

1. Responsiveness second pass (`PLAN_RESPONSIVENESS.md`): the mobile Login and Onboarding need a scroll view and a hero sized from
   the screen height; a font-scale cap in the shared text and button components; a visual review with the developer.
2. Preview deployment for end-to-end testing: an EAS preview build for the app. The hosted staff address is already in the relay's
   `ALLOWED_ORIGINS`.
3. A small item: backfill claims for student IDs saved before guests were built (see known issues).
4. Not built: staff announcements (no `announcements` collection yet), and a super administrator role (the database owner acts
   through the console).

## 5. Known issues and accepted limits

- **Client-side only enforcement:** the capacity cutoff (a hand-made client could join past it); the ticket counters
  (`active_count`, `active_offices`) and the activity log can be falsified by a hand-made client, because rules cannot see why a
  field moved. An office with no hours for today has no cutoff.
- **The repository is public.** It holds only public client configuration: Firebase web and Android API keys and OAuth client ids
  (`.env` files and `apps/mobile/google-services.json` are committed on purpose). A review of the tree and the full history found no
  private key, service account or token. Because anonymous sign-in is on, anyone with the public key can create guest accounts and
  call Firestore as a signed-in user, so the rules are the real protection. Residual risks: a stranger can create unlimited guest
  accounts and fill a queue; any signed-in user can read `offices` (including the check-in code), probe whether a 7-digit student ID
  is registered, and write false lines into an office's activity log; Spark quotas could be used up. **Console steps for the
  developer (not code):** restrict the Android API key to the package `com.qampus.app` and its SHA-1 and the web key to the
  Firebase APIs and the staff site's addresses; turn on Firebase App Check and enforce it for Firestore and Authentication; keep
  Authentication's authorized domains to the real ones; never commit the FCM service-account JSON (keep it in EAS only).
- Any Google account that signs in on the staff app leaves an empty Firebase Auth user with no Firestore access. Accepted (blocking
  it needs Cloud Functions).
- Students who saved a student ID before guests were built have no `institutionalIds` claim, so their ID is not reserved. Accepted.
- Push is Android only, and delivery receipts are not processed, so a dead token fails silently. The relay only accepts the staff
  origins listed in `relay/wrangler.jsonc`.
- A wait estimate counts a cancelled ticket until the line has been called past it, and an out-of-order call can overcount people
  ahead.
- The measured visit length uses today only (the PRD says today and yesterday).
- Records are kept indefinitely; there is no account deletion in the app.

## 6. Open questions

- A separate development Firebase project, or keep using the real one?
- Is the student ID editable in Profile? The PRD's rule R-01 says locked, its definition of done #22 says editable; today it is locked.
- A support or data-protection contact address for Help & Support and the legal text. The privacy policy also needs a retention
  period, a way to delete an account, a recorded consent (a version and time on the user record, which is a schema change) and a note
  on minors. The school's data protection officer should read it before a public release.

## 7. Decisions that still bind

Each row is a decision still in force with its reason. Superseded decisions are not listed; git history has them
(`git log -- docs/DECISIONS.md`). When you decide something new, add a row here.

| Date | Decision | Reason |
|---|---|---|
| 2026-10-22 | Backend is Firebase (Auth and Firestore), not Express/Postgres. The Technical Design Document is superseded. | The PRD chose Firebase; no server to run. |
| 2026-10-22 | Google sign-in through the native library, then Firebase `signInWithCredential`. | Yields the ID token Firebase needs; requires a development build. |
| 2026-10-22 | EAS development build; JavaScript-only changes ship over the air. | Rebuild only for native changes. `expo-updates` uses `runtimeVersion: appVersion`. |
| 2026-10-23 | Firebase Spark plan only, no Cloud Functions. | Cost (no billing card). Consequence: rules plus a shared client layer are the backend; at most about 20 document lookups per rule evaluation; daily quotas of 50k reads and 20k writes. |
| 2026-10-23 | Trust model: student and guest clients are hostile; assigned staff are trusted but fenced to their office. | Rules enforce state transitions, ownership and the grace window with `request.time`. |
| 2026-10-24 | Test on the real Firebase project; no emulator. | A few test accounts stay far below the quotas. Add the emulator only if automated rules tests are wanted. |
| 2026-10-24 | `packages/backend` is the one shared Firestore layer; every function takes `db` first; pure files are separate from Firestore files. | One copy for two apps on different platforms; pure logic runs under plain Node and is unit tested. |
| 2026-10-24 | Staff access is the `staff/{email}` document, not the email domain. | Lets a personal Gmail be seeded as staff for testing; the document is the whole gate, so seed only trusted emails. |
| 2026-10-24 | Empty Firebase Auth users from unmatched staff logins are accepted. | Blocking creation needs Identity Platform and Cloud Functions. |
| 2026-10-24 | Firestore rules are deployed from the repo, never edited in the console. | A deploy replaces the whole ruleset; `.firebaserc` pins the project. |
| 2026-10-24 | The check-in code lives on the office document (`check_in_code`); no separate codes collection. | The QR is posted publicly, so hiding the code from the app adds little; staff no-show covers abuse. Saves a collection and a rules lookup. |
| 2026-10-24 | Staff open the queue manually; students never create queue documents; office hours are display only, not a join gate. | A scheduled open does nothing when no one is at the counter; keeps rules free of timezone math for students. |
| 2026-10-24 | Derived ticket values (position, wait, waiting count, short number) are not stored. | Avoids write amplification and drift; the approximation is accepted. |
| 2026-10-24 | Tickets keep both `user_id` and a holder snapshot; one timestamp per status; no offense fields on tickets. | Staff cannot read other profiles and rules cannot query for an owner. |
| 2026-10-24 | A student may cancel a WAITING (free) or CALLED ticket (an offense), not an IN_SERVICE one. | The PRD allows cancelling a called ticket, expired or not. |
| 2026-10-24 | Three-ticket limit is a counter on the student (`users.active_count`); one ticket per office is a map (`users.active_offices`). | Rules cannot count or query. A stricter tamper-proof version was built and dropped as too much code for this stage. |
| 2026-10-24 | Offenses are a separate collection, `offenses/{ticketId}`, created in the same transaction as the change that causes them. | Own lifecycle (revoke, lists) and keeps penalty fields off the student-owned ticket; one id per ticket gives at most one offense. |
| 2026-10-24 | Penalties: first offense a strike; second resets strikes and sets a 24-hour ban; ban blocks joining only; office and system cancellations record nothing. The ban end is written by the app and rules accept it within half an hour of `request.time + 24 h`. | Rules cannot add 24 hours to server time inside a write. |
| 2026-10-24 | Staff may `get` one student profile, never list. | Recording an offense needs the current strike count. |
| 2026-10-25 | Activity log is a stored `events` collection written inside each action's transaction, 50 per page, with two composite indexes. | Tickets keep no staff actor and no queue-level actions. Weakness accepted: a hand-made client could write a false line. |
| 2026-10-25 | In-app notifications are a mailbox written with the change that causes them; read by viewing the screen; a banner announces new ones while the app is open. | One more write in an existing transaction; no server needed. |
| 2026-10-25 | Capacity cutoff and measured wait times are client side only; the measured average needs 3 completed visits and has a one-minute floor. | Keeps rules simple; early quick test visits had set the cutoff to closing time. |
| 2026-10-25 | Guests are anonymous Firebase accounts bound to the device; their Guest ID (`G` + six digits) is generated in the app and reserved in `institutionalIds`; the account is made on the form's Continue, and removed if anything fails. | No server on Spark; uniqueness is enforced by the rules. Departs from the PRD's "server issues the ID". |
| 2026-10-25 | Student IDs are reserved the same way (7 digits); the student ID is locked after it is first saved. | Uniqueness; PRD rule R-01. |
| 2026-10-25 | The public display is opened from the staff console as a new tab, reuses the browser session or signs in anonymously, and shows numbers only. | Existing rules already let any signed-in user read offices and queues and keep tickets private, so no rules change. |
| 2026-10-25 | Push goes through a Cloudflare Worker relay, not Cloud Functions; it stores no secret and sends one fixed message. | Cloud Functions need the Blaze plan. See `ARCHITECTURE.md` section 8. |
| 2026-10-25 | The check-in QR format lives in one place (`ticketing/checkin.js`); scanning and typing use the same validation. | The display and the phone cannot drift apart. |
| 2026-10-25 | Biometric unlock is a per-device, per-account preference (AsyncStorage, default off) that only unlocks an existing session. | It gates the screen, not the Firebase session; good enough for the prototype. |
| 2026-10-25 | Legal text is shared from `@qampus/core/legal`; staff have their own Terms of Use; each document's "Last updated" date is set by hand and checked by lint. | One wording for both apps; the date should say when users got a version, so typo fixes must not move it. |
| 2026-10-25 | Every tappable thing on the phone is at least 48 dp with 8 dp between neighbours (`TOUCH` in `constants/theme.js`). | Material and Android guidance; "thumb zone" diagrams are only a heuristic, so nothing was moved. |
| 2026-10-25 | One program catalogue (26 programs in 5 colleges) in `core/src/programs.js`; the college is looked up, not stored. | Sign-up and Edit Profile cannot disagree. |
| 2026-10-26 | Reasons are asked only for Cancel entire queue and Revoke offense (one radio choice plus "Other"); Override sends no reason; a verified no-show stores a fixed reason. | The rules and `checkNoShow` require a reason for a verified no-show, so the rules were not weakened. |
| 2026-10-26 | Scan screen layout is computed from height, insets and font scale (capped at 1.3x); no sheet behind the nav bar. | Fixed offsets overlapped on short or zoomed phones. |
| 2026-10-26 | Staff console works down to 360 px: three top-bar layouts, two rows below 700 px. | A collapsing menu would hide the tabs. |
| 2026-10-26 | Staff console is hosted on Firebase Hosting site `qampus-staff`; the relay lists its addresses in `ALLOWED_ORIGINS`. | Single-page rewrite so `/display` and `/legal` links work. |
