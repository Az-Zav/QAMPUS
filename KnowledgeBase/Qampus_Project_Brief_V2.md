# Qampus — Project Brief & Knowledge Base

> **Document status:** Living working document  
> **Version:** 0.2  
> **Last updated:** September 11, 2026  
> **Scope:** Version 1 campus mobile queuing system

---

## 1. Project Overview

### 1.1 Project Name

**QAMPUS**

### 1.2 Product Concept

QAMPUS is a mobile campus queuing application that allows students to join school-service queues remotely instead of physically waiting in line.

Students can join an available office queue through the app, receive a virtual queue number, monitor their position, and travel to the office when they are nearly due. When it is their turn, they physically arrive at the office and scan the queue provider's QR code to verify their presence and engage with the service.

### 1.3 Core Value Proposition

> **Digitize the existing campus queue without unnecessarily changing how campus offices already operate.**

The Version 1 philosophy is to mirror the existing physical queue model where possible, replacing physical ticketing and waiting with a virtual queue.

### 1.4 Primary Goals

- Reduce unnecessary physical waiting time for students.
- Reduce physical congestion around campus service offices.
- Give students visibility into their queue status.
- Give office staff a simple tool for managing queues.
- Preserve the familiar operational model of existing campus offices.
- Create a foundation that can later support more sophisticated service-specific queues and scheduling.

### 1.5 Initial Scope

The initial scope is deliberately narrow:

- Campus/school services only.
- Examples include registrar and student accounting/cashier offices.
- Version 1 assumes an office generally operates **one general queue**, rather than requiring every individual service to have its own queue.
- The system should reflect the physical queue model currently used by the office wherever practical.

### 1.6 Out of Scope for Version 1

The following are future possibilities rather than required Version 1 features:

- Multiple service-specific queues within one office.
- Appointment scheduling.
- Advanced slot/window allocation.
- Multi-campus support.
- Rotating or dynamic QR tokens.
- Other non-school service queues such as commercial establishments.
- Complex queue optimization or automatic staff-driven queue advancement.

---

# 2. Stakeholders & User Roles

## 2.1 Students

Students are the primary users of the mobile application.

They can:

- Complete onboarding.
- Authenticate using their institutional account.
- Browse available office queues.
- Join a queue remotely.
- Hold up to three active queues at a time.
- View active tickets.
- Monitor queue progress.
- Receive queue notifications.
- Scan an office QR code when called.
- View completed queue history.
- Cancel a queue subject to cancellation policies.

## 2.2 Queue Providers / Office Staff

Staff operate the queue for their assigned office.

They can:

- Authenticate through an authorized staff account.
- Access the office they are assigned to.
- Monitor queue activity.
- Call the next queue number.
- Verify student arrival through QR scanning.
- Start service.
- Complete service.
- Mark students as no-show when appropriate.
- Manage basic office information and schedule.
- Display the office's static QR code.

## 2.3 Super Administrator

The super admin is a system-level administrative role.

Potential responsibilities include:

- Managing offices.
- Assigning staff to offices.
- Managing system-wide permissions.
- Managing institutional configuration.
- Reviewing system-level activity and audit information.

> **Open decision:** The exact super-admin workflow and interface have not yet been designed.

---

# 3. Student Application

## 3.1 Authentication & Onboarding

Before authentication, the student sees a short onboarding experience consisting of approximately three informational slides.

After onboarding, the student proceeds to login.

### Authentication

Students must authenticate using their institutional account.

The institution's account is expected to be a Google account, so Google OAuth can be used as the authentication mechanism.

### Authentication Principle

The application should not treat ordinary personal Google accounts as equivalent to institutional accounts. Access should be restricted according to the institution's authorized account/domain rules.

---

# 4. Student Information Architecture

The main student experience consists of:

1. **Home**
2. **Scan**
3. **Queues**

The student's profile and notification controls are accessible from the header rather than the persistent bottom navigation.

