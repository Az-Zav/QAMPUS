# Defense cheat sheet (temporary)

Our own prep for the architecture defense. **Delete this file after the defense** (`git rm docs/DEFENSE_CHEATSHEET.md`). It points
at files and function names instead of line numbers so it stays true; the full explanation is in `ARCHITECTURE.md`.

## 1. The 60-second pitch

QAMPUS lets a student take a numbered ticket for a campus office from their phone. Office staff call tickets from a web console,
and a public display shows who is being served. When called, the student has 60 seconds to check in by scanning the office QR or
typing its code. Missing the call, or cancelling after it, is an offense: the first is a strike, the second is a 24-hour ban.

There is no application server. Both apps talk straight to Firebase. **The Firestore Security Rules are the backend's enforcement
layer**, and one shared library (`packages/backend`) holds all the business logic. One tiny Cloudflare Worker sends the push
notification, because that is the one job a browser cannot do and the free Firebase plan cannot host.

## 2. The three arguments to lead with

1. **Free plan, so no server.** We stayed on Firebase Spark (no card, no Cloud Functions). That forces a design where the client
   does the work and the rules guard the data. Everything else follows from this.
2. **Atomic writes keep the queue consistent.** Every state change (a ticket, the queue's window, a student's counters, an offense,
   a log line, a notification) commits in **one transaction or batch**. The rules check those writes together with `getAfter`, so a
   modified client cannot do half of a change.
3. **One shared library, pure logic separated from Firebase.** Rules of play (`preflight`, `derive`, `progress`, `buildNotification`)
   are plain functions that run and are tested under Node with no Firebase. Both apps import the same code.

## 3. Numbers to remember

- 2 apps (student/guest mobile, staff web) + 3 shared packages (`backend`, `core`, `ui`) + 1 relay (Cloudflare Worker).
- Firestore: 8 top-level collections (`users`, `institutionalIds`, `offices`, `staff`, `queues`, `tickets`, `offenses`, `events`)
  + 1 subcollection (`users/{uid}/notifications`).
- Limits (`RULES` in `core/src/domain.js`): 60 s grace, 3 active tickets, 2 offenses per ban, 24 h ban, approaching alert at place
  3, measured visit time after 3 visits (floor 1 minute).
- Tests: 85 backend unit tests, 7 relay tests (all passing). Rules were tested by hand on a phone and in a browser, not by unit
  tests.
- Roles: STUDENT, GUEST (anonymous account), STAFF / SUPER_ADMIN (a `staff/{email}` document).
- Campus time is a constant, UTC+8. Ticket number format `R-10-24-003`; short form `R-003`.

## 4. Walkthroughs (what happens, where in the code)

### A. A student joins a queue
1. Staff pressed Open queue earlier: `openQueue` created `queues/{officeId}_{yyyymmdd}`.
2. Student taps Join; `useJoinQueue` calls `joinQueue` (`packages/backend/src/ticketing/service.js`).
3. In one transaction it reads the queue, the user profile and the office, then runs `checkJoin` (profile complete, not banned,
   office active, no active ticket here, under the limit, queue open, inside the cutoff).
4. It writes: queue `last_seq + 1`, the new ticket `queueId_seq` with status WAITING, the user's `active_count + 1` and
   `active_offices.<office>`, an activity-log line and a "queue joined" notification.
5. `validJoin` in `firestore.rules` checks the same things server-side: the ticket takes exactly the next number, the queue bump is
   in the same write (`getAfter`), the user's counter rose by one, the snapshot fields match the real documents.
6. Two students joining at once: both try to write `last_seq + 1`; one transaction retries and sees the new number.

### B. Staff call the next ticket (and the push)
1. `callNext` picks the lowest WAITING number; `callTicket` runs a transaction: ticket becomes CALLED with `called_at`, queue gets
   `current_ticket_id` and `last_called_seq`, plus a log line and a "your turn" notification, and an "approaching" notification to
   whoever is 3rd in line.
