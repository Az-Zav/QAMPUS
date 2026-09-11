# Qampus — Project Brief & Knowledge Base

> **Document status:** Living working document  
> **Version:** 0.2  
> **Last updated:** September 11, 2026  
> **Scope:** Version 1 campus mobile queuing system  
> **Purpose:** Working source of truth during product definition; stable sections will later be split into PRD, TDD, UI/UX specification, and roadmap documents.

---

## 1. Project Overview

### 1.1 Project Name

**QAMPUS**

### 1.2 Product Concept

Qampus is a mobile campus queuing application that allows students and other authorized users of campus services to join school-service queues remotely instead of physically waiting in line.

Users can join an available office queue, receive a virtual queue ticket, monitor their position, and travel to the office when their ticket is called. Physical arrival is verified through the office's static QR code, with a staff-operated institutional-ID fallback for technical/accessibility cases.

Qampus is designed **student-first**, while recognizing that parents, guardians, and other non-students may sometimes use school services on a student's behalf.

### 1.3 Core Value Proposition

> **Digitize the existing campus queue without unnecessarily changing how campus offices already operate.**

Version 1 should mirror the existing physical queue model where practical, while removing unnecessary physical waiting.

### 1.4 Primary Goals

- Reduce unnecessary physical waiting time.
- Reduce physical congestion around service offices.
- Give users visibility into queue status.
- Give office staff a simple queue-management tool.
- Preserve the familiar operational model of campus offices.
- Provide a foundation for future service-specific queues and scheduling.

### 1.5 Initial Scope

- Campus/school services only.
- Examples include registrar, accounting/cashier, admissions, guidance, and other student-service offices.
- Version 1 generally assumes one general queue per office/service context.
- The system should reflect the office's existing queue behavior wherever practical.

### 1.6 Out of Scope for Version 1

- Appointment scheduling.
- Advanced slot/window allocation.
- Multi-campus support.
- Dynamic/rotating QR as a requirement.
- Commercial/non-school queues.
- Complex automatic queue optimization.
- Automatic staff-driven queue advancement.

---

# 2. Stakeholders & User Roles

## 2.1 Student / Primary User

Students are the primary mobile users.

They can:

- Complete onboarding.
- Authenticate using an authorized institutional account.
- Browse available queues.
- Join a queue.
- Hold up to three active queues.
- View active tickets.
- Monitor queue progress.
- Receive notifications.
- Scan an office QR code when called.
- View queue history.
- Cancel an active queue subject to policy.

## 2.2 Guest User

Parents, guardians, or other non-students may need to use campus services on behalf of students.

Guest access is therefore part of the product direction, but the exact authentication and persistent-identity model remains **TBD**.

Guest access must not become an easy mechanism for evading queue penalties or account restrictions.

## 2.3 Queue Provider / Office Staff

Staff operate queues for their assigned office.

They can:

- Authenticate through an authorized staff account.
- Access assigned offices.
- Monitor queue activity.
- Call the next ticket.
- Override the default next-ticket selection when operationally necessary.
- Verify student arrival.
- Start service.
- Complete service.
- Handle no-show conditions.
- View/manage basic office information and schedule where permitted.

Staff do **not** automatically advance the queue merely because a ticket is waiting. Staff decide when to call.

## 2.4 Super Administrator

System-level administrative role.

Potential responsibilities:

- Managing offices.
- Assigning staff.
- Managing system-wide permissions.
- Managing institutional configuration.
- Reviewing audit information.
- Managing privileged office-level operations.

Exact workflow remains **TBD**.

---

# 3. Authentication & Identity

## 3.1 Student Authentication

The student-first experience uses institutional authentication.

The intended institutional account mechanism is Google OAuth because the institution is expected to use Google accounts.

The system must distinguish authorized institutional accounts from ordinary personal Google accounts.

## 3.2 One-to-One Account Principle

An authenticated account represents one user identity.

Users should not be permitted to operate Qampus through another student's institutional account.

