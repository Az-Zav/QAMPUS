# QA Final Test Summary Report (Attempt 3)

_Date: 2026-11-06. Tester: Claude (QA lead role). Detailed bug reports: `docs/QA_ATTEMPT_1.md` (BUG-001 to BUG-011)
and `docs/QA_ATTEMPT_2.md` (BUG-012 to BUG-015)._

## Build status: **FAIL**

One Critical bug (BUG-019, found in the live end-to-end run: a student who briefly leaves the app learns of the call
after the 60 s window has closed) and six Major bugs are open, and no fixes were delivered across the three attempts.
The live end-to-end flow does pass when the app stays on screen. The primary flows work on the happy
path, but four of the Major bugs can, without any wrongdoing by the user, either lock a student out of an office
permanently (BUG-001), stop a guest from ever joining (BUG-003), or give a strike or ban to someone who followed the
rules (BUG-004, BUG-005). BUG-006 can block an office's window.

**What would turn this into a Conditional Pass:** fix BUG-001, BUG-003 and BUG-004 (they are reproducible on the
emulators and the fixes are local), and accept BUG-002, BUG-005 and BUG-006 in writing as prototype limits with
operating rules: staff finish or cancel every ticket before closing, and every device uses automatic time.

## Build under test

| Part | Version |
| --- | --- |
| Repository | `main` = `b54b58f` (unchanged across all three attempts) |
| Staff console (live) | `qampus-staff.web.app`, bundle `entry-6ca97dfa2d8974f8e7cae65024896689.js` |
| Mobile | APK `application-dea9307a….apk` (built 2026-11-05) + EAS `preview` update `046e9eb4` (Android) |
| Push relay | `qampus-push.qampus-push.workers.dev` |
| Rules | Repo `firestore.rules` on the emulators; the live rules were not readable from here |

## Attempt 3b: signed-in smoke on the Android emulator

You signed in to the Google account on the emulator; I signed in to the app with it (`qebagayan@tip.edu.ph`, live
project) and checked the student screens **read-only** (no join, cancel or profile change).

**BUG-002 is happening on this live account now.** Home shows three WAITING tickets (M-021, R-016, S-005). Notifications
say all three were joined "Yesterday", so none of them can be called. Home still labels them "NEXT UP" with "0 mins" and
"20 mins"; S-005 says "5 in line, 4 people ahead, about 20 min" while the Queue tab shows Student Accounting OPEN with
"0 waiting". Because the three tickets fill the three-ticket limit, the student **cannot join any office today**: every
Join button is disabled ("You already hold 3 active tickets" / "You already have an active ticket here").

| Screen | Result |
| --- | --- |
| Google sign-in (institutional account) | Pass |
| Home greeting, Active Queues, Operating Hours | Pass, but shows BUG-002 (above) and "0 mins" |
| Queue tab: office list, OPEN/CLOSED, disabled Join with reasons | Pass |
| Queue › History: grouped, full ticket numbers, statuses | Pass |
| Notifications: list and wording | Pass |
| Bans & Warnings: 1 offense on record, revoked offense marked REVOKED | Pass |
| Settings: push switch, biometric hint on a phone without biometrics, theme, legal | Pass |
| Edit Profile: student ID locked with explanation | Pass |
| Help & Support FAQ | Pass |
| Scan from the tab: camera dialog, "Type the code instead" works on the first tap, dialog does not come back | Pass on this path |
| Profile › Queue History | **Fail: BUG-016** |
| Tap a CLOSED office card on Home | **Known bug reproduced**: nothing happens, no message |
| Contact Support | Opens Gmail (first-run screen on the emulator); missing recipient confirmed in code |

**Known bugs, updated from the device:** "0 mins" is confirmed on screen (the ticket modal also says "about 0 min").
**Staff Revoke works on live**: the account has an "Offense revoked" notification and the offense shows REVOKED.

