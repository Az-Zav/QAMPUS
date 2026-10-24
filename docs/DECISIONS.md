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

## 2026-10-24 Final slice-1 data model (supersedes "Slice 1 data model" above)
Reconciled against the mock shapes and what the view mappers read. Field names follow the mock/TDD (`daily_sequence`, `short_name`, snake_case). Times are Firestore timestamps and must equal `request.time` on write.

```text
users/{uid}                     role STUDENT|GUEST, name, email, institutional_id, program, guest_type,
                                push_enabled, push_token, strike_count, banned_until, active_count, created_at
offices/{officeId}              code, name, short_name, location, counter_label ("Window 2"), status ACTIVE|INACTIVE,
                                default_service_minutes, utc_offset_minutes,
                                hours { MON..SUN: { open_min, close_min } }  (minutes since local midnight; missing day = closed)
officeCodes/{officeId}          qr_code (= office code, what the QR encodes), manual_code (6 digits). Locked: only rules read it
staff/{email-lowercase}         office_id, role STAFF|SUPER_ADMIN, name ("N. Reyes"), full_name
queues/{officeId}_{yyyymmdd}    office_id, queue_date (int yyyymmdd), status, last_seq, last_called_seq,
                                current_ticket_id, current_ticket_number (short, for "Now serving"), created_at, updated_at
tickets/{queueId}_{seq}         queue_id, office_id, office_code, office_name, queue_date, user_id,
                                holder_name, holder_institutional_id, holder_role,        (snapshot so staff never read users/)
                                daily_sequence, ticket_number (CODE-MM-DD-SEQ), short_ticket_number (CODE-SEQ),
                                status, cancelled_by USER|OFFICE|SYSTEM,
                                joined_at, called_at, service_started_at, completed_at, cancelled_at, no_show_at
```

- **Not stored, derived on the client:** position, `ahead_count`, estimated wait, waiting count. Waiting is approximated as `last_seq - last_called_seq` (cancel gaps overcount slightly); an exact counter comes later if needed. Estimated wait = waiting x `default_service_minutes` until a measured average exists.
- **Manual code** is the static 6-digit check-in code printed beside the office QR. It is the fallback when the camera fails (R-21) and is checked the same way as a scan: verification accepts either the QR payload (`qr_code`) or `manual_code`. Static by design (PRD R-20); it proves possession of the code, not presence (known limitation 9). Kept in `officeCodes` so the app cannot read it from Firestore.
- **Hours** are a per-day map in minutes (not the mock's single `operating_hours` object) so rules can compare against local time computed from `utc_offset_minutes`. UI formats them for display.
- **Queue open/close:** in slice 1 the queue doc is created `OPEN` by the first join of the day, and only when now is inside today's hours. Manual open/close is a later slice.
- **Staff office list:** each office's "now serving / waiting / wait" comes from its own queue doc, so the offices screen listens to one queue doc per office. No queue doc today means "open if inside hours, nobody waiting".
- **Programs list** stays hardcoded in app constants for now.
- **Reserved shapes, not written in slice 1:**
  - `users/{uid}/notifications/{id}`: type, title, message, ticket_id, office_id, is_read, created_at, read_at
  - `offenses/{id}`: user_id, ticket_id, office_name, ticket_number, type, resulted_in_ban, revoked_by_user_id, revoked_at, created_at
  - `events/{id}`: entity_type, entity_id, action, from_status, to_status, actor_uid, actor_name, reason, ticket_number, office_id, created_at
- **Known gaps accepted for slice 1:** no limit on active tickets per user or office; tickets from earlier days that were never closed still exist, so Home shows only active tickets whose `queue_date` is today; the existing client-side `users` create must be locked down by rules (role `STUDENT`, `strike_count` 0, `banned_until` null, `active_count` 0).
- **UI mapper changes this implies:** `toOfficeView` reads today's entry of `hours` and the office's queue doc instead of `office.queue`; `toTicketView` takes the counter label from the office and computes position/ahead/wait from the queue doc.

## 2026-10-24 Check-in code lives on the office doc; no `officeCodes` collection
One 6-digit `check_in_code` on `offices/{id}` serves both the QR and manual entry. The QR is posted publicly and a photo can be shared, so hiding the code from the app only stops the laziest remote check-in; staff no-show (including `IN_SERVICE → NO_SHOW`, R-23a) covers abuse. Saves a collection, a seed doc and a rules lookup. Supersedes the `officeCodes` parts of the earlier data-model entries. A rolling QR (rejected in PRD R-20) would need its own doc for the rotating secret.

## 2026-10-24 Schema locked: users, institutionalIds, offices, staff, queues, tickets
Field sets in `docs/SCHEMA.md` are fixed per collection. Locking is about the shape only; seeding and implementation stay per slice (ticketing slice 1 uses `users`, `offices`, `staff`, `queues`, `tickets`; `institutionalIds` comes with profiles and guests). A locked collection changes only through a new entry here.
- `offices` keeps `short_name` (the UI uses it heavily) and `check_in_code`; no `counter_label`, no timezone field (campus constant UTC+8).
- `tickets` keeps both `user_id` (the uid, used by rules and student queries) and the `holder_*` snapshot (staff cannot read other users' profiles, and rules cannot query for the ticket's owner). One timestamp per status. No push token and no offense fields.
- Still draft: `offenses` (decide fold-into-tickets vs separate before slice 2), `events`, `notifications`, `announcements`.

## 2026-10-24 Offenses stay a separate collection (locked)
Not folded into `tickets`. An offense is a record with its own lifecycle (revoke, Bans & Warnings list, staff offenses screen), matches the PRD's "OFFENSE is the penalty record" (R-26), and keeps offense fields out of the ticket doc the student owns, so the ticket rules stay simple. Implemented in slice 2. `tickets` stays as locked, with no offense fields.

