# Status

Living snapshot. Overwrite sections as things change; keep it under ~60 lines.
Decisions and their reasons live in `DECISIONS.md`. Product spec: `KnowledgeBase/QAMPUS_PRD.md`.

_Last updated: 2026-10-24_
_Schema: `docs/SCHEMA.md` (users, institutionalIds, offices, staff, queues, tickets, offenses locked)._

## Built
- **Mobile Google sign-in** (native `@react-native-google-signin`, school domain only), then Firebase `signInWithCredential`. Student profile in `users/{uid}` (`apps/mobile/src/lib/users.js`).
- **Staff sign-in** (`apps/staff`): Google popup, `staff/{email}` lookup for `office_id`/`role`/`name` (Not Assigned if missing). No domain check; the doc is the gate. `OfficeProvider` holds the real `offices/{office_id}` listener.
- **Rules in the repo**: `firestore.rules` is the source of truth (`firebase.json`, `.firebaserc` pin `qampus-d0718`). Deploy with `firebase deploy --only firestore:rules`; never edit in the console.
- **`packages/backend`** (`@qampus/backend`): shared by both apps. Ticketing ids/derive/preflight (13 unit tests, `npm test`), listeners (`watchBoard`, `watchQueue`, `watchMyTickets`), writes (`openQueue`, `closeQueue`, `joinQueue`).
- **Slice B (student joins) tested on device and staff browser**: staff Open/Close queue is real (today's `queues` doc). Mobile Offices list, Home ticket and My Tickets read Firestore through `QueueDataProvider`; Confirm join calls `joinQueue` with failure messages.
- **Slice C (call next) tested on device and staff browser**: staff waiting list and current ticket are real (`useOfficeTickets` plus today's queue doc). Call next and Override write through `callNext`/`callTicket`. Verify, no-show and complete are stubs until slices D and E. A student's Home ticket shows YOUR_TURN with the countdown once called.
- **EAS**: dev build works; testing through `expo start --dev-client --tunnel`. JS-only changes reload without a rebuild.
- **UI**: all screens exist. Still mock: staff waiting list and current ticket, offenses, activity log, notifications, guests, programs, display.

## In progress
Nothing active. Slice C passed manual testing (call next, current ticket, student sees it). Slice D is next.

## Next (end-to-end ticket flow, one commit per slice, developer tests between)
D. Verify arrival (student): 60 s window, office `check_in_code` (QR or manual).
E. Complete, cancel (WAITING only), no-show (after 60 s). Removes `MOCK_HISTORY_TICKETS`.
F. Remove leftover mock paths for the ticket flow. Offenses, notifications, activity log, guests stay mock until their slices.

## Known issues
- `edit-profile.jsx` calls `updateProfile`, which `SessionProvider` does not define; saving a profile throws.
- `.env` files and `apps/mobile/google-services.json` are committed (public client config only).
- Seeded `hours` on `off_reg_001` may be incomplete (`close_min` should be 1020). Hours are display only now.
- Any Google account that signs in on the staff app leaves an empty Firebase Auth user (no Firestore access). Accepted.
- An unfinished ticket from an earlier day is not shown on the student's Home (known gap, slice 1).
- A refused open/close on staff only logs to the console (no on-screen message yet).
- Stray root `app.json`; root README is still the Expo template.

## Open questions
- Dev Firebase project separate from the real one?
- Student ID editable in Profile? PRD R-01 says locked, DoD #22 says editable.
- Push option (relay vs in-app only). Program list stays hardcoded for now.