### BUG-016
- **Category:** Regression
- **Severity:** Minor
- **Title:** Profile › Queue History opens the Queue tab on "Join" instead of "History"
- **Environment:** Android emulator (Pixel_8 AVD), APK from 2026-11-05 + EAS `preview` update `046e9eb4`, signed in as a student
- **Preconditions:** Signed in
- **Steps to Reproduce:**
  1. Tap the avatar to open Profile.
  2. Tap Queue History.
- **Expected Result:** The Queue tab opens on History.
- **Actual Result:** It opens on Join ("Pick a line to join"). The menu item links to plain `/queue` (`constants/content.js:184`) and `queue.jsx` always starts on Join. An EAS update a week ago ("Fixed Navigation from profile's show history to history instead of join") shipped a fix, but that fix was never committed to git, so the next `eas update` from `main` removed it.
- **Workaround (if any):** Tap the History segment.

**Process risk behind BUG-016:** an EAS update was published from changes that never reached the repository. Every
later update from `main` silently reverts such fixes. Publish updates only from committed code.

## Attempt 3c: signed-in staff console (read-only)

You signed in as Registrar staff in the browser pane (live `qampus-staff.web.app`). I opened every screen without
pressing any action button.

| Check | Result |
| --- | --- |
| Queue screen: manual code, CLOSED state, Open/Cancel queue, Now Serving panel, empty Waiting list | Pass |
| Offenses: counts add up (13 active + 13 revoked = 26), Registrar only, revoked kept on record | Pass, but see BUG-017 |
| Activity Log: today's 23 entries match the 2026-11-06 test session step by step; filters and paging shown | Pass |
| Phone width (375 px): Queue, Offenses, Activity Log | Pass: no horizontal scroll, stacked buttons full height |
| Public display `/display/R` | Pass, with BUG-018 |
| Display with an unknown office code | Pass: "This display link does not match an office." |
| Console errors | Only "Cross-Origin-Opener-Policy would block window.closed" (from the Google sign-in popup; harmless) |
| BUG-002 from the staff side | **Confirmed**: R-016 (yesterday, still WAITING on the student's phone) is not shown anywhere in the console, so staff cannot clear it |

### BUG-017
- **Category:** Edge Case
- **Severity:** Minor
- **Title:** The staff Offenses screen shows bans that do not exist (and can miss real ones)
- **Environment:** Live staff console, Registrar, Chrome-based browser pane; Android emulator signed in as the same student
- **Preconditions:** A student has two unrevoked offenses at one office, far apart in time, with a revoke in between
- **Steps to Reproduce:**
  1. Open Offenses as Registrar staff.
  2. Read the "Currently banned users" count and the labels on E.J. BAGAYAN's offenses.
  3. On the student's phone, open Bans & Warnings.
- **Expected Result:** Both show the same ban state, the one stored on the student's profile (`strike_count`, `banned_until`), which is what join checks use.
- **Actual Result:** The console counts 4 banned users, including this student, and labels R-11-05-013 "Caused a 24-hour ban". The phone shows "1 offense on record" and no ban. `apps/staff/src/utils/penalties.js` recalculates bans by pairing the office's unrevoked offenses in date order (here an Oct 28 no-show with a Nov 5 no-show), rather than reading the profile. Its own comment calls it display-only, but staff decide revokes from it ("revoking reverses the strike and lifts any ban it caused").
- **Workaround (if any):** Check the student's Bans & Warnings screen.

### BUG-018
- **Category:** Edge Case
- **Severity:** Low
- **Title:** The public display says "It opens again at 08:00" after 08:00 has passed, and never names the day
- **Environment:** Live `/display/R`, 2026-11-06 08:59 campus time (Friday), Registrar hours 08:00–17:00, queue not opened yet
- **Preconditions:** Queue closed during or after opening hours
- **Steps to Reproduce:**
  1. Open `/display/R` while the Registrar queue is closed after 08:00.
- **Expected Result:** "Not open yet" during hours, or the next opening with its day ("Opens Monday at 08:00").
- **Actual Result:** "This queue is closed. It opens again at 08:00." The display uses today's opening time (`office.opens`), not `nextOpening`, so the same text shows on a Friday evening even if the next opening is Monday.
- **Workaround (if any):** None needed.

## Attempt 3d: live end-to-end ticket (with your go-ahead)

| Step | Result |
| --- | --- |
| Cancel the three stale tickets (M-021, R-016, S-005) from Home | Pass: free cancel, Home empties, the limit is released |
| Staff open the Registrar queue | Pass: phone shows Registrar OPEN within seconds |
| Student joins Registrar | Pass: R-007; the console shows "1 waiting · R-007 NEXT" right away (copy issue BUG-020) |
| Staff Call Next (app in the background for a few seconds, then reopened) | **Fail: BUG-019**: the phone showed the call about 60 s late, already "Expired" |
| Push "It's your turn" | **Not tested**: this fresh APK install has notification permission off (`POST_NOTIFICATIONS granted=false`) |
| Check in with the code | Not possible (grace period was over when the phone learned of the call) |
| Complete, close | Not reached |

You then pressed **Cancel all tickets** (reason "QA end-to-end test run"): R-007 was cancelled by the office with no
penalty, and the phone showed "No active tickets" and a "Queue cancelled" notification with the reason.

**Second run, app kept on screen (09:08–09:12):**

| Step | Result |
| --- | --- |
| Staff reopen Registrar; student joins as R-008 | Pass |
| Staff Call Next at 09:09:52 | Pass: at 09:10:10 the phone showed the "It's your turn" dialog with **0:43** left (so the call arrived within about 17 s, in time to act) |
| Open scanner from the dialog, then type 082607 | Pass: "You're checked in" at 09:10:34; console shows "In service · Arrival verified". No camera prompt came back on this path in this session |
| Staff Complete Service, then "Mark as served" | Pass: window cleared; average updated to 1 min (3 visits measured today, floored at 1 min) |
| Phone Home and History | Pass: Home "No active tickets"; History TODAY lists R-11-06-008 Completed and R-11-06-007 Cancelled by office |
| Notifications | Pass: Queue joined, Your turn, Queue cancelled with reason. **No "service completed" notification** (known bug, confirmed live) |
| Staff close the queue | Pass |
| Primary button in phone dialogs | **Known bug confirmed**: the "Done" button on "You're checked in" shows the grey square behind its rounded shape |

**Live state now:** Registrar CLOSED, no ticket at the window, no active tickets on the account, no offense added by
these runs.

**BUG-019 reading:** with the app in the foreground the call arrived in time; after a few seconds in the background it
arrived about 55 s late. Backgrounding is the likely trigger. One run each, so it still needs a repeat on a real phone,
with push permission on (push is the intended backup for exactly this case).

### BUG-019
- **Category:** Edge Case
- **Severity:** Critical (if it reproduces; seen once)
- **Title:** After the app returns from the background, the call reaches the phone about 60 s late, so the student goes straight to "Expired"
- **Environment:** Android emulator (Pixel_8 AVD), APK from 2026-11-05 + EAS `preview` `046e9eb4`; live project; staff console in a Chrome-based browser
- **Preconditions:** Student holds a WAITING ticket; the app has been in the background briefly
- **Steps to Reproduce:**
  1. 09:04:10: press the phone's Home button (app to background).
  2. 09:04:18: staff press Call Next; the console shows R-007 Called with the 60 s countdown at once.
  3. 09:04:22: reopen the app.
  4. Watch Home.
- **Expected Result:** Within a second or two, Home shows "YOUR TURN" with about 55 s left, and the "It's your turn" dialog opens.
- **Actual Result:** Home kept showing "Waiting / NEXT UP" (and a tap on Scan did not register) until about 09:05:17, when it switched straight to "0:00 · Expired · WAITING FOR STAFF". The student never had a chance to check in. Without push (BUG-019 is worse when push is off or late), this is a guaranteed no-show and strike.
- **Workaround (if any):** None for the student. Staff can cancel the queue to avoid the offense.
- **Suspected cause (not confirmed):** the Firestore web SDK's listener connection stalls while the app is backgrounded and only recovers on a timeout. `apps/mobile/src/lib/firebase.js` uses `getFirestore(app)` with default transport settings on React Native. A second run with the app kept in the foreground would tell whether backgrounding is the trigger.

### BUG-020
- **Category:** Edge Case
- **Severity:** Low
- **Title:** The join confirmation says "Your R queue ticket has been issued" (office code instead of the office name)
- **Environment:** Android emulator, same build
- **Preconditions:** Registrar queue open
- **Steps to Reproduce:**
  1. Queue tab › Office of the Registrar › JOIN › Confirm join.
- **Expected Result:** "Your ticket for Office of the Registrar has been issued" (or the ticket number).
- **Actual Result:** "Your R queue ticket has been issued. Check Home for your position and updates."
- **Workaround (if any):** None needed.

## Smoke test: primary journeys (Attempt 3)

| Journey | Result | How it was checked |
| --- | --- | --- |
| Student/guest joins a queue (normal name) | Pass | Emulator flow (security suite flows, probe E1d) |
| Staff open, call, verify, complete, close | Pass | Emulator flows |
| No-show with strike, then a 24 h ban | Pass (correct clocks) | Emulator, probe E4b |
| Student cancels a waiting ticket | Pass | Emulator flow |
| Office cancels the whole queue | Pass | Rules suite |
| Waiting list (`waiting_seqs`) after override and cancel | Pass | 11 rules checks |
| Security controls | Pass, 38/38 refused | `npm run test:security` |
| Unit tests and lint | Pass, 93/93; lint clean | `npm test`, `npm run lint` |
| Staff console loads and caches correctly | Pass | Live headers: page `no-cache`, bundles immutable, missing bundle 404 |
| Push relay | Pass | Hosted-origin preflight 204; unsigned push refused 401 |
| Mobile cold start (online and offline) | Pass, no crash; opens to Login | Android emulator |
| Mobile onboarding, Login, guest form checks, legal pages, 200% font | Pass (BUG-015 note) | Android emulator |
| Signed-in mobile screens (Home, Queue, History, Bans, Notifications, Settings, Scan) | Pass read-only, except BUG-002 and BUG-016 | Android emulator, Attempt 3b |
| Signed-in join and cancel on the phone | **Not tested** (writes on the live project; the account is at its 3-ticket limit) | n/a |
| Signed-in staff console in a browser | Pass read-only (Queue, Offenses, Activity Log, display), except BUG-017 and BUG-018 | Browser pane, Attempt 3c |
| Live end-to-end ticket (join, call, check-in, complete, close) | **Pass with the app on screen**; **Fail after backgrounding** (BUG-019); push not tested (permission off) | Attempt 3d |
| iOS | **Not tested** | No device |

## Open defects

| ID | Severity | Title | Status |
| --- | --- | --- | --- |
| BUG-019 | Critical | Call reaches the phone ~55 s late after the app returns from the background; student sees "Expired" at once | Open, intermittent (1 of 2 background runs; see `QA_FULL_TEST.md`) |
| BUG-022 | Major | With several tickets called, check-in only works for the first one in the list | Open, emulator (`QA_FULL_TEST.md`) |
| BUG-023 | Major | Being called by two offices at once ends in an automatic 24-hour ban | Open, emulator (`QA_FULL_TEST.md`) |
| BUG-021 | Minor | No offline indicator; a waiting student does not know updates stopped | Open, seen live (`QA_FULL_TEST.md`) |
| BUG-020 | Low | Join confirmation says "Your R queue ticket" | Open, seen live |
| BUG-001 | Major | Ticket left CALLED/IN_SERVICE past the campus day can never be finished; office locked for the student | Open, reproduced 3/3 |
| BUG-002 | Major | Old WAITING ticket shows today's Now serving / people ahead | Open, **seen on the live account**: 3 stale tickets block every join today |
| BUG-016 | Minor | Profile › Queue History opens Join (shipped fix never committed) | Open, Regression |
| BUG-017 | Minor | Staff Offenses screen recalculates bans and disagrees with the student's real state | Open, seen live |
| BUG-018 | Low | Display says "opens again at 08:00" after 08:00, no day | Open, seen live |
| BUG-003 | Major | Guest name > 100 chars: every join refused, "check your connection" | Open, reproduced 3/3 + device |
| BUG-004 | Major | Confirmed free cancel becomes a strike if the ticket is called meanwhile | Open, reproduced 3/3 |
| BUG-005 | Major | Phone clock skew breaks the 60 s check-in | Open |
| BUG-006 | Major | Staff PC clock off by > 30 min: ban no-show refused, window blocked | Open, reproduced 3/3 |
| BUG-007 | Minor | Double Call next: false "not accepted" banner | Open, reproduced 3/3 |
| BUG-008 | Minor | Verify by ID says "no match" for any error | Open |
| BUG-009 | Minor | Revoking an old ban-causing offense lifts the current ban | Open |
| BUG-012 | Minor | Guest sign-out leaves ghost tickets in queues | Open |
| BUG-013 | Minor | Biometric unlock eats into the 60 s check-in | Open |
| BUG-014 | Minor | Check-in racing staff verify shows "time ran out" | Open |
| BUG-010 | Low | Expo "Unmatched Route" page with Sitemap on the live console | Open |
| BUG-011 | Low | Security gap G18 not listed in STATUS | Open |
| BUG-015 | Low | Login footer touches the gesture bar at 200% font | Open |

**Known bugs from STATUS** (see the Attempt 1 table): the Hosting cache issue is **fixed and verified**, and
`waiting_seqs` is **deployed**. These are still in the code: "0 mins"/"1 mins", the silent office card tap, Contact
Support with no recipient, no completion notification, joins before opening, the closed-queue cancel path, the
repeating camera prompt (not reproduced from the Scan tab; the reported path is from the called dialog), the missing
anti-framing header, and 10 security gaps. **Live Revoke works** (seen on the signed-in account in Attempt 3b). The
dialog button's grey square was not seen on the screens opened.

## Edge-case handling: what is handled well
- Every ticket write is atomic and checked by the rules: two staff calling at once, or a no-show racing a cancel, can
  never double-call or double-penalize (the offense id is the ticket id).
- Ticket numbers cannot repeat (create-only ids), and the three-ticket and one-per-office limits hold under races.
- A cold start offline does not crash.
- Removing the phone's biometrics does not lock the student out.
- Staff reason text is capped (200 characters), so notifications stay inside the rules' limits.
- Form validation on the guest form (name, email, guest type) works on the device.

## Coverage gaps and risk
Signed-in phone journeys, network loss in the middle of a flow, push delivery, the camera QR read and iOS were not
exercised in any attempt. The tested edge cases point to the riskiest area being **time**: day rollover and device
clocks (BUG-001, 002, 005, 006). A full signed-in run on a real phone is the most valuable next test.

## Recommended fix order
1. BUG-003: `maxLength={60}` on the guest name (one line, mirrors Edit Profile).
2. BUG-004: pass the status the student confirmed into `cancelOwnTicket` and refuse if it changed.
3. BUG-001 / BUG-002: end-of-day cleanup: closing (or the next day's open) cancels the previous day's unfinished
   tickets without penalty, and the console can finish a ticket from an earlier day.
4. BUG-005 / BUG-006: measure the server-clock offset once (for example from a `serverTimestamp` write) and use it
   for the countdown, the cutoff and `banned_until`.
5. BUG-007 / BUG-008: busy guards on the staff buttons; map DENIED/UNKNOWN to a connection message in Verify and No-show.