## 4.1 Home Dashboard

The home dashboard contains:

### Header

- Profile icon
- Notification icon
- QAMPUS logo

### Greeting

A contextual greeting such as:

> Good afternoon, [Student Name]

### Active Tickets

The dashboard displays all currently active queue tickets.

The ticket is visually represented as a **perforated physical ticket**.

The ticket card includes:

- Current queue number being served.
- Student's queue number.
- Office.
- Service/queue context, where applicable.
- Office/service location.

### Active Queue Limit

A student may have a maximum of **three active queues simultaneously**.

This is a Version 1 business policy.

### Office Schedule

Below the active ticket section is a tabular schedule showing relevant office schedules.

---

# 5. Student Queue Screen

The Queues screen contains two toggleable sections:

### Join

Displays currently available queues that students can join.

Each queue card contains:

- Office/service name.
- Location.
- Join button.

### History

Displays previously completed queue transactions.

---

# 6. Student QR Scanner

The Scan button is a persistent item in the bottom navigation.

It opens the QR scanner.

The scanner is primarily used when a student has been called and physically arrives at the office.

### Version 1 QR Approach

Version 1 uses a **static QR code** associated with the office.

The student scans the office QR code to verify arrival.

### Arrival Verification Fallback

ID checks serve as the alternative to QR scanning when a student's phone is
dead or otherwise unavailable — not a separate staff override path, just the
fallback verification method for that case.

### Future QR Enhancement

A future iteration may use rotating/dynamic QR tokens to improve security and prevent misuse.

---

# 7. Student Join Queue Flow

The current intended flow is:

1. Student opens QAMPUS.
2. Student navigates to **Queues**.
3. Student selects the **Join** section.
4. Student browses available office queues.
5. Student selects an office.
6. Student taps **Join**.
7. A confirmation modal appears.
8. Student selects **Confirm Join**.
9. The system creates the student's queue ticket.
10. A confirmation modal displays the assigned ticket number.
11. Student is redirected to the Home dashboard.
12. The new active ticket appears on the dashboard.

### Queue State at Creation

Immediately after joining, the ticket enters:

> **WAITING**

---

# 8. Queue Lifecycle

The proposed Version 1 queue state model is:

```text
WAITING
   ↓
CALLED
   ↓
ARRIVED
   ↓
IN_SERVICE
   ↓
COMPLETED
```

Alternative terminal states:

```text
WAITING / CALLED → CANCELLED
CALLED → NO_SHOW
```

## 8.1 Waiting

The student has successfully joined the queue and is waiting for the office to call their number.

## 8.2 Called

A staff member has called the student.

The system automatically:

- Updates the ticket state.
- Sends the appropriate notification.
- Starts the arrival grace-period timer.

## 8.3 Arrived

The student has physically arrived and successfully scanned the office QR code.

## 8.4 In Service

The office has accepted the student and is actively providing the service.

## 8.5 Completed

The service has been completed.

The ticket is removed from active tickets and moved into queue history.

## 8.6 Cancelled

The student cancels the queue.

Cancellation behavior may affect the student's warning/ban record depending on the applicable rules (see §18.2).

## 8.7 No-Show

The student fails to arrive and scan the QR code within the allowed grace period after being called.

---

# 9. Queue Advancement Model

QAMPUS will use a **hybrid queue-management approach**.

### Human Decision

Staff decide **when to call the next queue number**.

### System Execution

Once staff make that decision, the system automatically handles repeatable downstream logic.

For example:

```text
Staff taps "Call Next"
        ↓
System selects next eligible ticket
        ↓
Ticket → CALLED
        ↓
Notifications sent
        ↓
Grace-period timer starts
        ↓
Student scans QR
        ↓
Ticket → ARRIVED
        ↓
Staff accepts / starts service
        ↓
Ticket → IN_SERVICE
        ↓
Staff completes service
        ↓
Ticket → COMPLETED
        ↓
Ticket archived to history
```