Authentication therefore establishes the account identity used throughout queue operations.

## 3.3 Guest Authentication

Guest accounts are allowed in principle because non-students may legitimately use campus services.

The exact identity mechanism is **TBD**.

A persistent identity mechanism may be necessary to prevent repeated guest-account creation from bypassing warnings or bans.

---

# 4. Student Application / Information Architecture

The current prototype establishes the student experience around:

1. **Home**
2. **Scan**
3. **Queues**

Profile and notifications are accessible from the header.

The prototype includes onboarding, authentication, Google sign-in, guest continuation, active queues, queue discovery, queue history, QR scanning, notifications, profile, warnings/bans, help, password management, and settings. fileciteturn0file1L1-L21

## 4.1 Home Dashboard

The dashboard contains:

- Profile access.
- Notification access.
- Greeting.
- Active queue tickets.
- Current number being served.
- User's ticket number.
- Approximate waiting information.
- Office/service location.
- Office operating hours.

The prototype visually represents active tickets as physical-ticket-like cards. fileciteturn0file1L6-L6

## 4.2 Queues

The Queues screen contains:

- **Join**
- **History**
- Search for an office/service.
- Available queue cards.
- Queue information.
- Join action.

The prototype displays estimated wait, queue count, location, and Join controls. fileciteturn0file1L7-L9

## 4.3 Scan

The Scan tab opens the QR check-in flow.

The prototype also includes manual-code entry as a possible fallback interaction. fileciteturn0file1L11-L11

## 4.4 Profile

The prototype includes:

- Student identity.
- Student ID.
- Queue history.
- Bans & warnings.
- Settings.
- Help & support.
- Logout.
- Password management.

Warnings and offense history are visible to the user. fileciteturn0file1L13-L18

---

# 5. Queue Rules

## 5.1 Who Can Join

Any authenticated Qampus account that is eligible for the relevant campus service can join a queue.

This includes:

- Students.
- Approved guest users.

## 5.2 Queue Ordering

The default queue priority is:

> **FIFO — First In, First Out**

The earliest eligible waiting ticket is normally selected first.

## 5.3 Staff Override

Staff may override the normal FIFO selection when operationally necessary.

A staff override:

- Selects a specific ticket rather than the default next ticket.
- Does not reorder the entire queue.
- Should be recorded in the audit log.
- Is an operational privilege, not the normal queue behavior.

The default experience remains FIFO.

## 5.4 Staff-Controlled Advancement

The system does **not** automatically call students.

Staff decide when to call the next ticket.

This means the queue can effectively halt while staff are occupied without automatically penalizing waiting students.

The system executes the consequences of the staff action consistently.

## 5.5 Active Queue Limit

A user may hold a maximum of:

> **3 active queues simultaneously.**

---

# 6. Queue Lifecycle / State Machine

The normal lifecycle is:

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

Alternative terminal paths:

```text
WAITING / CALLED → CANCELLED
CALLED → NO_SHOW
```

Office/system cancellation is treated separately from student fault.

## 6.1 WAITING

The ticket has been successfully created and is waiting in FIFO order.

## 6.2 CALLED

Staff explicitly call the ticket.

The system:

- Changes state to `CALLED`.
- Records the event/time.
- Notifies the user.
- Starts the arrival grace-period timer.

## 6.3 ARRIVED

The user has physically arrived and passed arrival verification.

Normal verification:

> User scans the office static QR code.

Fallback verification:

> Staff scans the user's institutional ID through a staff terminal.

Both routes ultimately request the same backend state transition:

> `CALLED → ARRIVED`

## 6.4 IN_SERVICE

Staff explicitly begin serving the verified user.

The system confirms the ticket is in `ARRIVED` and the staff member is authorized before changing it to `IN_SERVICE`.

## 6.5 COMPLETED

Staff explicitly complete the service.

The ticket becomes `COMPLETED`, is removed from active queues, and enters history.

## 6.6 CANCELLED

A ticket is cancelled.

