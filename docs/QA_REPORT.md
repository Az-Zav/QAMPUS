# QAMPUS QA Report: Final Test Summary

| | |
| --- | --- |
| **Date** | 2026-11-06 (campus time, UTC+8) |
| **Tester** | Claude, acting as lead mobile QA tester, for EJ Bagayan |
| **Scope** | Student mobile app (Android), staff web console, public display, Firestore rules and backend, push relay |
| **Method** | Three attempts (edge cases, re-test and regression, final acceptance), then signed-in device testing, a live end-to-end run, a full live test, the ticket limit and simultaneous calls |
| **Verdict** | **FAIL** |

This document compiles the working logs `QA_ATTEMPT_1.md`, `QA_ATTEMPT_2.md`, `QA_FINAL_REPORT.md` and
`QA_FULL_TEST.md`. Where they disagree, this report is the current one.

---

## 1. Executive summary

The core ticket flow works. A student joins, is called, checks in by code or is verified by ID, and is served. Both apps
stay in step live. The rules hold against 38 attack cases. Offline recovery, a cold start, dark mode, large fonts and
the three-ticket limit all behave correctly.

The build **fails** acceptance because **1 Critical and 8 Major defects are open**, and no fixes were delivered during
testing. Several of them punish students who did nothing wrong:

| Risk | Defects |
| --- | --- |
| A student misses their call because the app learns of it late (seen once, intermittent) | BUG-019 (Critical) |
| A student is struck or banned for something they could not avoid | BUG-004, BUG-005, BUG-023 |
| A student is locked out of joining | BUG-001, BUG-002 (seen on a live account), BUG-003 |
| A student cannot check in where they are standing | BUG-022 |
| An office's window gets blocked | BUG-006 |

**Defects by severity:** Critical 1 · Major 8 · Minor 9 · Low 5 (23 in total; all open).

**What would turn this into a Conditional Pass:**
1. Fix BUG-019, BUG-022, BUG-003 and BUG-004. All four are reproducible, and the last three are small local changes.
2. Fix BUG-001 and BUG-002 (an end-of-day cleanup), or accept them in writing with the operating rule "staff finish or cancel every ticket before closing".
3. Accept BUG-005, BUG-006 and BUG-023 in writing as prototype limits, with the operating rules "every phone and PC uses automatic time" and "staff revoke offenses caused by simultaneous calls".

---

## 2. Build and environment under test

| Part | Version |
| --- | --- |
| Repository | `main` at `b54b58f` (unchanged for the whole test) |
| Staff console (live) | `https://qampus-staff.web.app`, bundle `entry-6ca97dfa2d8974f8e7cae65024896689.js` |
| Mobile app | APK `application-dea9307a….apk` (EAS build, 2026-11-05) + EAS `preview` update `046e9eb4` (Android, runtime 1.0.0) |
| Push relay | `https://qampus-push.qampus-push.workers.dev` |
| Firebase | Live project `qampus-d0718`; Firestore and Auth emulators (`demo-qampus`) for destructive and edge-case tests |

| Device / client | Used for |
| --- | --- |
| Android emulator, Pixel_8 AVD, 1080×2400, Android with Google Play | Mobile app, signed out and signed in (student `2514779`) |
| Chrome-based browser pane at 375, 700 and 1280 px | Staff console signed in as Registrar staff; public display |
| Node test scripts against the emulators | Rules, backend logic, races, clock skew, day rollover |

---

## 3. Test approach and coverage