This preserves human flexibility while making state transitions consistent.

### Queue Ordering

The intended default is **FIFO (First In, First Out)**.

Manual queue reordering should not be available to ordinary staff in Version 1 unless a later business requirement justifies it.

### Queue Cutoffs

Determines when an office stops accepting new joins for the day.

**New office, no historical data:**
Cutoff accommodates only **N tickets** with **M minutes** remaining before
close. (Exact N/M — TBD.)

**Office with historical data:**
Once average wait times and service completion counts are available, the
cutoff point can instead be calculated per day from that data, rather than
relying on a fixed N/M.

> **Open decision:** [pending — awaiting the remainder of this point]

### Staff Override of Queue Order

Staff can override standard FIFO ordering or a cutoff in exceptional,
justified cases. This is separate from the cancellation/no-show policy in
§18.2 — this override affects queue position/eligibility, not warnings or
bans.

---

# 10. Arrival & Grace Period

When a staff member calls a student's queue number:

- The ticket becomes `CALLED`.
- The student receives a prominent in-app notification.
- A push notification is sent.
- A grace-period countdown begins.

### Proposed Grace Period

**1–2 minutes**, with the current discussion leaning toward approximately **2 minutes** as a practical window.

> **Open decision:** Final grace-period duration must be formally established.

### Grace Period Expiry

If the student does not successfully scan the office QR code before the grace period expires:

- Ticket becomes `NO_SHOW`.
- Student is notified.
- The no-show/cancellation policy is applied if appropriate.
- The queue becomes eligible to move forward.

---

# 11. Staff Mobile Application

The staff application follows a similar three-screen structure to the student application.

## 11.1 Staff Navigation

1. **Dashboard**
2. **Queue**
3. **Office / Settings**

The staff member's personal profile remains accessible through the header rather than becoming a bottom-navigation tab.

---

# 12. Staff Dashboard

The dashboard provides operational visibility.

Potential information includes:

- Number currently being served.
- Number of waiting students.
- Number served today.
- Queue status.
- Office open/closed status.
- Basic daily queue statistics.

The dashboard should prioritize information needed for immediate operation rather than analytics-heavy reporting.

---

# 13. Staff Queue Management

The Queue screen is the primary operational interface.

Core actions include:

- Call next.
- View current queue.
- View current ticket.
- Verify arrival through QR scan.
- Start service.
- Complete service.
- Mark no-show.
- Handle queue closing or pause conditions.

### Core Principle

Staff make the operational decisions, while QAMPUS automatically performs the associated system actions.

---

# 14. Staff Office / Settings

The third staff navigation item should be operationally focused rather than a personal profile page.

It may contain:

- Office name.
- Office location.
- Office schedule.
- Queue status/open or closed state.
- Static QR code.
- Full-screen QR display.
- Basic office information.
- Staff assignment information, where appropriate.

### Static QR

The office's static QR can be displayed full-screen so it can be physically presented or posted at the appropriate service area.

A separate QR navigation tab is **not required** for staff.

---

# 14a. Physical Queue Terminal

In addition to the staff mobile app and the static QR display, offices have a
more capable physical queue terminal — a public-facing display, not a
staff-operated screen — showing:

- **Now Serving** — the number currently being served.
- **Next three** — the next three numbers in line.

This terminal reflects the same underlying queue state as the staff app's
Queue screen; it is a read-facing mirror for waiting students, not a second
control surface.

> **Open decision:** exact hardware/display technology and refresh mechanism
> are not yet defined.

---

# 15. Office Registration & Administration

Initially, office registration and system-level office creation are expected to belong to the **super admin** rather than ordinary office staff.

Staff should primarily manage the office to which they are assigned.

> **Open decision:** Define exactly which office fields can be edited by staff versus only by super admins.

---

# 16. Notification System

Notifications should be tied to meaningful queue events rather than generated excessively.