The consequences depend on who/what caused the cancellation and when it occurred.

## 6.7 NO_SHOW

A called user fails to complete arrival verification within the applicable grace period.

---

# 7. Cancellation, Grace Period & Penalties

## 7.1 Called Users May Still Cancel

A user is allowed to cancel even after being called.

However, cancellation timing determines whether it is treated leniently or as a no-show.

## 7.2 Grace-Period Model

The current working example is a **1-minute grace period**, with the first half treated as the lenient cancellation window.

The exact production grace period remains **TBD**, but the rule structure is confirmed:

```text
CALLED
│
├── Early cancellation
│   within first half of grace period
│   → CANCELLED + WARNING
│
├── Late cancellation
│   after first half of grace period
│   → NO_SHOW-level offense
│
└── Grace period expires
    → NO_SHOW
```

Example:

> If the grace period is 1 minute, cancellation within the first 30 seconds produces a warning. Cancellation after 30 seconds is treated as a no-show.

## 7.3 Progressive Penalty

The first lenient cancellation offense is a warning rather than an immediate ban.

Repeated offenses escalate.

The current product direction is:

- First warning/offense: warning.
- Repeated warning threshold: temporary ban.
- No-show and sufficiently serious/repeated behavior can contribute to the offense history.

The exact strike-to-ban formula remains **TBD**.

The prototype already exposes warnings and offense history to users. fileciteturn0file1L12-L18

## 7.4 Office/System Cancellation

If the office legitimately closes/cancels an active queue:

- Active tickets are cancelled by the system.
- Users receive a notification explaining the office-provided reason.
- The cancellation is **not treated as the user's fault**.
- It does not create a no-show or warning.
- This includes users who were already called/arrived if the office must terminate the queue.

Queue cancellation should be an **office-level privileged operation**, not a casual action available to every staff member.

---

# 8. Closing-Time Capacity Guardrail

The system should protect staff from predictable overtime without making students responsible for estimating office capacity.

## 8.1 Principle

The cutoff applies to **new admissions**, not to already accepted tickets.

Once a ticket has been accepted into the queue, it should not be cancelled merely because closing time approaches.

## 8.2 Historical Capacity

Rather than hardcoding a rule such as "last 10 tickets," Qampus should eventually calculate a conservative admission capacity using historical service behavior.

Relevant data can include:

- Historical service duration.
- Typical throughput.
- Time remaining before closing.
- Office-specific behavior.

The resulting capacity should be conservative enough to reduce the probability of accepted tickets extending beyond closing.

## 8.3 Student Experience

When the calculated capacity is reached:

- The Join button becomes disabled.
- The student sees a contextual explanation such as:
  > Queue unavailable due to remaining service capacity before closing.
- Students are not expected to calculate this themselves.

## 8.4 Staff Experience

Staff are notified that the system has reached its normal admission cutoff.

The queue otherwise continues normally.

Authorized staff may override the cutoff if they determine that the office can accommodate additional users.

Overrides should be logged for accountability.

## 8.5 Important Principle

The capacity model is a **guardrail, not a promise**.

Qampus should not promise that every accepted ticket will finish before closing.

If the office finishes early, that is beneficial. The purpose of the guardrail is to make overtime less likely without punishing students who were legitimately admitted.

---

# 9. QR Arrival Verification

## 9.1 Normal Flow

The office provides a static QR code.

The user scans it after being called.

The backend verifies:

1. The authenticated identity.
2. The user's active ticket.
3. The ticket belongs to the relevant office/queue.
4. The ticket is currently `CALLED`.

If valid:

> `CALLED → ARRIVED`

## 9.2 Premature / Invalid Scan

If the ticket is still `WAITING`, the scan is rejected.

The ticket state does not change.

If a user repeatedly attempts invalid scans while waiting, the attempts are logged.

## 9.3 Staff Visibility

The physical QR should be placed/displayed where staff can see the scanning interaction.

This provides an additional operational guardrail against someone falsely claiming to be the called user.

