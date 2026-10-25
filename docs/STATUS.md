# Status

Living snapshot. Overwrite sections as things change; keep it under ~60 lines.
Decisions and their reasons live in `DECISIONS.md`. Product spec: `KnowledgeBase/QAMPUS_PRD.md`.
**Next session: read `NEXT_SESSION.md`** (working agreements, environment, code map, lessons, and the ordered plan).

_Last updated: 2026-10-25_
_Schema: `docs/SCHEMA.md` (users, institutionalIds, offices, staff, queues, tickets, offenses locked)._

## Built
- **Mobile Google sign-in** (native `@react-native-google-signin`, school domain only), then Firebase `signInWithCredential`. Student profile in `users/{uid}` (`apps/mobile/src/lib/users.js`).
- **Staff sign-in** (`apps/staff`): Google popup, `staff/{email}` lookup for `office_id`/`role`/`name` (Not Assigned if missing). No domain check; the doc is the gate. `OfficeProvider` holds the real `offices/{office_id}` listener.
- **Rules in the repo**: `firestore.rules` is the source of truth (`firebase.json`, `.firebaserc` pin `qampus-d0718`). Deploy with `firebase deploy --only firestore:rules`; never edit in the console.
- **`packages/backend`** (`@qampus/backend`): shared by both apps. Ticketing ids/derive/preflight (13 unit tests, `npm test`), listeners (`watchBoard`, `watchQueue`, `watchMyTickets`), writes (`openQueue`, `closeQueue`, `joinQueue`).
- **Slice B (student joins) tested on device and staff browser**: staff Open/Close queue is real (today's `queues` doc). Mobile Offices list, Home ticket and My Tickets read Firestore through `QueueDataProvider`; Confirm join calls `joinQueue` with failure messages.
- **Slice C (call next) tested on device and staff browser**: staff waiting list and current ticket are real (`useOfficeTickets` plus today's queue doc). Call next and Override write through `callNext`/`callTicket`. Verify, no-show and complete are stubs until slices D and E. A student's Home ticket shows YOUR_TURN with the countdown once called.
- **Slice D (verify arrival) tested on device and staff browser**: the student checks in on the Scan tab by typing the 6-digit office code (`useCheckIn`, `checkInByCode`); staff Verify by ID is real (`verifyByHolderId`). Both do CALLED -> IN_SERVICE inside the 60 s grace period. QR scanning is not built (needs `expo-camera` and a new dev build). An app-wide "It's your turn" dialog (`CalledModal` in the signed-in layout) opens while a ticket is being called.
- **Slice E (complete, no-show, student cancel) tested on device and staff browser**: staff Complete and No-show free the window in one atomic write; a student cancels a WAITING ticket from the Home ticket modal (with confirm). Finished tickets appear in the student's History through the live listener. No offenses or strikes are recorded yet.
- **EAS**: dev build works; testing through `expo start --dev-client --tunnel`. JS-only changes reload without a rebuild.
- **Slice F (cleanup + office cancels the queue) tested on device and staff browser**: staff "Cancel entire queue" is real; the dead mock reducer paths and ticket-flow mock data are deleted (`QueueProvider` 946 -> ~450 lines).
- **Three-ticket limit (R-07) tested on device and staff browser**: `users.active_count` is raised by a join (rules require it) and lowered by every finish/cancel. Join is refused with a message at three; the Join button is disabled at three. A hand-made client could cheat the counter (accepted for the prototype). Office cancel runs in small transactions.
- **One active ticket per office tested on device and staff browser**: `users.active_offices` (office id -> true) is set by a join and cleared by every finish/cancel. A second join of the same office is refused with a message, and its Join button is disabled.
- **Penalties tested on device and staff browser**: offenses (`offenses/{ticketId}`), strikes and a 24-hour ban after the second, recorded with the no-show and the cancel-while-called in the same transaction; a ban blocks joining; the student's Bans & Warnings screen and the staff Offenses screen read real data; staff revoke with a reason. `MOCK_OFFENSES` and `MOCK_STAFF_OFFENSES` are deleted.
- **Activity log (`events`) built, awaiting the developer's test**: every staff action and the student join/cancel/check-in writes one `events` line inside its transaction; the staff Activity Log reads them 50 per page (Newer/Older). Needs `firebase deploy --only firestore:rules,firestore:indexes --project qampus-d0718` before it works. `MOCK_STAFF_ACTIVITY` and the mock reducer are gone.
- **UI**: all screens exist. The whole ticket flow and the activity log are real. Still mock: notifications and push, guests, programs, public display (`MOCK_OFFICES`), staff cutoff override.

## In progress
Slice 6.1 (activity log): code done, 49 unit tests, lint and staff build pass. Waiting for the rules/index deploy and the developer's manual test, then commit.

## Next
Ordered plan with designs, rules notes and decisions: `NEXT_SESSION.md` section 6. In order: 6.2 notifications (in-app, stage A then B), 6.3 capacity cutoff and wait times, then public display, QR scan (new dev build), guests, small issues.

## Known issues
- `edit-profile.jsx` calls `updateProfile`, which `SessionProvider` does not define; saving a profile throws.
- `.env` files and `apps/mobile/google-services.json` are committed (public client config only).
- Seeded `hours` on `off_reg_001` may be incomplete (`close_min` should be 1020). Hours are display only now.
- Any Google account that signs in on the staff app leaves an empty Firebase Auth user (no Firestore access). Accepted.
- A refused open/close/call/complete on staff only logs to the console (no on-screen message yet).
- Staff "Override cutoff" only changes mock state (the cutoff is not real yet).
- Stray root `app.json`; root README is still the Expo template.

## Open questions
- Dev Firebase project separate from the real one?
- Student ID editable in Profile? PRD R-01 says locked, DoD #22 says editable.
- Push option (relay vs in-app only). Program list stays hardcoded for now.