| Method | What it covered |
| --- | --- |
| Automated suites | 93 unit tests, lint, 11 rules checks, security suite (38 controls, 7 flows, 10 known gaps) |
| Edge-case probes (`packages/backend/rules-test/qa-attempt1.mjs`) | 16 emulator scenarios: long names, cancel race, day rollover, clock skew, double call, ticket limit, three calls at once |
| Code review | Ticket service, preflight, derive, identity, penalties, mobile hooks and screens, staff provider |
| Live read-only | Hosting headers and bundle, EAS update list, relay endpoint, every student and staff screen |
| Live writes (with the developer's approval) | Joins, cancels, calls, check-ins, staff verify, completes, queue open/close/cancel at Registrar |

**Not covered:**
- **iOS:** no device.
- **Push delivery:** notification permission was off on the test install.
- **Reading the QR with the camera.**
- **Guest account creation on live:** it would create real accounts.
- **Offense flows on live (no-show, cancel after call, ban, revoke):** these were tested only on the emulators, to keep the developer's account clean.
- **FIFO override:** it needs a second student.
- **Cutoff override.**
- **A real (non-emulated) phone.**

---

## 4. Test execution summary

| Run | Focus | Result |
| --- | --- | --- |
| Attempt 1 | Edge-case deep dive, baseline regression | Suites pass; BUG-001 to BUG-011 found |
| Attempt 2 | Fix verification, regression sweep | No fixes delivered; all reproduce; BUG-012 to BUG-015 found |
| Attempt 3 | Final smoke and acceptance | Smoke passes; verdict FAIL |
| 3b | Signed-in student app (read-only) | BUG-002 seen live; BUG-016 found |
| 3c | Signed-in staff console (read-only) | BUG-017, BUG-018 found |
| 3d | Live end-to-end ticket | Pass with the app on screen; BUG-019 after backgrounding; BUG-020 found |
| Full test | 15 live cases (offline, cold start, background, verify, codes, theme, log) | All pass except BUG-007 (live); BUG-021 found |
| Ticket limit | Four offices, live and emulator | Pass |
| Simultaneous calls | Three offices call one student (emulator) | BUG-022, BUG-023 found |

---

## 5. Results by area

### 5.1 Student app (Android)

| Area | Result | Notes |
| --- | --- | --- |
| Onboarding, Login, legal pages (incl. 200% font) | Pass | BUG-015 (footer at 200%) |
| Guest form validation (empty name, bad email, no type) | Pass | BUG-003: no name length limit |
| Google sign-in (institutional account) | Pass | |
| Home: tickets, Now serving, operating hours | Pass | BUG-002 (stale tickets), "0 mins" (known) |
| Queue tab: open/closed, Join reasons | Pass | |
| Join: confirm, triple tap | Pass | One ticket only; BUG-020 copy |
| Three-ticket limit, one per office | Pass | Live and on the server rules |
| Cancel while waiting | Pass | No penalty; staff see it at once |
| "It's your turn" dialog | Pass with the app on screen | BUG-019 after backgrounding; one ticket shown at a time |
| Check-in by code: right, wrong, not called | Pass | BUG-022 with several calls |
| History, Notifications, unread dot | Pass | No completion notification (known) |
| Bans & Warnings, Settings, Edit Profile, Help | Pass | BUG-016 (Queue History link) |
| Offline while waiting | Pass | Update arrived 7 s after reconnecting; BUG-021 (no offline sign) |
| App killed while waiting | Pass | Call shown about 11 s after a cold start |
| Dark theme, 130% font | Pass | |

### 5.2 Staff console (web)

| Area | Result | Notes |
| --- | --- | --- |
| Sign-in page, legal pages, 375–1280 px | Pass | |
| Open, close, cancel queue (with reason) | Pass | |
| Call next, verify by ID (right, wrong, Enter key), complete | Pass | BUG-007 (double-click), BUG-008 |
| Offenses screen | Pass on counts | BUG-017 (wrong ban state) |
| Activity Log | Pass | Every action logged; student vs staff actor told apart |
| Phone width (375 px) | Pass | No sideways scroll |
| Caching after deploy | Pass | Known Hosting cache issue fixed and verified |
| Unknown URL | Fail (Low) | BUG-010 |

### 5.3 Public display

| Area | Result | Notes |
| --- | --- | --- |
| Live QR, manual code, Next list, Now serving | Pass | |
| Closed state | Pass with BUG-018 | |
| Unknown office code | Pass | |

### 5.4 Backend, rules and security

| Area | Result | Notes |
| --- | --- | --- |
| Atomic ticket writes, unique numbers | Pass | Double calls and races cannot double-call or double-penalize |
| Waiting list (`waiting_seqs`) | Pass | 11/11 |
| Security controls | Pass | 38/38 refused, 7/7 flows accepted |
| Known security gaps | Open | 10/10 (G3–G18), see STATUS |
| Day rollover | Fail | BUG-001, BUG-002 |
| Clock skew | Fail | BUG-005, BUG-006 |
| Push relay | Pass | Preflight 204 from the hosted origin; unsigned push refused 401 |

---

## 6. Defect summary

| ID | Severity | Category | Title | Evidence |
| --- | --- | --- | --- | --- |
| BUG-019 | **Critical** | Edge Case | Call reaches the phone about 55 s late after the app returns from the background; student sees "Expired" at once | Live, 1 of 2 runs |
| BUG-001 | Major | Edge Case | Ticket left CALLED/IN_SERVICE past the campus day can never be finished; office locked for the student | Emulator, 4/4 runs |
| BUG-002 | Major | Edge Case | Old WAITING ticket shows today's numbers and blocks joining | **Live account** |
| BUG-003 | Major | Edge Case | Guest name over 100 characters: every join refused with "check your connection" | Emulator + device |
| BUG-004 | Major | Edge Case | A confirmed free cancel becomes a strike if the ticket is called meanwhile | Emulator, 4/4 runs |
| BUG-005 | Major | Edge Case | Phone clock off by a minute or more breaks the 60 s check-in | Code |
| BUG-006 | Major | Edge Case | Staff PC clock off by more than 30 min: ban no-show refused, window blocked | Emulator, 4/4 runs |
| BUG-022 | Major | Edge Case | With several tickets called, check-in only works for the first one in the list | Emulator |
| BUG-023 | Major | Edge Case (design) | Being called by two offices at once ends in an automatic 24-hour ban | Emulator |
| BUG-007 | Minor | Edge Case | Double Call next shows a false "not accepted" banner | **Live** + emulator |
| BUG-008 | Minor | Edge Case | Verify by ID says "no match" for any error | Code |
| BUG-009 | Minor | Edge Case | Revoking an old ban-causing offense lifts the current ban | Code |
| BUG-012 | Minor | Edge Case | Guest sign-out leaves ghost tickets in queues | Code |
| BUG-013 | Minor | Edge Case | Biometric unlock eats into the 60 s check-in | Code |
| BUG-014 | Minor | Edge Case | Check-in racing a staff verify says "time ran out" | Code |
| BUG-016 | Minor | Regression | Profile › Queue History opens Join (shipped fix never committed) | **Live** |
| BUG-017 | Minor | Edge Case | Staff Offenses screen shows bans that do not exist | **Live** |
| BUG-021 | Minor | Edge Case | No sign that the app is offline | **Live** |
| BUG-010 | Low | Edge Case | Expo "Unmatched Route" page with Sitemap on the live console | Live |
| BUG-011 | Low | Known Bug | Security gap G18 not listed in STATUS | Suite |
| BUG-015 | Low | Edge Case | Login footer touches the gesture bar at 200% font | Device |
| BUG-018 | Low | Edge Case | Display says "opens again at 08:00" after 08:00, no day | Live |
| BUG-020 | Low | Edge Case | Join confirmation says "Your R queue ticket" | Live |

---

## 7. Known issues from `docs/STATUS.md`: re-test results

| Known issue | Result |
| --- | --- |
| Hosting caches the console page (blank after a deploy) | **Fixed, verified live** |
| `waiting_seqs` rollout | **Deployed** (Hosting and EAS); final step (drop `seqsKept()` from the rules) still open |
| Staff Revoke refused on the live rules | **Fixed**: a revoke went through on live (R-11-05-015) |
| "0 mins" / "1 mins" | **Still present** (live) |
| Office card tap on Home does nothing when closed or banned | **Still present** (live) |
| Primary button in phone dialogs shows a grey square | **Still present** (live, "Done" on "You're checked in") |
| Camera prompt returns | **Still present**: the in-app prompt returned on Scan after an app restart |
| First tap on "Type the code instead" ignored | **Not reproduced** from the Scan tab |
| Contact Support has no recipient | **Still present** (code; opens Gmail) |
| No completion notification | **Still present** (live) |
| Joins accepted before opening time | **Still present** (code) |
| Office cancel on an already closed queue: no log line, list not emptied | **Still present** (code) |
| Security gaps (10) | **Still open** (10/10) |
| No anti-framing header on Hosting | **Still present** (live headers) |

---

## 8. Detailed bug reports

Common environments: **[EMU]** Firestore and Auth emulators with the repo rules and backend at `b54b58f`.
**[AND]** Android emulator, Pixel_8 AVD, 1080×2400, APK 2026-11-05 + EAS `preview` `046e9eb4`. **[WEB]** live
`qampus-staff.web.app`, Chrome-based browser.

### BUG-019: Call arrives about 55 s late after the app returns from the background
- **Category:** Edge Case · **Severity:** Critical
- **Environment:** [AND] + [WEB], live project
- **Preconditions:** Student holds a WAITING ticket.
- **Steps to Reproduce:**
  1. 09:04:10: press the phone's Home button.
  2. 09:04:18: staff press Call Next; the console starts the 60 s countdown at once.
  3. 09:04:22: reopen the app and watch Home.
- **Expected Result:** Within seconds Home shows "YOUR TURN" with about 55 s left and the "It's your turn" dialog opens.
- **Actual Result:** Home kept showing "Waiting / NEXT UP" (and a tap on Scan did not register) until about 09:05:17, then jumped to "0:00 · Expired". The student never had a chance to check in. Intermittent: a later run with 16 s in the background arrived on time (0:56 left). With the app on screen the call arrived in time.
- **Workaround (if any):** Staff verify by ID, or cancel the queue to avoid the offense. Keep the app on screen.
- **Suspected cause (not confirmed):** the Firestore web SDK listener stalls after backgrounding (`apps/mobile/src/lib/firebase.js` uses `getFirestore` with default transport on React Native). Push is the intended backup and was not testable.

### BUG-001: A ticket left CALLED or IN_SERVICE past the campus day can never be finished
- **Category:** Edge Case · **Severity:** Major
- **Environment:** [EMU] (probe E3)
- **Preconditions:** A ticket is IN_SERVICE (or CALLED) when the campus day ends.
- **Steps to Reproduce:**
  1. Staff call and verify a ticket; leave it unfinished past midnight.
  2. Staff press Complete.
  3. The student tries to cancel it, then to join the same office.
- **Expected Result:** Some path ends the old ticket, and the student can join again.
- **Actual Result:** Complete is refused (`NOT_IN_SERVICE`: the console only uses today's queue), cancel is refused (`TICKET_UNAVAILABLE`), and the join is refused (`ALREADY_QUEUED`). The ticket holds one of the three slots for ever. No screen can fix it.
- **Workaround (if any):** Edit the ticket and the user's `active_count` / `active_offices` in the Firebase console.

### BUG-002: An old WAITING ticket shows today's numbers and blocks joining
- **Category:** Edge Case · **Severity:** Major
- **Environment:** [AND] signed in, live; [WEB]
- **Preconditions:** Staff close a queue with people still waiting (issued tickets stay valid).
- **Steps to Reproduce:**
  1. Join three offices; the day ends without being called.
  2. Next day, open Home and the Queue tab.
- **Expected Result:** Old tickets are shown as expired (or cancelled at the end of the day), and the student can join.
- **Actual Result:** Seen on the live account: M-021, R-016 and S-005 from the day before showed "NEXT UP" with "0 mins" and "20 mins". S-005 said "5 in line, 4 people ahead" while the office showed "0 waiting". Every Join was disabled ("You already hold 3 active tickets"). Staff cannot see these tickets (the console lists only today's).
- **Workaround (if any):** The student cancels each old ticket from Home (free while waiting).

### BUG-003: Guest name over 100 characters: every join refused
- **Category:** Edge Case · **Severity:** Major
- **Environment:** [EMU] (probe E1) + [AND] guest form
- **Preconditions:** Continue as guest.
- **Steps to Reproduce:**
  1. Type a name of 101+ characters (the field accepted 143 on the device).
  2. Continue, then join any open office.
- **Expected Result:** The form caps the name at 60 characters (as Edit Profile does), or the join works.
- **Actual Result:** The profile is saved but the join is refused (`DENIED`): every ticket write logs an event whose `actor_name` the rules cap at 100. The student sees "The queue didn't accept your ticket. Check your connection and try again". A short name joins fine.
- **Workaround (if any):** Shorten the name in Edit Profile.

### BUG-004: A confirmed free cancel becomes a strike if the ticket is called meanwhile
- **Category:** Edge Case · **Severity:** Major
- **Environment:** [EMU] (probe E2)
- **Preconditions:** WAITING ticket at the front of the line.
- **Steps to Reproduce:**
  1. Open the ticket › Cancel: the dialog says the cancel is free.
  2. Staff call the ticket before Confirm.
  3. Tap Confirm.
- **Expected Result:** The cancel is refused, or the student is asked again.
- **Actual Result:** It goes through as a cancel-after-call: `strike_count` 1 and an offense recorded. `cancelOwnTicket` re-reads the status and takes the penalty path without checking what the student confirmed.
- **Workaround (if any):** Staff revoke the offense.

### BUG-005: A wrong phone clock breaks the 60-second check-in
- **Category:** Edge Case · **Severity:** Major
- **Environment:** Mobile code (`getRemainingSeconds(called_at, Date.now())` versus the rules' `request.time`)
- **Preconditions:** Phone clock off by a minute or more.
- **Steps to Reproduce:**
  1. Set the phone clock 2 minutes fast.
  2. Get called; enter the right code within 60 s.
- **Expected Result:** Check-in succeeds; the countdown follows server time.
- **Actual Result:** The countdown starts at 0 and the app refuses locally ("time ran out"), which ends in a no-show and a strike. With the clock slow, the countdown shows time left but the server refuses.
- **Workaround (if any):** Automatic date and time on the phone.

### BUG-006: Staff PC clock off by more than 30 minutes blocks a ban no-show
- **Category:** Edge Case · **Severity:** Major
- **Environment:** [EMU] (probe E4)
- **Preconditions:** Staff PC 45 min fast; the called student already has one strike.
- **Steps to Reproduce:**
  1. Call the student; let the grace period end.
  2. Press No-show.
- **Expected Result:** The no-show and the 24-hour ban are recorded.
- **Actual Result:** Refused (`DENIED`): the app computes `banned_until` from the PC clock and the rules accept only ±30 min of server time + 24 h. The ticket stays at the window, blocking Call Next; the banner says to check the connection. The PC clock also skews the measured visit length.
- **Workaround (if any):** Fix the PC clock and retry.

### BUG-022: With several tickets called, check-in only works for the first one in the list
- **Category:** Edge Case · **Severity:** Major
- **Environment:** [EMU] (probe E7, three offices with codes 111111 / 222222 / 333333); `apps/mobile/src/hooks/useCheckIn.js`
- **Preconditions:** Tickets at Offices F, G, H are CALLED at once.
- **Steps to Reproduce:**
  1. Go to Office H's counter.
  2. Type H's code 333333 (or scan H's QR).
- **Expected Result:** Checked in at Office H.
- **Actual Result:** The app takes the first called ticket in list order (F) and checks H's code against it, answering "That code doesn't match your office" (QR: "wrong office"). Sending the same code for the H ticket directly is accepted, so only the app's choice is wrong.
- **Workaround (if any):** H's staff use Verify by ID.

### BUG-023: Being called by two offices at once ends in an automatic 24-hour ban
- **Category:** Edge Case (design) · **Severity:** Major
- **Environment:** [EMU] (probe E7)
- **Preconditions:** Three tickets (allowed by R-07); offices call within the same minute.
- **Steps to Reproduce:**
  1. Three offices call the same student at once.
  2. The student serves one; the other two expire and are marked no-show.
- **Expected Result:** No penalty for what nobody could do (be at two counters within 60 s).
- **Actual Result:** Strike, then a 24-hour ban (`banned_until` set).
- **Workaround (if any):** Staff revoke the offenses.

### BUG-007: Double Call next shows a false "not accepted" banner
- **Category:** Edge Case · **Severity:** Minor
- **Environment:** [WEB] live (T6c) + [EMU] (probe E5)
- **Preconditions:** Someone waiting.
- **Steps to Reproduce:**
  1. Double-click Call Next.
- **Expected Result:** One call, no error (button disabled while in flight).
- **Actual Result:** The ticket is called and the banner says "Couldn't call the next ticket. The change was not accepted. Check your connection and try again." The same wording appears when two joins race at the three-ticket limit (probe E6c).
- **Workaround (if any):** Ignore the banner.

### BUG-008: Verify by ID says "no match" for any error
- **Category:** Edge Case · **Severity:** Minor
- **Environment:** `apps/staff/src/providers/QueueProvider.jsx` (`verifyById`)
- **Preconditions:** A ticket is called; the network drops or the write is refused.
- **Steps to Reproduce:**
  1. Go offline and verify with the correct ID.
- **Expected Result:** A connection error.
- **Actual Result:** Every error except GRACE_EXPIRED maps to "ID doesn't match". No-show maps every other error to "invalid state".
- **Workaround (if any):** None.

### BUG-009: Revoking an old ban-causing offense lifts the current ban
- **Category:** Edge Case · **Severity:** Minor
- **Environment:** `packages/backend/src/penalties/progress.js` (`revokeEffect`)
- **Preconditions:** A student has a past ban and a running ban.
- **Steps to Reproduce:**
  1. Revoke the offense that caused the first, expired ban.
- **Expected Result:** The running ban is unchanged.
- **Actual Result:** `banned_until: null, strike_count: 1` is written, whichever ban is running.
- **Workaround (if any):** Revoke only the offense behind the current ban.

### BUG-012: Guest sign-out leaves ghost tickets in queues
- **Category:** Edge Case · **Severity:** Minor
- **Environment:** `apps/mobile/src/providers/SessionProvider.jsx` (`signOut`)
- **Preconditions:** A guest holds WAITING tickets.
- **Steps to Reproduce:**
  1. Sign out as the guest and accept the warning.
  2. Staff call next.
- **Expected Result:** Sign-out cancels the guest's tickets (the account can never return).
- **Actual Result:** The tickets stay WAITING; each must be called, time out (60 s) and be marked no-show, which also records an offense on a dead account.
- **Workaround (if any):** Staff override past the ghost number.

### BUG-013: Biometric unlock eats into the 60-second check-in
- **Category:** Edge Case · **Severity:** Minor
- **Environment:** `apps/mobile/src/providers/BiometricProvider.jsx`
- **Preconditions:** Biometric unlock on; app in the background over 1 minute.
- **Steps to Reproduce:**
  1. Get called; tap the "It's your turn" push.
- **Expected Result:** The called ticket is reachable at once, or the grace period allows for the unlock.
- **Actual Result:** The lock screen and biometric prompt come first; a failed read uses up the seconds left.
- **Workaround (if any):** Keep biometric unlock off.

### BUG-014: Check-in racing a staff verify says "time ran out"
- **Category:** Edge Case · **Severity:** Minor
- **Environment:** Mobile Scan + staff Verify (`startService` is a plain write; rules accept only CALLED → IN_SERVICE)
- **Preconditions:** Ticket CALLED.
- **Steps to Reproduce:**
  1. Staff verify by ID while the student submits the code in the same second.
- **Expected Result:** "You're checked in".
- **Actual Result:** "Check-in wasn't accepted. Your time may have just run out", though the ticket is in service.
- **Workaround (if any):** Home shows the right state a moment later.

### BUG-016: Profile › Queue History opens Join instead of History
- **Category:** Regression · **Severity:** Minor
- **Environment:** [AND] signed in
- **Preconditions:** Signed in.
- **Steps to Reproduce:**
  1. Avatar › Queue History.
- **Expected Result:** Queue tab on History.
- **Actual Result:** Queue tab on Join. The link is plain `/queue` (`constants/content.js:184`). An EAS update a week earlier ("Fixed Navigation from profile's show history…") shipped a fix that was never committed to git, so a later update from `main` removed it.
- **Workaround (if any):** Tap the History segment.

### BUG-017: Staff Offenses screen shows bans that do not exist
- **Category:** Edge Case · **Severity:** Minor
- **Environment:** [WEB] Registrar + [AND] same student
- **Preconditions:** A student has unrevoked offenses at one office far apart in time.
- **Steps to Reproduce:**
  1. Open Offenses; read "Currently banned users" and the labels.
  2. Compare with the student's Bans & Warnings.
- **Expected Result:** Same ban state as the student's profile (`strike_count`, `banned_until`).
- **Actual Result:** The console counted 4 banned users including this student and labelled R-11-05-013 "Caused a 24-hour ban"; the phone showed 1 offense and no ban. `apps/staff/src/utils/penalties.js` recalculates bans by pairing offenses instead of reading the profile.
- **Workaround (if any):** Check the student's own screen.

### BUG-021: No sign that the app is offline
- **Category:** Edge Case · **Severity:** Minor
- **Environment:** [AND] signed in, live
- **Preconditions:** WAITING ticket.
- **Steps to Reproduce:**
  1. Turn off Wi-Fi and data; staff call the ticket.
- **Expected Result:** A banner such as "You're offline. Your ticket won't update until you reconnect."
- **Actual Result:** Home keeps showing "NEXT UP · Waiting" as if live; the call appears only after reconnecting (7 s later in the test).
- **Workaround (if any):** None.

### BUG-010: Expo "Unmatched Route" page on the live console
- **Category:** Edge Case · **Severity:** Low
- **Environment:** [WEB]
- **Preconditions:** None.
- **Steps to Reproduce:**
  1. Open `https://qampus-staff.web.app/does-not-exist`.
- **Expected Result:** A branded "Page not found" page.
- **Actual Result:** "Unmatched Route" with a "Sitemap" link that lists every route.
- **Workaround (if any):** None needed.

### BUG-011: Security gap G18 not listed in STATUS
- **Category:** Known Bug · **Severity:** Low
- **Environment:** `npm run test:security`
- **Preconditions:** None.
- **Steps to Reproduce:**
  1. Run the security suite.
- **Expected Result:** Every reported gap is in `docs/STATUS.md`.
- **Actual Result:** G18 (staff can reopen yesterday's queue doc) is reported but not listed.
- **Workaround (if any):** n/a

### BUG-015: Login footer touches the gesture bar at 200% font
- **Category:** Edge Case · **Severity:** Low
- **Environment:** [AND], font scale 2.0
- **Preconditions:** Signed out.
- **Steps to Reproduce:**
  1. Largest font size; open Login.
- **Expected Result:** Footer above the gesture bar, or the screen scrolls.
- **Actual Result:** "Privacy Policy" wraps onto a line touching the home indicator; no scroll.
- **Workaround (if any):** Smaller font.

### BUG-018: Display says "opens again at 08:00" after 08:00
- **Category:** Edge Case · **Severity:** Low
- **Environment:** [WEB] `/display/R`, Friday 08:59, hours 08:00–17:00, queue not opened yet
- **Preconditions:** Queue closed during or after hours.
- **Steps to Reproduce:**
  1. Open the display.
- **Expected Result:** "Not open yet", or the next opening with its day.
- **Actual Result:** "It opens again at 08:00." It uses today's opening time, not `nextOpening`, and never names the day.
- **Workaround (if any):** None needed.

### BUG-020: Join confirmation shows the office code
- **Category:** Edge Case · **Severity:** Low
- **Environment:** [AND] signed in, live
- **Preconditions:** Registrar open.
- **Steps to Reproduce:**
  1. Queue › Office of the Registrar › JOIN › Confirm join.
- **Expected Result:** "Your ticket for Office of the Registrar has been issued."
- **Actual Result:** "Your R queue ticket has been issued."
- **Workaround (if any):** None needed.

---

## 9. What is handled well
- Every ticket change is one atomic write checked by the rules. Two staff calling at once, a no-show racing a cancel, or two joins at the limit can never double-call, double-penalize or exceed three tickets.
- Ticket numbers never repeat; the three-ticket and one-per-office limits hold on the phone and on the server.
- The app recovers from going offline (7 s) and from a cold start (about 11 s) during a call.
- Wrong codes, wrong IDs and early check-ins get clear messages.
- The staff console and both apps stay in step within seconds; the Activity Log records every action with the right actor.
- Dark theme, 130–200% fonts and 375 px staff screens lay out without clipping.
- Removing phone biometrics does not lock the student out.

## 10. Recommended fix order
1. **BUG-019:** find why the listener stalls after backgrounding (try `experimentalAutoDetectLongPolling` or reconnect on `AppState` active), and test push as the backup.
2. **BUG-022:** in `useCheckIn`, match the typed code or QR office to the called ticket of that office.
3. **BUG-003:** `maxLength={60}` on the guest name.
4. **BUG-004:** pass the status the student confirmed into `cancelOwnTicket` and refuse if it changed.
5. **BUG-001 / BUG-002:** end-of-day cleanup (close, or the next day's open, cancels the previous day's unfinished tickets without penalty).
6. **BUG-023:** decide the rule (hold calls while the student is called elsewhere, or waive those no-shows).
7. **BUG-005 / BUG-006:** measure the server-clock offset once and use it for the countdown, the cutoff and `banned_until`.
8. **BUG-007 / BUG-008 / BUG-021:** busy guards on staff buttons, real error messages, an offline banner.
9. **Process:** publish EAS updates only from committed code (BUG-016).

## 11. Test data left on the live project
- Registrar tickets R-11-06-007 to 013 (completed, cancelled by office, or cancelled while waiting), and one cancelled ticket each at Medical (M-001), Student Affairs (O-001) and Student Accounting (S-001). Registrar was opened and closed several times and cancelled once (reason "QA end-to-end test run").
- The student's three stale tickets from 2026-11-05 (M-021, R-016, S-005) were cancelled.
- **No offenses were created** on any live account.
- Emulator: camera permission was granted to Qampus by a mis-tap; theme and font size were restored.

## 12. How to rerun
```bash
npm test --workspace @qampus/backend
npm run lint
npm run test:rules
npm run test:security
firebase emulators:exec --only firestore,auth --project demo-qampus "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON packages/backend/rules-test/qa-attempt1.mjs"
```
The probe script prints E1–E7. After fixes, the expected changes are: E1b OK, E2b REFUSED, E3a OK, E4a OK, E5 without
a refusal in the UI, E7c OK.