## 9.4 Institutional ID Verification

Normal QR check-in does not require a manual ID check every time.

The institutional identity is already authenticated by the account.

However, institutional ID verification becomes the fallback for technical situations, such as:

- Dead phone.
- No usable phone.
- QR scanning unavailable to the user.
- Other legitimate technical/accessibility situations.

Staff can scan the user's institutional ID through the staff terminal.

The backend then performs the same eligibility check against the currently called ticket.

---

# 10. Invalid QR Scan Monitoring

If a user who is not currently called scans the office QR:

- The scan is rejected.
- No queue-state change occurs.
- The attempt is logged.

Repeated attempts may trigger a warning.

Current working threshold:

> **3 invalid scans while waiting → warning + staff notification**

This is intended as an abuse-prevention guardrail rather than an automatic queue offense.

Exact enforcement and escalation remain **TBD**.

---

# 11. Physical Queue Terminal / Office Display

A physical display is part of the resilient Version 1 design.

The terminal/display should serve multiple purposes.

## 11.1 Queue Visibility

Display:

- **Now Serving**
- The next few tickets, currently envisioned as **the next 3 tickets**

This gives users a physical fallback when they cannot rely on their phone.

## 11.2 Static QR

The same display can present the office's static QR code for normal arrival scanning.

This creates a single physical point that supports:

- Normal QR check-in.
- Visibility for users without a working phone.
- Queue awareness.

## 11.3 Dead-Phone Scenario

If a user's phone is dead:

1. They know they joined the queue.
2. They monitor the physical display.
3. When their ticket appears as called, they approach the service window.
4. Staff verify them using institutional ID.
5. The ticket proceeds through the normal lifecycle.

This avoids penalizing a legitimate user for a device failure.

---

# 12. Loss of Internet Connectivity

## 12.1 Student Loses Internet While Waiting

Once a ticket has been successfully created, loss of internet does not remove the ticket or change its queue position.

The user can:

- Reconnect later.
- Monitor the physical terminal.
- Approach the office when their ticket is displayed as called.

## 12.2 Joining Without Internet

Internet should not be an absolute requirement for joining a queue.

If the user cannot access the mobile application/network:

1. They approach the physical Qampus terminal.
2. They authenticate using institutional ID.
3. The terminal creates the queue ticket.
4. They can monitor the physical display.

This makes the physical terminal an actual access fallback rather than merely a display.

---

# 13. Office Queue Pause / Staff Busy State

Staff do not need to close the queue merely because they are temporarily busy.

If the queue remains open:

- Students can remain `WAITING`.
- Staff simply do not call another ticket until ready.
- The system does not automatically progress the queue.
- Waiting students are not penalized for the staff's temporary workload.

This is distinct from an official office-level queue cancellation/closure.

---

# 14. Office-Level Queue Cancellation / Closure

A queue can be cancelled for legitimate office reasons.

This is a privileged office operation.

## 14.1 Authorization

Ordinary staff should not be able to cancel an entire queue arbitrarily.

Queue cancellation should require appropriate office-level authority.

## 14.2 Student Experience

When an office queue is cancelled:

- Active tickets are cancelled.
- Users receive a notification/modal.
- The notification includes the reason supplied by the office.
- No user warning/no-show penalty is generated.

## 14.3 Called / Arrived Tickets

If the office must terminate service, tickets already in `CALLED` or `ARRIVED` can also be cancelled as an office/system action.

This is distinct from a user voluntarily cancelling.

---

# 15. System Outage & Offline / Resilient Operation

Qampus should not become a single point of failure for the university's physical queue process.

The university's queueing process must continue even if the central Qampus system becomes unavailable.

## 15.1 Offline Office Mode

The office terminal maintains a local copy of the active queue.

If the central network/server becomes unavailable:

1. The office detects the outage.
2. The local terminal switches to offline queue mode.
3. The locally stored queue becomes authoritative for that office during the outage.
4. Staff continue operating the queue locally.
5. Staff use institutional-ID scanning rather than relying on student QR scanning.
6. The queue continues normally from the staff's perspective.

