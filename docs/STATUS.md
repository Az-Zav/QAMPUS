# Status

Living snapshot. Overwrite sections as things change; keep it under ~60 lines.
Decisions and their reasons live in `DECISIONS.md`. Product spec: `KnowledgeBase/QAMPUS_PRD.md`.

_Last updated: 2026-10-24_
_Schema: `docs/SCHEMA.md` (users, institutionalIds, offices, staff, queues, tickets, offenses locked)._

## Built
- **Mobile Google sign-in** (native `@react-native-google-signin`, school domain only via `SCHOOL_EMAIL_DOMAIN`), then Firebase `signInWithCredential`. Sign-out works.
- **Student profile** in Firestore `users/{uid}`, created client-side on first sign-in (`apps/mobile/src/lib/users.js`); `complete-profile` saves student ID and program.
- **EAS**: `eas.json` profiles (development / preview / production) with update channels, `expo-updates` with `runtimeVersion: appVersion`, `expo-dev-client`. Dev build works; testing through `expo start --dev-client --tunnel`.
- **UI**: all mobile and staff screens and components exist, running on mock data (`packages/core/src/mock.js`).

## Not built yet
- Staff sign-in. `apps/staff` has no Firebase dependency; `sign-in.jsx` is a fake delay.
- Offices, queues, tickets in Firestore. Every list and ticket on both apps is still mock.
- `firestore.rules` is not in the repo (rules currently live only in the Firebase console).
- Guests (still mock), notifications and push, offenses and bans, capacity cutoff, public display.

## In progress
Nothing active.

## Next (ticketing slice 1, real Firebase project, no emulator)
A. Seed `offices/{id}` (with `check_in_code`) and `staff/{email}` by hand in the console (shapes in DECISIONS.md, "Final slice-1 data model"). Staff app: Firebase config + Google popup sign-in + `staff/{email}` lookup (Not Assigned if missing).
B. Join (student): rules + `joinQueue` + offices list + Home ticket live.
C. Call next (staff).
D. Verify arrival (student): 60 s window, office code.
E. Complete, cancel (WAITING only), no-show (after 60 s).
F. Remove mock hooks as each is replaced; then `mock.js`.
Each step ends with a manual check on phone (student) and browser (staff). Rules are deployed by the user with `firebase deploy --only firestore:rules`.

## Known issues
- `edit-profile.jsx` calls `updateProfile`, which `SessionProvider` does not define; saving a profile throws.
- `.env` and `apps/mobile/google-services.json` are committed (public client config only).
- Stray root `app.json`; root README is still the Expo template.
- The `ui-mock-final` tag (a snapshot of the working mock app) was proposed but not created yet.

## Open questions
- Confirm the campus constant is UTC+8 (used for the daily queue key).
- First office to seed, its `check_in_code`, and the staff emails.
- Dev Firebase project separate from the real one?
- Student ID editable in Profile? PRD R-01 says locked, DoD #22 says editable.
- Push option (relay vs in-app only). Program list stays hardcoded for now.
