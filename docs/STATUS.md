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
- **Activity log (`events`) tested**: every staff action and the student join/cancel/check-in writes one `events` line inside its transaction; the staff Activity Log reads them 50 per page (arrows) with action and date filters. Needs the rules and `firestore.indexes.json` deployed.
- **In-app notifications tested**: `users/{uid}/notifications` is written with each cause (your turn, approaching turn at place 3, no-show, queue cancelled per ticket, offense revoked, queue confirmed, warning on a called cancel). The mobile list and bell are live; viewing the screen marks them read (only while focused); a banner slides in from the top for a new one while the app is open. Push is not built.
- **Capacity cutoff and measured wait times tested**: `cutoffState` refuses a join when the minutes left before closing, divided by the average visit, are fewer than the waiting plus one (client side only); the Join button reason and the staff banner/strip use it; staff Override cutoff writes `cutoff_overridden` plus a `CUTOFF_OVERRIDE` event. Wait estimates use today's measured average. A day with no hours has no cutoff.
- **Guests (6.6, tested)**: "Continue as guest" signs in anonymously (device bound), the guest form issues a unique `G` + six digits reserved in `institutionalIds`; student IDs are reserved the same way (a taken ID is refused). Guests use the app like students; guest Sign out warns that the ID and tickets are lost.
- **Public display (6.4, tested)**: staff Queue has a "Launch public display" button that opens `/display/{office code}` in a new tab. It shows Now Serving, the next three numbers, the `check_in_code` QR and manual code, and a closed state, from the live office and queue (no names). A tab opened from the console reuses the staff session; a bare screen signs in anonymously. `MOCK_OFFICES` is deleted.
- **Terms of Service and Privacy Policy (built, awaiting device test)**: one reader screen (`/legal/terms`, `/legal/privacy`) opened from the Login footer links and a new LEGAL section in Settings; text in `constants/legal.js`, a draft for the school's DPO to review.
- **QR scan and biometric unlock (tested)**: the Scan tab shows the live camera in the corner frame and reads the display QR (`parseCheckInPayload`, shared with the display via `checkInPayload`); a QR of another office gets its own message; the typed field stays as the fallback. Settings > Biometric unlock asks for a fingerprint, face or device PIN when the app opens or returns after more than a minute away (students and guests, per-device, default off).
- **Push notifications (tested, relay deployed)**: a phone registers its Expo token (`users.push_token`), the Settings switch saves `push_enabled`, sign-out clears the token; after a staff call the console asks the relay (`relay/`, a Cloudflare Worker at https://qampus-push.qampus-push.workers.dev), which checks the caller is staff and sends the fixed "It's your turn" push. The relay only accepts the staff origin(s) in `ALLOWED_ORIGINS` (today `http://localhost:8081`).
- **UI**: all screens exist. The ticket flow, activity log, notifications, cutoff, guests and the display are real. Still mock: staff notifications (maintenance text only) and the programs list.

## In progress
Nothing active. Push notifications are deployed and tested: the relay runs on Cloudflare at https://qampus-push.qampus-push.workers.dev and the staff `.env` points at it.

## Next
1. UI polish (spacing, responsiveness, remove dev previews). 2. Preview deployment for end-to-end testing (also add the hosted staff address to `ALLOWED_ORIGINS` in `relay/wrangler.jsonc` and redeploy the relay). Small items: the cutoff tweak (measured average after 3+ visits), backfill of old student IDs, the root `eas.json`.

## Known issues
- `.env` files and `apps/mobile/google-services.json` are committed (public client config only).
- Any Google account that signs in on the staff app leaves an empty Firebase Auth user (no Firestore access). Accepted.
- Cutoff is enforced in the client only (a hand-made client could join past it); an office with no hours for today has no cutoff.
- Root `eas.json` (and an untracked root `android/`) look like leftovers of an older root-level EAS setup; `apps/mobile` has its own `eas.json`. Not touched.
- Students who saved a student ID before 6.6 have no `institutionalIds` claim; their ID is not reserved until they are given a claim (a second student could still take it). Accepted for the prototype.

## Open questions
- Dev Firebase project separate from the real one?
- Student ID editable in Profile? PRD R-01 says locked, DoD #22 says editable.
- Support/DPO contact address for Help & Support and the legal text.
- Push option (relay vs in-app only). Program list stays hardcoded for now.