## 15.2 Student Communication During Outage

If the system goes down mid-queue:

- The physical display shows a clear system-unavailable/offline message.
- The active queue remains available locally.
- Users should be informed through available online channels that they must rely on the physical terminal while the outage persists.
- The physical terminal remains the authoritative source for local queue progression during the outage.

## 15.3 Recovery

When central Qampus service returns:

- Offline events must be synchronized back to the central system.
- The central system must reconcile rather than blindly overwrite local events.
- Queue history, state transitions, and audit events must remain consistent.

**Detailed synchronization/conflict-resolution architecture is TBD.**

---

# 16. Normal Flow Architecture

Version 1 remains a **monolithic backend architecture**.

The architecture is organized into logical modules rather than separate microservices.

## 16.1 Major Components

### Student Client

Responsible for:

- Authentication interface.
- Queue browsing.
- Queue joining.
- Ticket display.
- Queue status.
- QR scanning.
- Notifications display.
- History/profile/settings.

The client requests actions; it does not decide authoritative queue state.

### Staff Client

Responsible for:

- Staff authentication.
- Queue monitoring.
- Call Next.
- Manual ticket selection/override.
- Arrival verification.
- Start service.
- Complete service.
- Office operational controls.

### Physical Qampus Terminal

Responsible for:

- Displaying Now Serving.
- Displaying next 3 tickets.
- Displaying the static QR.
- Providing an institutional-ID fallback for joining.
- Providing a staff-operated institutional-ID verification path.
- Supporting local/offline queue operation.

### Monolithic Backend

Authoritative application layer.

Responsible for:

- Authentication/authorization integration.
- User/role management.
- Office management.
- Queue management.
- Ticket management.
- State transitions.
- Queue ordering.
- Cancellation/no-show rules.
- Grace-period enforcement.
- Capacity guardrails.
- QR validation.
- Notifications.
- Penalties/warnings.
- Audit logging.
- Offline synchronization.

### Database

Persistent source for:

- Users.
- Offices.
- Queues.
- Tickets.
- State/event history.
- Notifications.
- Penalties.
- Audit records.
- Configuration.

### Institutional Identity Provider

Authenticates users and supplies authorized identity information.

Google OAuth is the current institutional authentication direction.

### Notification Service

Delivers queue-related push notifications and other approved alerts.

---

# 17. Normal Queue Flow — Logical Sequence

The agreed normal flow is:

```text
STUDENT CLIENT
      │
      │ Join Queue
      ▼
BACKEND MONOLITH
      │
      │ Validate account + queue rules
      ▼
DATABASE
      │
      │ Create ticket
      ▼
WAITING
      │
      │ Staff presses Call Next
      ▼
STAFF CLIENT
      │
      ▼
BACKEND
      │
      │ Select next eligible FIFO ticket
      │ or authorized override
      ▼
CALLED
      │
      ├── Notification Service → Student
      └── Physical Terminal → Now Serving / Next 3
      │
      │ Student scans office QR
      ▼
BACKEND
      │
      │ Verify identity + called ticket + office
      ▼
ARRIVED
      │
      │ Staff starts service
      ▼
IN_SERVICE
      │
      │ Staff completes service
      ▼
COMPLETED
      │
      ▼
HISTORY
```

### Architectural Principle

> **The client requests. The backend decides. The database remembers.**

The same backend state-transition rules should be used regardless of whether an action originates from:

- Student mobile client.
- Staff client.
- Physical terminal.

This prevents different entry points from implementing conflicting queue logic.

---

# 18. Component Responsibility Model

The normal flow should follow this responsibility pattern:

```text
Client
  ↓
Request
  ↓
Backend validation / authorization / business rules
  ↓
Database state change
  ↓
Side effects
  ├── Notification
  ├── Staff UI update
  └── Physical display update
```

Clients should not independently decide:

- Queue position.
- Whether a user can join.
- Whether a ticket is eligible to be called.
- Whether a QR scan is valid.
- Whether a grace period has expired.
- Whether a penalty applies.

These are backend-owned rules.

---

# 19. Architecture Work Remaining

The normal flow architecture is now conceptually defined.

The next architecture pass should address:

### 19.1 Edge-Case Architecture

Map how the normal components behave for:

- Invalid QR scans.
- Dead phones.
- Lost internet.
- Wrong office QR.
- Office closure.
- Staff overrides.
- Grace-period expiry.
- Duplicate actions.
- Notification failure.
- Authentication failure.

### 19.2 Offline / Resilient Architecture

Define:

- Local data store.
- Local queue authority.
- Offline event log.
- Sync mechanism.
- Conflict resolution.
- Duplicate event handling.
- Recovery after partial outages.
- Security of local data.
- How staff authenticate while offline.

### 19.3 Technical Stack

Only after the logical architecture is sufficiently stable should implementation technologies be selected.

---

# 20. Data Model — Deferred

Likely core entities:

- User.
- Student profile.
- Guest profile.
- Staff profile.
- Office.
- Office schedule.
- Queue.
- Queue ticket.
- Queue event/state transition.
- QR configuration.
- Notification.
- Warning/penalty record.
- Audit log.
- Offline event/synchronization record.

Exact fields and relationships remain TBD.

---

# 21. Privacy & Security — To Be Defined

Must eventually define:

- Stored user information.
- Authentication data.
- Visibility of student information.
- Staff permissions.
- Office permissions.
- Queue history retention.
- QR event logging.
- Audit retention.
- Guest identity.
- Ban enforcement.
- Offline local data protection.
- Data encryption.
- Access control.
- Session handling.

### Data Minimization Principle

Only information necessary for authentication, queue operation, notifications, auditing, security, and administration should be retained.

---

# 22. Accessibility — To Be Defined

Areas to define:

- Text readability.
- Contrast.
- Non-color queue indicators.
- Screen-reader support.
- Touch targets.
- Clear error messages.
- QR alternatives.
- Notification accessibility.
- Reduced-motion support.
- Physical-terminal accessibility.

The institutional-ID fallback is also an important accessibility/resilience mechanism.

---

# 23. Analytics & Historical Capacity

Analytics should support operations without unnecessarily exposing individual behavior.

Potential metrics:

- Average waiting time.
- Average service duration.
- Queue throughput.
- No-show rate.
- Cancellation rate.
- Peak periods.
- Number served.
- Time between calls.
- Office utilization.

Historical service-duration and throughput data are especially relevant to the closing-time admission capacity guardrail.

The exact calculation method is TBD.

---

# 24. UI / UX Principles

> **The app should feel simpler than standing in line.**

Priorities:

- Immediate queue-status comprehension.
- Minimal join steps.
- Clear active-ticket presentation.
- Strong "Your Turn" feedback.
- Clear QR success/failure feedback.
- Simple staff controls.
- Physical fallback visibility.
- Clear explanation when joining is unavailable.
- No punishment for office/system failures.

The prototype already reflects the core student flow of remote joining, notifications, active tickets, queue discovery, history, QR check-in, and account/warning management. fileciteturn0file1L1-L21

---

# 25. Product Principles

### 25.1 Mirror Reality Before Optimizing It

Digitize existing campus queue behavior before introducing complex scheduling.

### 25.2 Humans Decide, the System Executes

Staff decide when to call.

The system handles repeatable state transitions, timers, notifications, logging, and history.

### 25.3 The Backend Is the Authority

Clients are interfaces to the queue, not independent sources of truth.

### 25.4 Resilience Is Part of the Product

Qampus should make queuing easier without making the university dependent on Qampus being online.

### 25.5 Do Not Punish Legitimate Failure

Office closure, system outages, device failure, and other legitimate technical conditions should not become student offenses.

### 25.6 Prevent Abuse Without Creating Excessive Friction