2. `validCall` allows it only for the staff member's own office, only while the queue is OPEN and the window is free.
3. After it commits, the staff console (`apps/staff/src/lib/push.js`) reads the student's push token and calls the relay with the
   staff member's Firebase ID token. The relay (`relay/src/index.js`) reads `staff/{email}` with that same token to prove the caller
   is staff, then sends one fixed message to Expo, which delivers via FCM. A failed push never undoes the call.
4. The student's phone also sees the change live (listener in `QueueDataProvider`) and opens `CalledModal` with the countdown.

### C. Checking in within 60 seconds
- Scan tab reads the display's QR (`parseCheckInPayload`) or the typed six digits: both go to `checkInByCode` (same validation).
- `checkCheckIn` verifies status CALLED, time left, and the code; `validArrival` enforces `request.time <= called_at + 60 s` using
  **server time**, so a phone cannot cheat the clock. Staff can instead verify by the holder's ID (`verifyByHolderId`).

### D. No-show to ban
- After 60 s staff press No-show: `markTicketNoShow` marks the ticket NO_SHOW, frees the window, releases the student's slot,
  creates `offenses/{ticketId}`, and moves `strike_count` (`nextPenalty`), all in one transaction.
- Rules refuse the no-show unless the offense is created in the same write (`existsAfter`), and require strikes to move exactly one
  step (`validOffense`, `penaltyMoveOk`). Second offense: strikes reset, `banned_until` = now + 24 h, and the next join is refused.
- Staff can revoke with a reason (`revokeOffense`); the record stays and the counters are corrected.

### E. Guest sign-up
- "Continue as guest" opens a form only. Its Continue calls `signInAnonymously` and then `issueGuestProfile`: one transaction picks
  a random `G` + six digits, reserves `institutionalIds/{id}` (create-only) and creates the profile. If anything fails the account
  is deleted. Rules require the claim and the profile to carry the same ID in the same write, which is what guarantees uniqueness
  without a server.

### F. Office cancels the whole queue
- `cancelOfficeQueue` closes the queue and cancels the ticket at the window first, then the waiting tickets in groups of three
  (rules allow only about 20 lookups per write; no student appears twice in one group). Nobody is penalized. Running it again
  finishes an interrupted run.

## 5. Where the logic lives (quick map)

| Question | Answer |
|---|---|
| Where are the business rules? | `packages/backend/src/ticketing/{preflight,derive}.js`, `penalties/progress.js`; limits in `core/src/domain.js` |
| Where are the writes? | `ticketing/service.js`, `penalties/service.js`, `identity/service.js` |
| Where is it enforced? | `firestore.rules` (one validator per transition) |
| Where do screens get data? | `QueueDataProvider` (mobile), `OfficeProvider` + `QueueProvider` (staff); thin hooks |
| Where is push? | `relay/`, `apps/staff/src/lib/push.js`, `apps/mobile/src/lib/push.js` |
| Where is the data model? | `ARCHITECTURE.md` section 4 |

## 6. Likely questions and honest answers

**Why Firebase and not our own backend?**
Free tier, live listeners, auth built in, and transactions plus rules give us consistency without running a server. The cost is
that logic runs on the client and the rules carry the security, which we accept for a campus-scale prototype.

**If there is no server, how is it secure?**
The rules, not the app, decide every write: who, which fields, server time, and what else must change in the same write. A modified
client hits the same rules. We list exactly where that falls short (below).

**How do you stop two students getting the same ticket number?**
The ticket id is `queueId_seq`, tickets are create-only, and a join must raise `last_seq` by exactly one in the same write. The
second concurrent write fails and retries with the new number.

**What if staff or students try to cheat the 60 seconds?**
Both the check-in and the no-show compare against Firestore server time (`request.time`) in the rules. Client clocks do not matter.

**Can staff of one office act on another office?**
No. Every staff clause in the rules compares the document's `office_id` with the staff document's `office_id` (`staffOfficeId()`).

**Why a Cloudflare relay? Isn't that a server after all?**
It is the only one, and it is small (two files in `relay/src`). Sending a push needs a trusted sender; the browser cannot call Expo's API and the free Firebase
plan has no Cloud Functions. The relay holds **no secret**: it proves the caller is staff by reading `staff/{email}` with the
caller's own token, so Firestore validates it. It sends only a fixed message. If we moved to a paid plan, a Cloud Function would
replace it.

