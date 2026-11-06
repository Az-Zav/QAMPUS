# QA Attempt 1: Deep-dive and edge cases

_Date: 2026-11-06. Tester: Claude (QA lead role). Build under test: `main` at `b54b58f`; live staff Hosting
(`qampus-staff.web.app`, bundle `entry-6ca97dfa…`); EAS `preview` update group `046e9eb4` (Android, runtime 1.0.0)._

## How this attempt was run

| Method | What it covered |
| --- | --- |
| `npm test` (backend) | 93 unit tests: ids, derive, preflight, cutoff, waiting list, penalties, notifications |
| `npm run test:rules` | 11 waiting-list rule checks on the Firestore and Auth emulators |
| `npm run test:security` | 38 attack cases, 7 app flows, 10 known gaps on the emulators |
| `npm run lint` | mobile, staff, core (legal dates) |
| `packages/backend/rules-test/qa-attempt1.mjs` (new, untracked) | 13 edge-case probes on the emulators, results below |
| Live checks (read-only) | Hosting headers and bundle contents with `curl`; `eas update:list` on `preview` |
| Browser pane | Staff sign-in, legal pages, unknown routes on the live site at 375, 700 and 1280 px |
| Code reading | Ticket service, preflight, derive, identity, penalties, mobile Home/Scan/hooks, staff QueueProvider |

**Not covered (no device here):** the mobile app on a phone or emulator (no `adb` device was attached), network
loss and switching, low storage, app kill and resume, camera, biometrics, push, iOS. The signed-in staff console was
not driven (it needs your Google sign-in on the live project; the apps have no emulator mode).

## Regression results

| Area | Result |
| --- | --- |
| Unit tests (93) | Pass |
| Rules checks (11) | Pass |
| Security controls (38 refused) and app flows (7 accepted) | Pass |
| Lint (mobile, staff, core) | Pass |
| Staff sign-in page at 375, 700 and 1280 px | Pass: logo above the title below the split breakpoint; Google button with icon; no console errors |
| Staff legal pages at 375 px | Pass: no horizontal scroll |
| Protected route while signed out (`/queue`) | Pass: redirects to sign-in |
| Live Hosting cache headers | Pass: page `no-cache`; bundles `max-age=31536000, immutable`; missing bundle is a 404 |

## Known bugs: re-test status

You said these were fixed. The code in this checkout (and on every branch, newest commit `b54b58f`) still has most of
them. If the fixes are elsewhere (another folder, another machine, not pushed), they were not tested here.

| Known bug | Status | Evidence |
| --- | --- | --- |
| Hosting caches the console page (blank after a deploy) | **Fixed, verified live** | Headers above |
| `waiting_seqs` rollout (people ahead, Next list) | **Deployed** (Hosting bundle and EAS `046e9eb4` contain it); rollout step 4 (drop `seqsKept()`) still open | `curl` of the live bundle; `eas update:list` |
| Staff Revoke refused on live rules | **Not verified** (needs a signed-in staff test on live) | n/a |
| "0 mins" / "1 mins" | **Still present** | `apps/mobile/src/components/tickets/TicketStubCard.jsx:10` |
| Camera prompt returns each time Scan opens from the called dialog | **Still present in code** (dismissal is screen state, not remembered) | `scan.jsx:52` |
| First tap on "Type the code instead" ignored | Needs a device; code unchanged | `scan.jsx:207-211` |
| Office card on Home does nothing when closed or banned | **Still present** | `home.jsx` `openJoin` returns with no message |
| Grey square behind the primary dialog button | Needs a device; code unchanged | `packages/ui/src/primitives/Button.jsx` |
| Contact Support opens mail with no recipient | **Still present** | `help.jsx:16` `mailto:?subject=` |
| No SERVICE_COMPLETED notification | **Still present** | `completeTicket` sends no notification |
| Joins accepted before opening time | **Still present** | `cutoffState` checks closing time only |
| `cancelOfficeQueue` on a closed queue writes no log line and keeps `waiting_seqs` | **Still present** | `service.js:463` |
| Security gaps (10) | **Still open** (10/10) | `npm run test:security` |
| No anti-framing header on Hosting | **Still present** | no `X-Frame-Options` / CSP header on live |

## New bugs