Security measures should target suspicious behavior while preserving reasonable fallback paths.

### 25.7 Design for Evolution

The Version 1 architecture should leave room for:

- Multiple service queues.
- Dynamic QR.
- Appointments.
- Multiple service windows.
- More advanced scheduling.
- Multiple campuses.

---

# 26. Current Confirmed Decisions

| Area | Current Decision |
|---|---|
| Product | QAMPUS |
| Primary audience | Students first |
| Additional users | Guest users may be supported |
| Authentication | Institutional account |
| Institutional auth direction | Google OAuth |
| Account principle | One-to-one authenticated identity |
| Queue ordering | FIFO |
| Queue advancement | Staff-controlled |
| Automatic calling | No |
| Staff override | Yes |
| Override behavior | Select specific ticket; do not reorder entire queue |
| Active queue limit | 3 |
| Normal lifecycle | WAITING → CALLED → ARRIVED → IN_SERVICE → COMPLETED |
| Cancellation | Allowed while CALLED |
| Early called cancellation | Warning |
| Late called cancellation | No-show-level offense |
| Working grace example | 1 minute |
| Working half-grace example | 30 seconds |
| Repeated offenses | Escalate toward temporary ban |
| QR | Static office QR |
| Normal arrival verification | Student QR scan |
| ID verification | Fallback, not routine requirement |
| Invalid early QR scan | Reject + log |
| Repeated invalid QR scans | Warning threshold currently 3 |
| Physical terminal | Yes |
| Terminal display | Now Serving + next 3 |
| Terminal QR | Static office QR |
| Join without internet | Physical terminal + institutional ID |
| Waiting without internet | Ticket remains active; use physical display |
| Staff busy | Queue remains open; staff simply stop calling |
| Office queue cancellation | Privileged office-level action |
| Office cancellation penalty | None |
| Closing cutoff | Capacity-based |
| Closing capacity basis | Historical service/throughput data |
| Student cutoff behavior | Join disabled + contextual message |
| Staff cutoff override | Allowed + logged |
| Offline office mode | Local queue operation |
| Offline arrival verification | Staff ID scan |
| Central backend architecture | Monolith |
| Backend authority | Yes |
| Microservices | Not required for Version 1 |

---

# 27. Open Questions

## Queue Policy

- What is the final grace-period duration?
- What exactly constitutes a no-show after grace expiry?
- Can staff skip a called ticket without immediately creating a no-show?
- Can staff recall a student?
- What happens when multiple staff operate one queue?
- What is the exact queue-capacity formula?

## Penalties

- Exact strike-to-ban progression.
- Whether no-show and late cancellation have identical weight.
- Whether staff/admin can remove a penalty.
- Penalty duration.
- Penalty record retention.

## Guests

- Exact guest authentication method.
- Whether guest identity must persist.
- What guest information is collected.
- How guest bans persist.

## Office Management

- Who creates offices?
- Who edits office information?
- Who can modify schedules?
- Who can open/close queues?
- Who can invoke office-level cancellation?
- Who can override capacity cutoffs?

## QR

- Static QR security sufficiency.
- Physical QR placement.
- Exact invalid-scan threshold/escalation.
- Future dynamic QR design.

## Notifications

- Exact "almost your turn" threshold.
- Exact grace-period reminder timing.
- Push vs in-app behavior.
- Notification failure handling.

## Offline / Resilience

- Local storage technology.
- How much queue data is replicated locally.
- Offline authentication strategy.
- Event synchronization format.
- Conflict resolution.
- Clock/timestamp handling.
- Duplicate event prevention.
- What happens if both central and local systems change independently.
- Recovery after terminal failure during offline mode.

## Technical Architecture

- Mobile framework.
- Backend framework.
- Database.
- Real-time update mechanism.
- Notification provider.
- Hosting/deployment.
- Monitoring.
- Logging.
- Backup/recovery.

## Data Model

- Exact schemas.
- Relationships.
- State-event representation.
- Audit model.
- Offline event model.