**Why can the cutoff and counters be bypassed?**
The cutoff (not joining when there is no time left before closing) is computed on the client, and the ticket counters can be moved
by a modified client because rules cannot see *why* a field changed. We built a tamper-proof counter and dropped it as too much code
for the stage. It is documented as an accepted limitation, and the fix is a server (Cloud Functions) or tighter rules.

**Why are student IDs and guest IDs unique if there is no server?**
A create-only claim document `institutionalIds/{id}` must be created in the same write that saves the ID on the profile. A second
claim for the same id fails.

**What happens at midnight?**
The queue id contains the campus date, so a new day has no queue document, which means closed; staff open it. Listeners restart on
the day change. An unfinished ticket from a previous day keeps holding the student's slot until cancelled (it shows on Home).

**How does the app know the queue position without storing it?**
`daily_sequence - last_called_seq`, computed on the client. It is approximate: a cancelled ticket still counts until the line has
been called past it.

**What if the phone is offline?**
A join or any other transaction needs a connection and fails; the app shows a generic failure message (we have not built offline
handling). Push needs the phone to be online anyway.

**How many reads does this use? Will it scale?**
Each phone listens to all offices, one queue per office, and its own tickets, so reads grow with offices times active users. On
Spark (50k reads a day) that is fine for a pilot; for a whole campus we would move to the paid plan or narrow the listeners. Say this
plainly if asked.

**How did you test it?**
85 unit tests on the pure logic and the relay's 7 tests; each feature was tested on a physical Android phone and in a browser
against the real Firebase project. We did not unit-test the rules (no emulator). That is the main gap in our testing, and adding
emulator-based rules tests is the natural next step.

**What is the privacy posture?**
We store a profile, tickets, offenses, notifications and an activity log; Firebase is the processor, plus Expo/Google FCM and
Cloudflare for push. The text cites the Data Privacy Act of 2012 but is a draft for the school's data protection officer. Open
items: a contact address, a retention period, account deletion, recorded consent, and a minors note.

**The repository is public and has `.env` files. Is that a leak?**
Those are public client configuration (Firebase web/Android keys, OAuth client ids) that ship inside every copy of the app anyway. We
searched the tree and the full history: no private key, service account or token. Because anonymous sign-in is on, the rules are
the real protection; recommended console steps are API key restrictions and Firebase App Check.

**Why guests?**
Parents, alumni and representatives visit offices too. A guest is an anonymous account bound to the device, with a generated Guest
ID. Clearing the app's data creates a new guest.

**Why Expo / React Native, one codebase for web and mobile?**
Two apps with shared packages and one language. The staff console is Expo web; the student app needs native modules (Google
sign-in, camera, biometrics, push), so it uses a development build.

**What would you do with more time or a paid plan?**
Move the cutoff, counters and the activity log writes to Cloud Functions; replace the relay with a Firestore-triggered function;
add rules tests with the emulator; add announcements; add App Check; handle push receipts; support iOS.

**If asked how the code was produced (it was AI-assisted):**
Be straight about it, and anchor on what you can show: you can walk any flow in section 4 through the files, you tested every slice
on a real device, and you know the limits in the previous answers. The decisions and their reasons are in `MAINTAINERS.md`.

## 7. Demo script (about 5 minutes)

1. Staff console: sign in, Open queue. Show the display in a second tab.
2. Phone: sign in, Join the office. Show the ticket on Home and the "queue joined" notification.
3. Staff: Call next. Phone shows "It's your turn" with the countdown (and a push if the app is in the background).
4. Phone: Scan tab, scan the display's QR. Staff sees IN_SERVICE; press Complete.
5. Repeat and let the 60 seconds pass; staff press No-show; show the strike on the phone's Bans & Warnings, and the Activity Log.
6. Show the Firestore rules file and point at `validJoin` and `validCall` while explaining the atomic writes.

## 8. Things to say you do not know yet
- Real concurrency behavior under hundreds of users (not load tested).
- Behavior on iOS (Android only so far).
- Rules correctness beyond manual testing (no automated rules tests).