## 16.1 Student Notifications

### Queue Joined

Trigger when a student successfully joins.

Show:

- Confirmation.
- Assigned ticket number.

### Almost Turn

Trigger when the student is approaching their turn.

The preferred signal is based on **number of people ahead**, rather than estimated waiting time.

This avoids misleading time estimates when service durations vary.

A candidate threshold discussed was:

> Approximately 3 people ahead.

### Your Turn

This is the highest-priority student notification.

Use:

- Prominent in-app notification.
- Push notification.
- Large/full-screen-style alert where appropriate.

The alert should clearly communicate that the student needs to proceed to the office and scan the QR code.

### Grace-Period Reminder

A reminder should be sent shortly before the grace period expires.

A candidate discussed timing was:

> Approximately 30 seconds remaining.

### QR Success

Show an in-app confirmation when arrival verification succeeds.

### Service Complete

Notify the student when their service is completed.

### Cancellation

Notify the student when a queue is cancelled.

### No-Show

Notify the student when the system marks their ticket as a no-show.

The notification should explain the consequence where applicable.

### Office Changes

Potential notifications include:

- Office closure.
- Schedule change.
- Queue temporarily unavailable.

> **Open decision:** Determine which office announcements require push notifications versus in-app-only messaging.

---

# 17. Staff Notifications

Staff notifications should be intentionally minimal.

Important events include:

- Student QR arrival.
- Grace-period expiry.
- Relevant queue exceptions.
- Potential office closure or system notices.

The staff interface should primarily communicate operational information through the Queue screen rather than flooding staff with notifications.

---

# 18. Queue Limits & Abuse Prevention

## 18.1 Active Queue Limit

Each student may have a maximum of:

> **3 active queues**

This prevents one account from occupying excessive queue capacity.

## 18.2 Cancellation & No-Show Policy

### System/Office-Initiated Cancellations Are Exempt

Cancellations caused by the office or system — an office closing early, a
staff-initiated cancellation for operational reasons, a system error — do not
constitute a warning or a ban. These were never eligible for a penalty in the
first place; this is not an exception carved out of the policy, it's outside
the policy's scope.

### Student-Initiated Cancellation — Grace-Period Timing

Only cancellations initiated by the student, after being called, are
evaluated:

- Cancelling **before** being called (`WAITING` state): no penalty.
- Cancelling within the **first half** of the grace period: issues a **warning**.
- Cancelling within the **second half** of the grace period: issues a **ban**.

### No-Show

Failing to arrive/scan (or complete ID verification — see §6) before the full
grace period expires issues a **ban**.

### Warning & Ban Escalation

Warnings accumulate; reaching a threshold escalates to a ban independently of
the grace-period-timing bans above.

| Warnings issued | Consequence |
|---|---|
| 1st warning | Warning issued |
| 2nd warning | Warning issued |
| 3rd warning | 24-hour ban |
| Subsequent bans | Escalating duration — **TBD** |

> **Open decision:** exact escalation duration beyond the first ban is not
> yet defined.

---

# 19. Guest Access

Campus services are not necessarily used exclusively by students. Authorized family members may also need to access services.

A possible feature is:

> **Sign in as Guest**

### Main Risk

A guest account may not be persistent, allowing a person to repeatedly create new guest sessions and evade account-level bans.

This creates a potential abuse vector.

### Potential Future Direction

Guest users may require lightweight persistent identity verification, such as a verified phone number or another institution-approved identity mechanism.

> **Open decision:** Guest authentication and identity persistence are not finalized.

Guest functionality should not be considered fully specified until the abuse-prevention mechanism is defined.

---

# 20. QR Security

## Version 1

Use a static office QR code.

Advantages:

- Simple to implement.
- Easy for staff to operate.
- Easy to physically display at the office.
- Low operational complexity.

### Limitation

A static QR can potentially be photographed, copied, or shared outside the intended location.

## Future Enhancement