## UX

- Final design system.
- Exact ticket states.
- Error states.
- Offline screens.
- Staff workflow.
- Physical terminal UI.
- Accessibility requirements.

---

# 28. Planned Documentation Split

The current document remains intentionally monolithic during product-definition.

Once stable, it should be separated into:

## Product Requirements Document (PRD)

- Product vision.
- Problem.
- Users.
- Requirements.
- Business rules.
- Acceptance criteria.

## Technical Design Document (TDD)

- Logical architecture.
- Component responsibilities.
- State machine.
- Data model.
- API/contracts.
- Authentication.
- QR verification.
- Notifications.
- Offline architecture.
- Synchronization.
- Security.

## UI/UX Specification

- Information architecture.
- User flows.
- Screen specifications.
- Components.
- Design system.
- Accessibility.
- Physical terminal interface.

## Roadmap

- Milestones.
- Priorities.
- Dependencies.
- Implementation phases.
- Future features.

---

# 29. Current Project Status

Qampus has a working prototype and a substantially defined Version 1 product model.

The prototype establishes the primary student-facing flow and visual direction. fileciteturn0file1L1-L21

The product-definition discussions have now additionally established:

- FIFO queue behavior.
- Staff-controlled advancement.
- Staff ticket overrides.
- Called-state cancellation behavior.
- Grace-period penalty logic.
- Capacity-based closing cutoff.
- Staff cutoff overrides.
- Static QR verification.
- Invalid QR handling.
- Institutional-ID fallback.
- Physical queue display.
- Internet-loss behavior.
- Offline joining fallback.
- Office-level queue cancellation.
- Local/offline queue operation during system outages.
- Monolithic normal-flow architecture.
- Backend-as-authority principle.
- Logical component responsibilities.
- Normal queue sequence.

The main remaining work is no longer defining the basic queue concept. It is formalizing the architecture, detailed policies, data model, security/privacy, accessibility, and implementation choices.

---

# 30. Working Definition of Done for Version 1

Version 1 is functionally complete when:

1. An eligible user can authenticate.
2. A user can view available campus queues.
3. A user can join a queue remotely.
4. A user can join through the physical terminal when necessary.
5. The system assigns a ticket.
6. The user can monitor the ticket.
7. The system enforces the three-active-queue limit.
8. Staff can operate the queue.
9. FIFO is the default ordering.
10. Staff can override the next ticket when authorized.
11. Staff can call tickets manually.
12. The system handles the resulting state transition.
13. Users receive turn notifications.
14. The physical terminal shows Now Serving and upcoming tickets.
15. Called users can verify arrival using the office QR.
16. Staff can use institutional ID as the technical fallback.
17. Invalid scans are rejected and logged.
18. Grace periods are enforced.
19. Cancellation/no-show rules are enforced.
20. Staff can start and complete service.
21. Completed tickets move to history.
22. Closing-time admission capacity is guarded.
23. Authorized staff can override the cutoff.
24. Office-level queue cancellation can be performed by authorized personnel.
25. Office cancellation does not punish users.
26. The queue can continue operating locally during a central system outage.
27. Offline events can eventually synchronize back to the central system.
28. Core permissions, privacy, security, accessibility, and error handling are documented and implemented.

---

# 31. Living Knowledge Base Rule

This document is the current **source of truth** during Qampus product-definition.

Future discussions should:

1. Add newly discovered requirements.
2. Update decisions when they change.
3. Mark unresolved questions as TBD rather than inventing answers.
4. Distinguish confirmed decisions from proposals.
5. Preserve reasoning behind major product decisions.
6. Eventually split stable material into dedicated PRD, TDD, UI/UX, and roadmap documents.

### Status Vocabulary

- **Confirmed** — explicitly agreed upon.
- **Proposed** — recommended but not formally accepted.
- **TBD** — requires further discussion.
- **Future** — intentionally outside Version 1.

---

*End of Qampus Project Brief & Knowledge Base — Version 0.2*
