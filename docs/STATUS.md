# Status

Living snapshot. Overwrite sections as things change; keep it under ~60 lines.
Decisions and their reasons live in `DECISIONS.md`. Product spec: `KnowledgeBase/QAMPUS_PRD.md`.

_Last updated: 2026-10-24_
_Schema: `docs/SCHEMA.md` (users, institutionalIds, offices, staff, queues, tickets, offenses locked)._

## Built
- **Mobile Google sign-in** (native `@react-native-google-signin`, school domain only via `SCHOOL_EMAIL_DOMAIN`), then Firebase `signInWithCredential`. Sign-out works.
- **Student profile** in Firestore `users/{uid}`, created client-side on first sign-in (`apps/mobile/src/lib/users.js`); `complete-profile` saves student ID and program.
- **Staff sign-in** (`apps/staff`): Firebase config (`src/lib/firebase.js`, `.env`), Google popup, lookup of `staff/{email}` for `office_id`/`role`/`name` (Not Assigned if the doc is missing), session restore on reload, sign-out. No domain check; the doc is the gate.
- **Staff office is real**: `OfficeProvider` holds one `offices/{office_id}` listener shared by all console screens; `useStaffOffice` reads it; `toOfficeView` reads today's `hours` entry (UTC+8). The console shows Outage if the office cannot be read. The `offices` read rule is published in the console.
- **Seeded by hand in the console**: `offices/off_reg_001` and `staff/{personal gmail}` (`office_id`, `role`, `name`).
- **EAS**: `eas.json` profiles (development / preview / production) with update channels, `expo-updates` with `runtimeVersion: appVersion`, `expo-dev-client`. Dev build works; testing through `expo start --dev-client --tunnel`.
- **UI**: all mobile and staff screens and components exist. Lists, queue and tickets run on mock data (`packages/core/src/mock.js`); only the staff session is real.

## Not built yet
- Offices, queues, tickets in Firestore. Every list and ticket on both apps is still mock, including the staff office header.
- `firestore.rules` is not in the repo. The console rules cover only `users` and own-email `staff` reads; everything else is denied by default.
- Guests (still mock), notifications and push, offenses and bans, capacity cutoff, public display.

## In progress
Step A, remaining items (3 and 4 are done) (the developer is doing the edits, guided step by step):
5. Reshape `MOCK_OFFICES` to the schema (`hours`, `check_in_code`); fix `apps/mobile/src/utils/office.js` (reads `operating_hours`), `queue.jsx` and `display/[code].jsx` (read `manual_code`).
6. Add `firestore.rules` to the repo (console rules + `offices` read + `users` create lock) and deploy.

## Next (ticketing slice 1, real Firebase project, no emulator)
B. Join (student): rules + `joinQueue` + offices list + Home ticket live.
C. Call next (staff).
D. Verify arrival (student): 60 s window, office code.
E. Complete, cancel (WAITING only), no-show (after 60 s).
F. Remove mock hooks as each is replaced; then `mock.js`.
Each step ends with a manual check on phone (student) and browser (staff). Rules are deployed by the user with `firebase deploy --only firestore:rules`.

## Known issues
- `edit-profile.jsx` calls `updateProfile`, which `SessionProvider` does not define; saving a profile throws.
- `.env` files and `apps/mobile/google-services.json` are committed (public client config only).
- Seeded `hours` on `off_reg_001` may be incomplete or wrong (`close_min` should be 1020 for 17:00; MON to FRI needed). Re-check in the console.
- Any Google account that signs in on the staff app leaves an empty Firebase Auth user (no Firestore access). Accepted for now.
- Stray root `app.json`; root README is still the Expo template.
- The `ui-mock-final` tag (a snapshot of the working mock app) was proposed but not created yet.

## Open questions
- Confirm the campus constant is UTC+8 (used for the daily queue key).
- Dev Firebase project separate from the real one?
- Student ID editable in Profile? PRD R-01 says locked, DoD #22 says editable.
- Push option (relay vs in-app only). Program list stays hardcoded for now.