Explore **rotating/dynamic QR tokens** in a future iteration.

Possible benefits:

- Reduced QR reuse outside the office.
- Stronger arrival verification.
- Short-lived validation tokens.

This should be considered after evaluating Version 1's real-world security requirements and abuse patterns.

---

# 21. Privacy & Security — To Be Defined

Privacy and security require a dedicated design pass.

The system should eventually define:

- What student information is stored.
- What staff information is stored.
- What data is required for authentication.
- What information is visible to other users.
- How long queue records are retained.
- What notification data is stored.
- What QR-scan events are logged.
- How administrative access is controlled.
- How queue activity is audited.
- How unauthorized office access is prevented.
- How account bans are enforced.
- How guest identity is handled.
- How data is protected in transit and at rest.

### Data Minimization Principle

QAMPUS should collect only information necessary to provide authentication, queue management, notifications, auditing, and administrative functions.

---

# 22. Accessibility — To Be Defined

The application should be designed so that queue information is understandable and usable by students and staff with different accessibility needs.

Areas to define include:

- Text size and readability.
- Color contrast.
- Non-color indicators for queue states.
- Screen-reader compatibility.
- Touch target sizes.
- Clear error messaging.
- Accessible QR scanning.
- Accessible notification behavior.
- Reduced-motion considerations.

The visual perforated-ticket metaphor should remain understandable even without relying exclusively on visual decoration.

---

# 23. UI / UX Principles

The core UX principle is:

> **The app should feel simpler than standing in line.**

Design should prioritize:

- Immediate understanding of queue status.
- Minimal steps to join a queue.
- Clear indication of whose turn it is.
- Strong visibility of active tickets.
- Consistent state labels.
- Clear confirmation before joining.
- Clear feedback after QR scanning.
- Prominent warnings when action is required.
- Minimal operational complexity for staff.

### Student Experience

Students should not need to repeatedly refresh or manually monitor their position.

### Staff Experience

Staff should be able to operate the queue with minimal taps during active service.

---

# 24. Analytics & Reporting — Future/To Be Defined

Potential metrics include:

- Average waiting time.
- Average service time.
- Number of students served.
- Queue throughput.
- No-show rate.
- Cancellation rate.
- Peak queue periods.
- Office utilization.
- Average number of people waiting.
- Average time between queue calls.
- Queue abandonment.

Analytics should be used to improve campus operations rather than unnecessarily expose individual student behavior.

---

# 25. Technical Architecture — To Be Designed

The technical architecture has not yet been finalized.

Areas to investigate include:

- Mobile application framework.
- Backend/API architecture.
- Authentication provider.
- Database.
- Real-time queue updates.
- Push notification infrastructure.
- QR validation service.
- Role-based access control.
- Audit logging.
- Hosting/deployment.
- Monitoring and error reporting.
- Backup and recovery.

A real-time mechanism will likely be important because queue states and notifications need to propagate quickly between students and staff.

---

# 25a. Offline Operation Model

QAMPUS's normal model assumes the office's terminal and staff app stay
connected to the backend, which is the system of record for queue state.
Offline mode addresses what happens when that connection breaks.

### Scope: Office-Level, Not Global

Offline handling is scoped to a single office. One office losing connectivity
does not affect any other office's queue — each office's terminal operates
independently.

### Local Terminal Becomes Authoritative

While an office is disconnected from QAMPUS, its local terminal takes over as
the authoritative source of truth for that office's queue state. Staff
continue calling numbers, marking arrivals, and completing service exactly as
they would online — the terminal keeps recording these actions locally
instead of relying on the backend to confirm them.

This means the office does not stop operating during an outage. The physical
terminal (§14a) continues showing Now Serving / Next Three from local state.

### Sync on Reconnect

Once QAMPUS becomes reachable again, the terminal syncs its accumulated
events back to the backend, bringing the central system of record up to date
with everything that happened locally during the outage.

### What's Still Unresolved