### BUG-001
- **Category:** Edge Case
- **Severity:** Major
- **Title:** A ticket left CALLED or IN_SERVICE past the end of the campus day can never be finished; the student is locked out of that office for good
- **Environment:** Firestore and Auth emulators with the repo rules; backend at `b54b58f` (affects all platforms)
- **Preconditions:** A ticket is IN_SERVICE (or CALLED) at closing time and staff do not complete it before midnight (campus time), or a visit runs past midnight
- **Steps to Reproduce:**
  1. Staff call and verify a ticket for Student X at Office A.
  2. Let the campus day roll over without completing it.
  3. Staff press Complete (the console only loads today's queue and tickets, so the ticket is not even shown).
  4. Student X opens the ticket and tries to cancel it.
  5. Student X tries to join Office A again.
- **Expected Result:** Some path ends the old ticket (staff can complete it, or it ends automatically at end of day), and the student can join again.
- **Actual Result:** Probe E3: Complete is refused (`NOT_IN_SERVICE`; `completeTicket` uses today's queue id from `now`); cancel is refused (`TICKET_UNAVAILABLE`, an IN_SERVICE ticket cannot be cancelled); the join is refused (`ALREADY_QUEUED`). The ticket also keeps one of the student's three slots forever. No screen in either app can fix it.
- **Workaround (if any):** Edit the ticket and the user's `active_count` and `active_offices` by hand in the Firebase console.

### BUG-002
- **Category:** Edge Case
- **Severity:** Major
- **Title:** A WAITING ticket from an earlier day shows today's "Now serving", "people ahead" and wait time on Home
- **Environment:** Mobile app (code analysis of `useMyTickets.js` and `utils/ticket.js`); any phone
- **Preconditions:** Staff close the queue with people still waiting (closing leaves issued tickets valid); the next day the office opens a new queue
- **Steps to Reproduce:**
  1. Student X joins Office A as number 4; staff close the queue after serving 2.
  2. Next day, staff open Office A and students join as 1, 2, 3, 5…
  3. Student X opens Home.
- **Expected Result:** The old ticket is shown as expired or from a past day (or is cancelled automatically when the day ends).
- **Actual Result:** `toTicketView` measures the old ticket against today's queue doc (`board.queues[office_id]`), so it shows today's number at the window and counts today's people with a lower number as "ahead" of a ticket that will never be called. The student also cannot join Office A until they find and cancel it.
- **Workaround (if any):** The student cancels the old ticket from Home (free while WAITING).

### BUG-003
- **Category:** Edge Case
- **Severity:** Major
- **Title:** A guest with a name longer than 100 characters can never join, check in or cancel, and is told to check their connection
- **Environment:** Firestore and Auth emulators with the repo rules; mobile guest form
- **Preconditions:** Continue as guest
- **Steps to Reproduce:**
  1. On the guest form, type a name of 101+ characters (the field has no `maxLength`; Edit Profile caps names at 60).
  2. Tap Continue: the guest ID is issued.
  3. Join any open office.
- **Expected Result:** The form limits the name to 60 characters (as Edit Profile does), or the join works.
- **Actual Result:** Probe E1: the profile is saved (`G317372`) but the join is refused (`DENIED`), because every ticket write also writes an `events` line whose `actor_name` the rules cap at 100 characters. The student sees "The queue didn't accept your ticket. Check your connection and try again", which retrying never fixes. A 10-character name joins fine.
- **Workaround (if any):** Shorten the name in Edit Profile.

### BUG-004
- **Category:** Edge Case
- **Severity:** Major
- **Title:** A student who confirms a free cancel while being called gets a strike (or a ban)
- **Environment:** Firestore and Auth emulators with the repo rules; mobile Home ticket modal
- **Preconditions:** Student has a WAITING ticket at the front of the line
- **Steps to Reproduce:**
  1. Open the ticket and tap Cancel: the dialog says the cancel is free.
  2. Before tapping Confirm, staff call the ticket.
  3. Tap Confirm.
- **Expected Result:** The cancel is refused or the student is asked again, since the free cancel they agreed to no longer applies.
- **Actual Result:** Probe E2: the cancel goes through as a cancel-after-call: `strike_count` becomes 1 and an offense is recorded. `cancelOwnTicket` re-reads the status and switches to the penalty path without checking which status the student confirmed. The dialog copy does switch live, but a tap at the moment it changes still lands.
- **Workaround (if any):** Staff revoke the offense.

### BUG-005
- **Category:** Edge Case
- **Severity:** Major
- **Title:** A phone clock that is off by a minute or more breaks the 60-second check-in
- **Environment:** Mobile app (code analysis): `getRemainingSeconds(called_at, Date.now())` versus the rules' `request.time`
- **Preconditions:** Phone clock set by hand, or automatic time off
- **Steps to Reproduce:**
  1. Set the phone clock 2 minutes fast.
  2. Get called.
  3. Open Scan and enter the right code within 60 seconds.
- **Expected Result:** Check-in succeeds; the countdown matches server time.
- **Actual Result:** The countdown starts at 0 and `checkCheckIn` refuses locally with "time ran out", so the ticket ends as a no-show with a strike. With the clock slow, the countdown shows time left but the server refuses the write. The apps never correct for the difference between the phone and server clocks.
- **Workaround (if any):** Turn on automatic date and time on the phone.

### BUG-006
- **Category:** Edge Case
- **Severity:** Major
- **Title:** On a staff PC whose clock is off by more than 30 minutes, a no-show that would cause a ban is refused and the window stays blocked
- **Environment:** Firestore and Auth emulators with the repo rules; staff console
- **Preconditions:** Staff PC clock 45 minutes fast; the called student already has one strike
- **Steps to Reproduce:**
  1. Call the student and let the 60 s grace period run out.
  2. Press No-show.
- **Expected Result:** The no-show and the 24-hour ban are recorded.
- **Actual Result:** Probe E4: refused (`DENIED`). The app computes `banned_until` from the PC clock and the rules accept it only within 30 minutes of server time plus 24 hours. The same no-show with a correct clock passes. The ticket stays at the window, so Call next is blocked. The console says to check the connection. The PC clock also skews the measured visit length (`completeTicket` subtracts the server start time from the PC's `now`).
- **Workaround (if any):** Fix the PC clock and press No-show again.

### BUG-007
- **Category:** Edge Case
- **Severity:** Minor
- **Title:** Double-clicking Call next (or two staff clicking it together) shows a false "not accepted, check your connection" banner
- **Environment:** Firestore and Auth emulators; staff console `QueueProvider` (no in-flight guard on Call next, Override or Complete)
- **Preconditions:** Two or more people waiting
- **Steps to Reproduce:**
  1. Double-click Call next.
- **Expected Result:** One call, no error (the button is disabled while the call is in flight).
- **Actual Result:** Probe E5: the first call succeeds and the second is refused (`DENIED`). The banner reads "Couldn't call the next ticket. The change was not accepted. Check your connection and try again", although the call worked. Complete behaves the same way.
- **Workaround (if any):** Ignore the banner.

### BUG-008
- **Category:** Edge Case
- **Severity:** Minor
- **Title:** Verify by ID reports "ID doesn't match" for any failure, including being offline
- **Environment:** Staff console (code analysis, `QueueProvider.jsx` `verifyById`)
- **Preconditions:** A ticket is called; the network drops or the write is refused
- **Steps to Reproduce:**
  1. Go offline and verify the called student with their correct ID.
- **Expected Result:** A connection error.
- **Actual Result:** Every error other than GRACE_EXPIRED maps to `NO_MATCH`, so staff are told the student's ID is wrong. No-show likewise maps every other error to "invalid state".
- **Workaround (if any):** None in the app.

### BUG-009
- **Category:** Edge Case
- **Severity:** Minor
- **Title:** Revoking an older ban-causing offense lifts the student's current, unrelated ban
- **Environment:** Backend (code analysis, `penalties/progress.js` `revokeEffect`)
- **Preconditions:** A student has two bans on record, one past and one running
- **Steps to Reproduce:**
  1. Revoke the offense that caused the first (expired) ban.
- **Expected Result:** The running ban is unchanged.
- **Actual Result:** `revokeEffect` sees `resulted_in_ban` and writes `banned_until: null, strike_count: 1`, whichever ban is running now.
- **Workaround (if any):** Only revoke the offense that caused the current ban.

### BUG-010
- **Category:** Edge Case
- **Severity:** Low
- **Title:** An unknown staff URL shows Expo's developer "Unmatched Route" page with a Sitemap link
- **Environment:** Live staff Hosting, Chrome-based browser pane, 375 px and desktop
- **Preconditions:** None
- **Steps to Reproduce:**
  1. Open `https://qampus-staff.web.app/does-not-exist`.
- **Expected Result:** A branded "Page not found" page with a link to sign-in.
- **Actual Result:** "Unmatched Route / Page could not be found" with a "Sitemap" link that lists every route.
- **Workaround (if any):** None needed.

### BUG-011
- **Category:** Known Bug (not in STATUS)
- **Severity:** Low
- **Title:** Security gap G18 (staff can reopen yesterday's queue doc) is not in the STATUS known issues
- **Environment:** `npm run test:security`
- **Preconditions:** None
- **Steps to Reproduce:**
  1. Run `npm run test:security`.
- **Expected Result:** Every "gap" the suite reports is listed in `docs/STATUS.md`.
- **Actual Result:** G18 is reported but not listed.
- **Workaround (if any):** n/a

## Suggested next steps before Attempt 2
1. Decide how a campus day ends (BUG-001, BUG-002): for example, the staff "Close" (or the first open of the next day) cancels the previous day's unfinished tickets without penalty.
2. Cap the guest name at 60 characters (BUG-003); pass the status the student confirmed into `cancelOwnTicket` and refuse if it changed (BUG-004).
3. Busy guards on the staff action buttons (BUG-007); real error mapping in Verify and No-show (BUG-008).
4. Push the known-bug fixes you mentioned, so Attempt 2 can verify them.
5. For Attempt 2, a phone or the Android emulator with `adb` attached lets me drive the mobile app directly.
