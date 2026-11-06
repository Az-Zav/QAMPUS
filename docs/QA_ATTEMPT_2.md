# QA Attempt 2: Fix verification and regression sweep

_Date: 2026-11-06. Build under test: unchanged from Attempt 1 (`main` at `b54b58f`, no new commits on any branch);
live staff Hosting bundle `entry-6ca97dfa…`; APK `application-dea9307a….apk` (Downloads, built 2026-11-05) on the
Android emulator (Pixel_8 AVD, 1080x2400), which pulls EAS `preview` update `046e9eb4`._

## Summary

No fixes were delivered between Attempt 1 and Attempt 2: the repo, every remote branch and the live Hosting bundle
are the same as in Attempt 1. Every Attempt 1 bug was re-run and **all 11 still reproduce**. The regression suites still
pass. This attempt also covered areas Attempt 1 did not (notifications, biometric lock, sign-out, the mobile app's
signed-out screens on the emulator) and found 4 more bugs.

## How this attempt was run

| Method | What it covered |
| --- | --- |
| `npm test`, `npm run lint` | 93/93 unit tests pass; lint passes |
| `npm run test:security` | 38/38 controls refused, 7/7 flows accepted, 10/10 gaps still open |
| `qa-attempt1.mjs` on the emulators | All 13 probes give the same result as in Attempt 1 |
| Android emulator (APK installed by `adb`) | Onboarding, login, guest form validation, legal pages, 200% font scale, rapid taps |
| Code reading | Notifications, biometric lock, sign-out, staff reason limits, check-in and verify racing each other |

**Not covered:** anything after sign-in on the phone. Google sign-in needs your account, and the guest form's
Continue creates a real account on the live project, so I stopped at the form. The signed-in staff console was not
driven either.

## Re-test of Attempt 1 bugs

| Bug | Result | Evidence |
| --- | --- | --- |
| BUG-001 ticket left in service past midnight is stuck | **Still open** | E3a/b/c refused, as before |
| BUG-002 old WAITING ticket shows today's numbers | **Still open** | Code unchanged (`useMyTickets.js`, `utils/ticket.js`) |
| BUG-003 guest name > 100 chars cannot join | **Still open; also confirmed on the device**: the guest form took a 143-character name with no error | E1b refused; emulator screenshot |
| BUG-004 confirmed free cancel becomes a strike | **Still open** | E2c `strike_count: 1`, offense recorded |
| BUG-005 phone clock skew breaks check-in | **Still open** | Code unchanged |
| BUG-006 staff clock skew blocks the ban no-show | **Still open** | E4a refused, E4b passes |
| BUG-007 false error on double Call next | **Still open** | E5: `called, DENIED` |
| BUG-008 Verify by ID says "no match" for any error | **Still open** | Code unchanged |
| BUG-009 revoking an old ban lifts the current one | **Still open** | Code unchanged |
| BUG-010 Expo "Unmatched Route" page on the live site | **Still open** | Same bundle live |
| BUG-011 G18 missing from STATUS | **Still open** | `test:security` lists G18 |

The known bugs from STATUS have the same status as in the Attempt 1 table (`docs/QA_ATTEMPT_1.md`).

## Regression sweep (emulator, signed out)

| Check | Result |
| --- | --- |
| App cold start | Pass: onboarding shows; no JS errors or crashes in `logcat` |
| Six fast taps on Next | Pass: lands on the last slide without skipping past it; no crash |
| Get Started, then Login | Pass |
| Continue as guest opens the form without creating an account | Pass |
| Guest form: empty submit | Pass: "Choose a guest type"; name error shown |
| Guest form: `bad@` as email | Pass: "Enter a valid email or leave it blank" |
| Guest form back button | Pass: returns to Login |
| Login at 200% font | Pass with a note: everything fits, but the footer runs into the gesture bar (BUG-015) |
| Terms of Service at 200% font | Pass: wraps, scrolls, title ellipsized |

## New bugs