The thread reached agreement on the *model* (office-level, local-authoritative,
sync-on-reconnect) but not the *mechanism*:

- How conflicts are resolved if the backend's last-known state disagrees with
  what the terminal recorded offline.
- Event ordering during sync — whether events are replayed in original
  order or reconciled some other way.
- What a student's app shows if it briefly disagrees with the terminal's
  local state during the outage window (e.g. app still shows old queue
  position while the terminal has already moved on).

These are explicitly called out as open technical design work, not settled
decisions.

---

# 26. Data Model — Deferred

The detailed data model is intentionally being held for a later brainstorming session.

Likely core entities include:

- User.
- Student profile.
- Staff profile.
- Office.
- Office schedule.
- Queue.
- Queue ticket.
- Queue event/state transition.
- QR configuration.
- Notification.
- Cancellation/penalty record.
- Audit log.

The exact relationships, fields, IDs, timestamps, and state-transition rules still need to be designed.

---

# 27. Edge Cases — Future Brainstorming

The system should eventually define behavior for:

- Student loses internet connection while waiting.
- Student loses internet connection while scanning.
- QR scanner fails.
- QR code is unavailable/damaged.
- Office temporarily closes.
- Office changes schedule while queues are active.
- Staff accidentally calls the wrong number.
- Student scans the wrong office QR.
- Student scans a QR code before being called.
- Student arrives after the grace period.
- Staff member leaves while a queue is active.
- Multiple staff members operate the same office queue.
- Queue reaches capacity.
- Student attempts to join a fourth queue.
- Duplicate join attempts.
- Authentication failure.
- Push notification failure.
- App closed/backgrounded while the student is called.
- Server interruption.
- Suspicious QR reuse.
- Guest attempts to evade a ban.

---

# 28. Key Product Decisions Made So Far

| Decision | Version 1 Direction |
|---|---|
| Product name | QAMPUS |
| Primary users | Students and campus office staff |
| Service scope | School/campus services |
| Queue model | General office queue |
| Service-specific queues | Future possibility |
| Student authentication | Institutional account |
| OAuth | Google OAuth for institutional Google accounts |
| Onboarding | Approximately 3 slides |
| Student active queue limit | 3 |
| Student main navigation | Home / Scan / Queues |
| Student profile | Header |
| Student notifications | Header |
| Staff main navigation | Dashboard / Queue / Office |
| Staff profile | Header |
| Staff QR | Static QR |
| Dynamic QR | Future enhancement |
| Queue creation state | Waiting |
| Queue advancement | Staff-controlled |
| State execution | System-controlled |
| Queue ordering | FIFO by default |
| Arrival verification | QR scan |
| Grace period | Approximately 1–2 minutes; TBD |
| Turn notification | Prominent in-app + push |
| Grace reminder | Candidate: 30 seconds remaining |
| Almost-turn notification | Candidate: 3 people ahead |
| Completed tickets | Move to history |
| Cancellation penalty basis | Timing-based (grace-period half), not flat; office/system cancellations exempt |
| Ban escalation | Warning → warning → 24h ban (3rd warning); beyond that TBD |
| Queue cutoffs | Exists; N/M for new offices, data-driven for offices with history; exact values TBD |
| Queue order override | Staff can override FIFO/cutoff in exceptional cases |
| Arrival verification fallback | Manual ID check if QR unavailable (e.g. dead phone) |
| Physical terminal | Now Serving + next 3, public-facing display |
| Offline mode | Office-level; local terminal authoritative; syncs on reconnect |
| Guest access | Potential feature; abuse controls TBD |

---

# 29. Product Principles

### 29.1 Mirror Reality Before Optimizing It

Version 1 should digitize the existing campus queue rather than forcing offices to completely redesign their operations.

### 29.2 Humans Decide, the System Executes

Staff make operational decisions such as calling the next student.

The system automatically performs the predictable state transitions, timers, notifications, logging, and archival.

