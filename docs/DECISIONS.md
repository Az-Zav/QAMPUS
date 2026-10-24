# Decisions

Append-only. One entry per decision: what, why, consequence. Never edit an old entry; add a new one that supersedes it.

## 2026-10-22 Backend is Firebase, not Express/Postgres
PRD v1.3 chose Firebase (Auth, Firestore). `KnowledgeBase/QAMPUS_Technical Design Document.md` (v2.0) is superseded in full; keep it for its ideas (ERD, rules R-40, R-46), not its deployment.

## 2026-10-22 Google sign-in via the native library + Firebase JS SDK
`@react-native-google-signin/google-signin` yields an ID token, then `signInWithCredential`. Needs a development build (not Expo Go). Staff sign-in will use the same provider.

## 2026-10-22 EAS development build; JS changes ship over the air
Rebuild only for native changes (new native package, `app.json` plugins, `google-services.json`). JS-only changes use `eas update`. `expo-updates` uses `runtimeVersion: appVersion`.

## 2026-10-23 Firebase Spark plan only, no Cloud Functions
Cost. The backend is Firestore Security Rules plus a shared client service layer. Consequences: no server-side transactions or queries beyond the client SDK; at most 20 document lookups per rule evaluation; no push sender (open question); daily quotas 50k reads / 20k writes.

## 2026-10-23 Trust model
Student and guest clients are treated as hostile; rules enforce state transitions, ownership and the 60 s grace window using `request.time`. Assigned staff are trusted but fenced to their office.

## 2026-10-24 Backend code is modular by feature, inside the repo
Features: `identity`, `offices`, `ticketing`; later `penalties`, `notifications`, `display`. Each has `service` / `data` / `preflight` (pure checks). Service functions take `db` as the first argument so mobile and staff each inject their own. Planned home: `packages/backend` (not created yet). Apps keep their hooks as thin adapters.

## 2026-10-24 Ticketing slice 1 scope
Join, call next, verify arrival, complete, cancel (WAITING only), no-show. Deferred: offenses and bans, three-ticket limit, capacity cutoff, override, ID verification, guests, notifications and push, display, queue close, activity log.

## 2026-10-24 Slice 1 data model
`users/{uid}`, `offices/{id}`, `staff/{email}`, `queues/{officeId}_{yyyymmdd}` (`last_seq`, `last_called_seq`, `current_ticket_id`), `tickets/{queueId}_{seq}`. Ticket IDs are create-only so a sequence number cannot repeat. Office codes live in a locked `officeCodes/{id}` doc that only rules can read. All timestamps must equal `request.time`.

## 2026-10-24 Staff sign-in: Google popup on web + `staff/{email}` doc
The doc (seeded by hand in the console) holds `office_id`; missing doc means the Not Assigned screen.

## 2026-10-24 Test on the real Firebase project; no emulator for now
A few test accounts stay far below the Spark quotas. Add the emulator later, only for automated rules tests, once several rules exist.

## 2026-10-24 Replace mock data per feature, not all at once
Each hook is swapped for the real one as its feature lands; `mock.js` is deleted last.

## 2026-10-24 Project docs live in `docs/` and are updated every session
`STATUS.md` is overwritten; `DECISIONS.md` is append-only. `AGENTS.md` tells every session to read and update them.