### BUG-012
- **Category:** Edge Case
- **Severity:** Minor
- **Title:** A guest who signs out leaves their waiting tickets in the queue as ghosts
- **Environment:** Mobile app (code analysis: `SessionProvider.jsx` `signOut`)
- **Preconditions:** A guest holds one or more WAITING tickets
- **Steps to Reproduce:**
  1. As a guest, join two offices.
  2. Profile > Sign out and accept the warning.
  3. Staff at those offices call next.
- **Expected Result:** Signing out cancels the guest's active tickets (free while WAITING), since the account can never come back.
- **Actual Result:** Sign-out only clears the push token and the session. The tickets stay WAITING. Each one must be called, its 60 s must run out, and then it is marked a no-show, adding at least a minute per ghost to everyone behind it. The no-show also records an offense on an account nobody can use.
- **Workaround (if any):** Staff override past the ghost number, or cancel it after the grace period.

### BUG-013
- **Category:** Edge Case
- **Severity:** Minor
- **Title:** Biometric unlock eats into the 60-second check-in window
- **Environment:** Mobile app with Settings > Biometric unlock on (code analysis: `BiometricProvider.jsx`)
- **Preconditions:** Biometric unlock on; the app has been in the background for more than 1 minute
- **Steps to Reproduce:**
  1. Leave the app for more than a minute while waiting.
  2. Get called and tap the "It's your turn" push.
- **Expected Result:** The called ticket and check-in are reachable at once, or the grace period allows for the unlock.
- **Actual Result:** The lock screen comes first and the biometric prompt opens. A failed or cancelled fingerprint read uses up the few seconds left before the no-show (and its strike).
- **Workaround (if any):** Keep biometric unlock off.

### BUG-014
- **Category:** Edge Case
- **Severity:** Minor
- **Title:** If staff verify the student while the student checks in, the student is told their time ran out
- **Environment:** Mobile Scan tab and staff Verify by ID (code analysis: `startService` is a plain write; the rules accept only CALLED -> IN_SERVICE)
- **Preconditions:** Ticket CALLED
- **Steps to Reproduce:**
  1. Staff verify the student by ID.
  2. In the same second, the student submits the code on Scan.
- **Expected Result:** The student sees "You're checked in" (they are in service).
- **Actual Result:** The second write is refused and the student sees "Check-in wasn't accepted. Your time may have just run out", although the ticket is IN_SERVICE.
- **Workaround (if any):** The Home ticket shows the right state a moment later.

### BUG-015
- **Category:** Edge Case
- **Severity:** Low
- **Title:** At 200% font, the Login footer runs into the gesture bar
- **Environment:** Android emulator, Pixel_8 AVD, 1080x2400, font scale 2.0, APK from 2026-11-05
- **Preconditions:** Signed out
- **Steps to Reproduce:**
  1. Settings > Display > Font size: largest.
  2. Open the app to Login.
- **Expected Result:** The footer sits above the gesture bar, or the screen scrolls.
- **Actual Result:** "Privacy Policy" wraps onto a last line that touches the home indicator. The screen does not scroll. This is the "Login/onboarding scroll" item already on the responsiveness list.
- **Workaround (if any):** A smaller font size.

## Checked and fine
- Staff reasons: "Other" is capped at 200 characters, so a cancel or revoke notification (reason plus office name) stays under the rules' 500.
- Two staff calling at once, or no-show against a student's cancel: one write wins and no double offense is possible (the offense id is the ticket id).
- Biometrics removed from the phone after turning the lock on: the app switches the lock off instead of locking the student out.

## Before Attempt 3
Attempt 3 is the release decision. As things stand it would be a **Fail**, because six Major bugs (BUG-001 to BUG-006)
are open. To make Attempt 3 meaningful:
1. Fix (or accept in writing) BUG-001 to BUG-006, and push the fixes for the known bugs.
2. Deploy: rules, Hosting, `eas update` on `preview`.
3. For mobile coverage after sign-in: sign in to the Google account on the emulator yourself, or allow guest test
   accounts on the live project (these create real anonymous users).