### 29.3 Keep the Student Flow Lightweight

The student should primarily need to:

> Join → Monitor → Arrive → Scan → Receive Service

### 29.4 Make Action Required Obvious

When it is the student's turn, the interface should make the required action unmistakable.

### 29.5 Prevent Abuse Without Punishing Legitimate Use

Queue policies should discourage harmful behavior while allowing reasonable cancellations and handling office/system failures fairly.

### 29.6 Design Version 1 for Evolution

The architecture should not prevent later support for:

- Multiple service queues.
- Dynamic QR verification.
- Appointments.
- More advanced scheduling.
- Multiple campuses.

---

# 30. Future Roadmap Candidates

## Phase 1 — Version 1

Core remote queuing:

- Authentication.
- Onboarding.
- Student dashboard.
- Queue browsing.
- Join queue.
- Virtual ticket.
- Queue status.
- Staff queue management.
- QR arrival verification.
- Notifications.
- Queue history.
- Basic office information.
- Basic cancellation/no-show handling.

## Phase 2 — Operational Improvements

Potential enhancements:

- Dynamic/rotating QR.
- More sophisticated queue analytics.
- Better office management.
- Improved guest authentication.
- Queue capacity controls.
- More detailed audit tools.
- Better handling of office closures and exceptions.

## Phase 3 — Advanced Queuing

Potential enhancements:

- Service-specific queues.
- Multiple windows.
- Appointment scheduling.
- Time-slot allocation.
- Estimated waiting times.
- Intelligent queue balancing.

## Phase 4 — Campus Platform Expansion

Potential enhancements:

- Multi-campus support.
- Broader campus services.
- Institutional integrations.
- Advanced reporting.
- Cross-office workflows.

---

# 31. Open Questions & Future Brainstorming Agenda

These questions should be resolved before the corresponding feature is considered finalized.

## Queue Rules

- What is the exact grace-period duration?
- Can staff recall a student?
- What happens when an office closes with active tickets?
- Is queue capacity unlimited or configurable?
- Can staff pause a queue?
- Can staff skip a student without immediately marking them no-show?
- What happens when multiple staff members operate one queue?
- Exact N/M values for a new office's cutoff, and the exact calculation for data-driven cutoffs.

## Cancellation & Penalties

- What is the exact ban duration/escalation beyond the first 24-hour ban?
- How long should warning/ban records remain?
- How is a warning/ban formally lifted or expired, if at all?

## Guest Users

- Are guests allowed in Version 1?
- What constitutes an authorized family member?
- How is guest identity verified?
- How do guest bans persist?
- What data can guests access?

## Office Management

- Who creates offices?
- Who edits office information?
- Can staff modify schedules?
- Who opens/closes a queue?
- Can one office have multiple staff accounts?
- Can one staff member be assigned to multiple offices?

## QR System

- Is a static QR sufficiently secure for Version 1?
- Where should the QR be physically placed?
- What happens if someone scans the QR remotely?
- Should scanning be restricted to students whose ticket is currently called?
- What future rotating-token design should be used?

## Notifications

- Exact thresholds for "almost your turn."
- Exact timing for grace-period reminders.
- Which notifications are push versus in-app.
- Whether students can customize notification preferences.
- What happens when push notifications are disabled.

## Privacy & Security

- Exact data collected.
- Data retention period.
- Role-based permissions.
- Audit logging requirements.
- Institutional authentication rules.
- Guest identity requirements.
- Security requirements for QR validation.

## Technical Architecture

- Mobile framework.
- Backend framework.
- Database technology.
- Real-time communication method.
- Push notification service.
- Authentication provider.
- Hosting/deployment platform.
- Monitoring and logging strategy.
- Exact component boundaries inside the monolith.
- Offline sync mechanism: conflict resolution, event ordering, and how terminal-vs-app state disagreement during an outage is handled.

## Data Model

