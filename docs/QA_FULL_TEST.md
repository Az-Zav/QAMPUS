# QA Full Test (live, 2026-11-06 09:37–09:50 campus time)

_Builds: APK from 2026-11-05 + EAS `preview` `046e9eb4` on the Android emulator (Pixel_8 AVD), signed in as student
E.J. BAGAYAN (2514779); live staff console `qampus-staff.web.app` signed in as Registrar staff. Earlier attempts:
`QA_ATTEMPT_1.md`, `QA_ATTEMPT_2.md`, `QA_FINAL_REPORT.md`._

## Verdict: **FAIL** (unchanged)

Every flow that can run without an offense passed live, including offline recovery, a cold start, a 16-second
background, staff Verify by ID and wrong-code handling. The verdict stays FAIL because the open Critical/Major bugs
are unchanged (no fixes were delivered). **BUG-019 is intermittent:** it did not reproduce in this run's background
test, after reproducing once earlier today.

## Automated suites
| Suite | Result |
| --- | --- |
| Unit tests | 93/93 pass |
| Lint (mobile, staff, core) | Pass |
| Rules (waiting list) | 11/11 pass |
| Security | 38/38 controls refused, 7/7 flows accepted, 10/10 known gaps still open |
| Edge-case probes (`qa-attempt1.mjs`) | 13/13 give the same results as Attempt 1 (bugs still present) |

## Live test cases

| # | Case | Steps | Result |
| --- | --- | --- | --- |
| T1 | Rapid triple tap on Confirm join | Queue › Registrar › JOIN › tap Confirm 3× fast | **Pass**: one ticket (R-009), console "1 waiting" |
| T2 | Public display with a waiting ticket | `/display/R` | **Pass**: QR, code 082 607, "Waiting for the next ticket", NEXT R-009 |
| T3 | Check in before being called | Scan › right code while WAITING | **Pass**: "You don't have a ticket being called right now." |
| T4 | Call after 16 s in the background (BUG-019 repeat) | Home key 09:40:34, Call Next 09:40:49, reopen 09:40:50 | **Pass this time**: "It's your turn" with 0:56 left by 09:40:55 |
| T4b | Staff Verify by ID, wrong then right ID | 1111111, then 2514779 | **Pass**: "That ID doesn't match this ticket. Nothing has changed"; then In service; phone's dialog closes by itself and Home shows "In service" |
| T5 | Offline while waiting, then call | Wi-Fi and data off 09:42:47, Call Next 09:43:02, back online 09:43:11 | **Pass**: call shown at 09:43:18 (7 s after reconnect) with 0:44 left. **BUG-021**: no sign of being offline |
| T5b | Verify by ID with Enter key | Type ID, press Enter | **Pass** |
| T6 | App killed while waiting, then call | Force-stop 09:45:00, Call Next 09:45:20, cold start 09:45:22 | **Pass**: called dialog within about 11 s of the cold start |
| T6b | Wrong check-in code, then right code | 123456, then 082607 | **Pass**: "That code doesn't match your office."; then "You're checked in" (09:46:14, 6 s before the deadline) |
| T6c | Staff double-click Call Next | Double-click | **BUG-007 confirmed live**: R-011 was called and the banner said "Couldn't call the next ticket. The change was not accepted. Check your connection and try again." The Activity Log shows one call |
| T7 | Dark theme + 130% font with a ticket on Home | Settings › Dark; font 1.3 | **Pass**: readable, nothing clipped |
| T7b | Cancel a WAITING ticket | Home › R-012 › Cancel ticket › confirm | **Pass**: no penalty; console "0 waiting" within seconds |
| T7c | Notifications and bell dot | Open Notifications, go back | **Pass**: list complete and ordered; unread dot cleared |
| T8 | Activity Log accuracy | Compare with the actions above | **Pass**: every join, call, start, complete, cancel, open, close and the queue cancel (with reason) is there; student check-in vs staff verify are told apart by actor |
| T9 | Complete and close | Mark as served ×3; Close queue | **Pass**: the window clears each time; Registrar closed at the end |

## Ticket limit (R-07: three active tickets), 09:50–09:56

All four offices were open (Medical, Student Affairs and Student Accounting by other staff, Registrar by me).

| # | Case | Result |
| --- | --- | --- |
| L1 | Join Medical, Student Affairs, Student Accounting | **Pass**: M-001, O-001, S-001 on Home, each "NEXT UP · Waiting" |
| L2 | Try the fourth office (Registrar) | **Pass**: Join button disabled (`enabled=false`) with "You already hold 3 active tickets." The three joined offices say "You already have an active ticket here." |
| L3 | Cancel one (M-001), then look at Registrar | **Pass**: the slot is released at once; Registrar's Join is enabled with no reason; Medical's count drops to 0 waiting |
| L4 | Join Registrar as the new third ticket | **Pass**: R-013; Medical now shows "You already hold 3 active tickets." |
| L5 | Cancel all three (each still WAITING) | **Pass**: no penalty; Home "No active tickets" |
| E6a | Emulator: fourth join through the app code | **Pass**: refused with `LIMIT_REACHED` |
| E6b | Emulator: hand-made fourth join that skips the app check | **Pass**: refused by the rules (`permission-denied`) |
| E6c | Emulator: two joins sent at the same moment while holding two | **Pass on the limit** (one joined, one refused, `active_count` ends at exactly 3). **Wording issue:** the refused join gets `DENIED`, which the phone shows as "The queue didn't accept your ticket. Check your connection and try again", instead of the limit message (same pattern as BUG-007). Rare: needs two joins within the same moment |