- User schema.
- Office schema.
- Queue schema.
- Ticket schema.
- State-transition/event schema.
- Notification schema.
- Penalty schema.
- Audit-log schema.

## UX & Design

- Final visual design system.
- Ticket component design.
- Queue-state visual language.
- Accessibility requirements.
- Error and empty states.
- Loading states.
- Staff interaction optimization.

## Analytics

- Which metrics matter to administrators?
- What information should staff see?
- What information should students see?
- How should queue performance be measured?

---

# 32. Planned Documentation Split

This document is intentionally maintained as a **monolithic knowledge base** during the brainstorming phase.

Once the product direction stabilizes, it can be separated into:

### Product Requirements Document (PRD)

- Vision.
- Problem.
- Users.
- Requirements.
- Business rules.
- Acceptance criteria.

### Technical Design Document

- Architecture.
- API.
- Database.
- Authentication.
- Queue state machine.
- QR validation.
- Notifications.
- Security.

### UI/UX Specification

- Information architecture.
- User flows.
- Screen specifications.
- Components.
- Design system.
- Accessibility.

### Project Roadmap

- Version milestones.
- Priorities.
- Dependencies.
- Future enhancements.
- Implementation phases.

---

# 33. Current Project Status

QAMPUS currently has a **prototype-level product concept** with a partially defined student experience and an emerging staff experience.

The strongest areas currently defined are:

- Core product concept.
- Student authentication.
- Student information architecture.
- Student queue joining.
- Active ticket concept.
- Three-queue limit.
- QR arrival verification.
- Staff three-screen structure.
- Hybrid queue advancement model.
- Notification direction.
- Static QR decision for Version 1.
- General-office-queue approach.
- Cancellation/no-show warning-ban policy.
- Arrival verification fallback (ID check).
- Physical queue terminal concept.
- Offline operation model.

The main areas still requiring design work are:

- Detailed staff workflow.
- Exact queue state-transition rules.
- Exact ban escalation beyond the first ban.
- Exact queue cutoff values/formula.
- Guest authentication.
- Privacy/security model.
- Detailed data model.
- Technical architecture, including component boundaries and offline sync mechanism.
- Edge-case handling.
- Accessibility.
- Analytics.
- Final UI/UX specification.

---

# 34. Working Definition of Done for Version 1

A Version 1 QAMPUS release can be considered functionally complete when:

1. A student can authenticate with an authorized institutional account.
2. A student can view available campus office queues.
3. A student can join a queue remotely.
4. The system assigns a unique queue ticket.
5. The student can monitor the ticket from the dashboard.
6. The system limits students to three active queues.
7. Staff can view and manage their office queue.
8. Staff can call the next eligible student.
9. The system automatically changes the ticket state and sends notifications.
10. The system starts and enforces the arrival grace period.
11. The student can scan the office's static QR code.
12. The system validates the student's arrival.
13. Staff can start and complete the service.
14. Completed tickets move into student history.
15. No-shows and cancellations are handled according to defined policies.
16. Office information and schedules can be maintained.
17. Basic administrative controls and role permissions are enforced.
18. Core privacy, security, accessibility, and error-handling requirements are documented and implemented.

---

## 35. Living Knowledge Base Rule

This document is the current **source of truth** for QAMPUS during the brainstorming and product-definition phase.

Future discussions should:

1. Add newly discovered requirements.
2. Update decisions when they change.
3. Mark unresolved questions as open rather than inventing answers.
4. Distinguish confirmed requirements from proposals.
5. Preserve important reasoning behind major product decisions.
6. Eventually split stable sections into dedicated PRD, technical, UI/UX, and roadmap documents.

**Status vocabulary:**

- **Confirmed** — explicitly agreed upon.
- **Proposed** — recommended but not yet formally accepted.
- **TBD** — requires further discussion.
- **Future** — intentionally outside Version 1.

---

*End of QAMPUS Project Brief & Knowledge Base*