Still open on the limit: known gap G4 (a hand-made client can lower its own counter and take more tickets).

## Three tickets called at the same time

Not testable live: it needs staff at three offices, and this session only has the Registrar staff login. Tested on the
Firestore and Auth emulators with the repo rules and the real backend code (`qa-attempt1.mjs` E7), three offices with
different check-in codes (F 111111, G 222222, H 333333), plus a reading of the app code.

| # | Case | Result |
| --- | --- | --- |
| E7a | Student holds F, G, H; all three staff press Call at once | All three calls succeed (each office's window is independent) |
| E7b | Which ticket the app works with | The app picks the **first CALLED ticket in list order** (F), not the office the student is at |
| E7c | Student at Office H types H's correct code | **Refused: `INVALID_CODE`** ("That code doesn't match your office") → **BUG-022** |
| E7d | Same code sent for the H ticket directly | Accepted (`IN_SERVICE`): the server is fine, only the app's choice is wrong |
| E7e/f | F and G expire; both offices mark no-show | Strike, then a **24-hour ban** on the second → **BUG-023** |
| Code | "It's your turn" dialog (`app/(app)/_layout.jsx:28`) | Shows only the first called ticket; the next one appears only after that one is dismissed. Nothing tells the student that three offices are calling |

### BUG-022
- **Category:** Edge Case
- **Severity:** Major
- **Title:** With two or more tickets called, the student can only check in to the first one in the list, whichever counter they are at
- **Environment:** Mobile app code (`apps/mobile/src/hooks/useCheckIn.js`); reproduced on the emulators (E7c)
- **Preconditions:** The student's tickets at two or more offices are CALLED at once
- **Steps to Reproduce:**
  1. Hold tickets at Offices F, G and H; all three call.
  2. Go to Office H's counter.
  3. Type H's code on Scan (or scan H's QR).
- **Expected Result:** Checked in at Office H: the app matches the code (or the QR's office) to the called ticket of that office.
- **Actual Result:** `useCheckIn` takes the first called ticket still in its grace period (F here, by list order) and checks H's code against F's office: typed code → "That code doesn't match your office"; QR → "wrong office". The student cannot check in where they are standing.
- **Workaround (if any):** Ask H's staff to use Verify by ID (it acts on H's own ticket).

### BUG-023
- **Category:** Edge Case
- **Severity:** Major (design)
- **Title:** A student called by two or more offices at once is automatically banned for 24 hours
- **Environment:** Rules and backend (E7e/f)
- **Preconditions:** Three tickets (allowed by R-07), offices call within the same minute
- **Steps to Reproduce:**
  1. Three offices call the same student within a minute.
  2. The student serves one; the other two run out and are marked no-show.
- **Expected Result:** A student is not punished for something no one could do (be at two counters within 60 s): for example, calls are held while the student has another ticket CALLED/IN_SERVICE, or a no-show is waived when the student was in service elsewhere.
- **Actual Result:** First no-show = strike, second = 24-hour ban (`banned_until` set), although the student checked in at the office they reached.
- **Workaround (if any):** Staff revoke the offenses afterwards.

## New bug

### BUG-021
- **Category:** Edge Case
- **Severity:** Minor
- **Title:** The app gives no sign when it is offline, so a waiting student does not know updates have stopped
- **Environment:** Android emulator (Pixel_8 AVD), APK 2026-11-05 + `046e9eb4`, signed in
- **Preconditions:** Student holds a WAITING ticket
- **Steps to Reproduce:**
  1. Turn off Wi-Fi and mobile data.
  2. Staff call the ticket.
  3. Look at Home.
- **Expected Result:** A banner such as "You're offline. Your ticket won't update until you reconnect."
- **Actual Result:** Home keeps showing "NEXT UP · Waiting · 0 mins" as if live. The call appears only after reconnecting (7 s later in the test). Combined with the 60 s grace period, a student on bad signal can miss the call without knowing why.
- **Workaround (if any):** None in the app.

## Status changes from this run
| Bug | Change |
| --- | --- |
| BUG-019 | Intermittent: 1 of 2 background runs today; not seen after 16 s in the background |
| BUG-007 | Confirmed live (was emulator-only) |
| Known: camera prompt returns | Seen again: the in-app "Allow camera access?" prompt returned on the Scan tab after the app was restarted |

## Side effects of this run (for you to know)
- Live data: Registrar tickets R-11-06-009 to 012 (3 completed, 1 cancelled while waiting), queue opened and closed
  twice today. No offenses were created.
- Emulator: **camera permission is now granted** for Qampus (a mis-tap on the system prompt; revoke it in App info ›
  Permissions if you want the denied path tested). Theme set back to Light and font to 100%.

## Still not covered
Push delivery (notification permission is off on this install), the QR read with the camera, guest flows (create real
accounts), offense flows (no-show, cancel after call, revoke, ban; they would put offenses on your account), FIFO
override (needs a second student), cutoff override, iOS.
