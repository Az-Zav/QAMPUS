
import {
  MOCK_STAFF_ACTIVITY,
  MOCK_STAFF_NOTIFICATIONS,
  MOCK_STAFF_OFFENSES,
  MOCK_STAFF_QUEUE,
} from '@qampus/core/mock';

import {
  ACTIVITY_ACTION,
  OFFENSE_TYPE,
  QUEUE_STATUS,
  RULES,
  TICKET_STATUS,
} from '@qampus/core/domain';

import { getRemainingSeconds, toShortTicketNumber } from '@qampus/core/ticket';

import {
  getPenaltyState,
  hasActiveNoShowOffense,
} from '@/utils/penalties';

import {
  createContext,
  useContext,
  useReducer,
} from 'react';

import { useOfficeTickets } from '@/hooks/useOfficeTickets';
import { useTodayQueue } from '@/hooks/useTodayQueue';
import { db } from '@/lib/firebase';
import {
  callNext as callNextTicket,
  callTicket,
  closeQueue as closeQueueDoc,
  completeTicket,
  markTicketNoShow,
  openQueue as openQueueDoc,
  TicketingError,
  verifyByHolderId,
  waitingTickets,
} from '@qampus/backend';
import { useOffice } from './OfficeProvider';
import { useSession } from './SessionProvider';

// =====================================================
// QAMPUS STAFF QUEUE PROVIDER
//
// Fix #1: Correct no-show handling
// Fix #2: Accurate strike and ban calculations
// Fix #3: Unified queue state using useReducer
//
// Frontend-only implementation.
// No Firebase or backend integration yet.
// =====================================================

const QueueContext = createContext(null);

// =====================================================
// ACTION RESULTS
// =====================================================

export const VerifyResult = Object.freeze({
  OK: 'ok',
  NO_MATCH: 'noMatch',
  EXPIRED: 'expired',
});

export const NoShowResult = Object.freeze({
  OK: 'ok',
  INVALID_STATE: 'invalidState',
  TOO_EARLY: 'tooEarly',
  REASON_REQUIRED: 'reasonRequired',
  ALREADY_RECORDED: 'alreadyRecorded',
});

// =====================================================
// REDUCER ACTION TYPES
// =====================================================

const QueueAction = Object.freeze({
  CALL: 'CALL',
  VERIFY: 'VERIFY',
  INVALID_VERIFY: 'INVALID_VERIFY',
  NO_SHOW: 'NO_SHOW',
  COMPLETE: 'COMPLETE',
  OPEN_QUEUE: 'OPEN_QUEUE',
  CLOSE_QUEUE: 'CLOSE_QUEUE',
  CANCEL_QUEUE: 'CANCEL_QUEUE',
  OVERRIDE_CUTOFF: 'OVERRIDE_CUTOFF',
  REVOKE_OFFENSE: 'REVOKE_OFFENSE',
});

// =====================================================
// INITIAL STATE
// =====================================================

// Copy the mock collections so the reducer never
// modifies the original imported mock data.
function createInitialState() {
  return {
    queue: {
      ...MOCK_STAFF_QUEUE,
      current: MOCK_STAFF_QUEUE.current
        ? { ...MOCK_STAFF_QUEUE.current }
        : null,
      waiting: [...MOCK_STAFF_QUEUE.waiting],
    },
    offenses: [...MOCK_STAFF_OFFENSES],
    activity: [...MOCK_STAFF_ACTIVITY],
  };
}

// =====================================================
// ACTION IDs AND ACTIVITY LOG HELPERS
// =====================================================

// IDs are generated outside the reducer.
// Reducers must not perform external side effects.
let nextId = 0;

const newId = (prefix) =>
  `${prefix}_local_${++nextId}`;

// Pure function: no random values, counters,
// timestamps, or side effects.
function makeLog({
  id,
  action,
  ticket = null,
  actor,
  from = null,
  to = null,
  reason = null,
  note = null,
  now,
}) {
  return {
    id,
    action,
    ticket_number: ticket?.ticket_number ?? null,
    actor,
    from,
    to,
    reason: reason || null,
    note,
    created_at: now,
  };
}

// Log entries are supplied in chronological order.
// Store them newest first.
function prependActivity(activity, entries) {
  return [
    ...[...entries].reverse(),
    ...activity,
  ];
}

// =====================================================
// VALIDATION: VERIFY BY ID
// =====================================================

function validateVerification(state, idNumber, now) {
  const ticket = state.queue.current;

  if (
    !ticket ||
    ticket.status !== TICKET_STATUS.CALLED
  ) {
    return VerifyResult.NO_MATCH;
  }

  const expired =
    getRemainingSeconds(ticket.called_at, now) === 0;

  if (expired) {
    return VerifyResult.EXPIRED;
  }

  const expectedId =
    String(ticket.holder?.id_number ?? '')
      .trim()
      .toUpperCase();

  const enteredId =
    String(idNumber ?? '')
      .trim()
      .toUpperCase();

  if (!enteredId || expectedId !== enteredId) {
    return VerifyResult.NO_MATCH;
  }

  return VerifyResult.OK;
}

// =====================================================
// VALIDATION: MARK NO-SHOW
//
// R-12: CALLED -> NO_SHOW after grace period
// R-23a: IN_SERVICE -> NO_SHOW with a reason
// =====================================================

function validateNoShow(state, reason, now) {
  const ticket = state.queue.current;

  if (
    !ticket ||
    ![
      TICKET_STATUS.CALLED,
      TICKET_STATUS.IN_SERVICE,
    ].includes(ticket.status)
  ) {
    return NoShowResult.INVALID_STATE;
  }

  const verified =
    ticket.status === TICKET_STATUS.IN_SERVICE;

  const trimmedReason =
    String(reason ?? '').trim();

  // Staff must explain why a previous
  // successful verification is being reversed.
  if (verified && !trimmedReason) {
    return NoShowResult.REASON_REQUIRED;
  }

  // Normal called tickets must wait until
  // the grace period has expired.
  if (
    !verified &&
    getRemainingSeconds(ticket.called_at, now) > 0
  ) {
    return NoShowResult.TOO_EARLY;
  }

  // Prevent duplicate no-show offenses.
  if (
    hasActiveNoShowOffense(
      state.offenses,
      ticket.ticket_number,
    )
  ) {
    return NoShowResult.ALREADY_RECORDED;
  }

  return NoShowResult.OK;
}

// =====================================================
// FIX #3: PURE QUEUE REDUCER
//
// All queue, offense, and activity changes
// happen in a single state transition.
//
// The reducer never calls Date.now(),
// generates random IDs, or dispatches actions.
// =====================================================

function queueReducer(state, event) {
  const {
    queue,
    offenses,
    activity,
  } = state;

  const {
    type,
    payload = {},
    actor = 'System',
    now,
    id,
  } = event;

  const timestamp = Date.parse(now);

  // This counter is local to one reducer invocation.
  // Replaying the same event generates the same IDs.
  let logIndex = 0;

  const entry = (details) =>
    makeLog({
      ...details,
      id: `${id}_log_${++logIndex}`,
      actor: details.actor ?? actor,
      now,
    });

  switch (type) {
    // =================================================
    // WM01: CALL NEXT / OVERRIDE FIFO
    // =================================================

    case QueueAction.CALL: {
      const {
        ticketId,
        override = false,
        reason,
      } = payload;

      const ticket = queue.waiting.find(
        (item) => item.id === ticketId,
      );

      // Cannot call another ticket when
      // someone is already being served.
      if (
        !ticket ||
        queue.current ||
        queue.status !== QUEUE_STATUS.OPEN
      ) {
        return state;
      }

      // Normal calls must follow FIFO.
      // Priority overrides are exempt.
      if (
        !override &&
        queue.waiting[0]?.id !== ticketId
      ) {
        return state;
      }

      const called = {
        ...ticket,
        status: TICKET_STATUS.CALLED,
        called_at: now,
      };

      return {
        ...state,

        queue: {
          ...queue,
          current: called,
          waiting: queue.waiting.filter(
            (item) => item.id !== ticketId,
          ),
        },

        activity: prependActivity(activity, [
          entry({
            action: override
              ? ACTIVITY_ACTION.OVERRIDE
              : ACTIVITY_ACTION.CALLED,
            ticket,
            from: TICKET_STATUS.WAITING,
            to: TICKET_STATUS.CALLED,
            reason: override
              ? (reason ?? 'called ahead of FIFO')
              : null,
          }),
        ]),
      };
    }

    // =================================================
    // WM02: VERIFY BY ID
    // =================================================

    case QueueAction.VERIFY: {
      const ticket = queue.current;

      const result = validateVerification(
        state,
        payload.idNumber,
        timestamp,
      );

      if (result !== VerifyResult.OK) {
        return state;
      }

      const verifiedTicket = {
        ...ticket,
        status: TICKET_STATUS.IN_SERVICE,
        service_started_at: now,
      };

      return {
        ...state,

        queue: {
          ...queue,
          current: verifiedTicket,
        },

        activity: prependActivity(activity, [
          entry({
            action: ACTIVITY_ACTION.SERVICE_STARTED,
            ticket,
            from: TICKET_STATUS.CALLED,
            to: TICKET_STATUS.IN_SERVICE,
            note: 'Verified by ID',
          }),
        ]),
      };
    }

    // -------------------------------------------------
    // RECORD INVALID VERIFICATION
    // -------------------------------------------------

    case QueueAction.INVALID_VERIFY: {
      const ticket = queue.current;

      if (
        !ticket ||
        ticket.status !== TICKET_STATUS.CALLED
      ) {
        return state;
      }

      const result = validateVerification(
        state,
        payload.idNumber,
        timestamp,
      );

      // Never log a successful verification
      // as an invalid scan.
      if (result === VerifyResult.OK) {
        return state;
      }

      return {
        ...state,

        activity: prependActivity(activity, [
          entry({
            action: ACTIVITY_ACTION.INVALID_SCAN,
            ticket,
            note:
              result === VerifyResult.EXPIRED
                ? 'Verify by ID rejected: ticket expired'
                : 'Verify by ID: no match',
          }),
        ]),
      };
    }

    // =================================================
    // WM03: MARK NO-SHOW
    // FIXES #1, #2 AND #3
    // =================================================

    case QueueAction.NO_SHOW: {
      const ticket = queue.current;
      const reason = payload.reason ?? '';

      const result = validateNoShow(
        state,
        reason,
        timestamp,
      );

      // Invalid operations change nothing.
      if (result !== NoShowResult.OK) {
        return state;
      }

      const verified =
        ticket.status === TICKET_STATUS.IN_SERVICE;

      // Fix #2: Calculate the current remaining
      // strikes rather than lifetime offense count.
      const penaltyBefore = getPenaltyState(
        offenses,
        ticket.holder.user_id,
        timestamp,
      );

      const triggersBan =
        penaltyBefore.strikeCount + 1 >=
        RULES.OFFENSES_PER_BAN;

      // The event ID was created before dispatch.
      // This makes offense creation deterministic.
      const offense = {
        id: `${id}_offense`,
        holder: ticket.holder,
        ticket_number: ticket.ticket_number,
        type: OFFENSE_TYPE.NO_SHOW,
        resulted_in_ban: triggersBan,
        revoked_at: null,
        created_at: now,
      };

      // One state transition:
      // 1. Clear the current ticket.
      // 2. Add the offense.
      // 3. Record both activity entries.
      //
      // Call Next remains a separate action.
      return {
        ...state,

        queue: {
          ...queue,
          current: null,
        },

        offenses: [
          offense,
          ...offenses,
        ],

        activity: prependActivity(activity, [
          entry({
            action: ACTIVITY_ACTION.NO_SHOW,
            ticket,
            from: ticket.status,
            to: TICKET_STATUS.NO_SHOW,
            reason: verified
              ? String(reason).trim()
              : 'grace period lapsed',
          }),

          entry({
            action: ACTIVITY_ACTION.OFFENSE_RECORDED,
            ticket,
            actor: 'System',
          }),
        ]),
      };
    }

    // =================================================
    // WM04: COMPLETE SERVICE
    // =================================================

    case QueueAction.COMPLETE: {
      const ticket = queue.current;

      if (
        !ticket ||
        ticket.status !== TICKET_STATUS.IN_SERVICE
      ) {
        return state;
      }

      return {
        ...state,

        queue: {
          ...queue,
          current: null,
        },

        activity: prependActivity(activity, [
          entry({
            action: ACTIVITY_ACTION.COMPLETED,
            ticket,
            from: TICKET_STATUS.IN_SERVICE,
            to: TICKET_STATUS.COMPLETED,
          }),
        ]),
      };
    }

    // =================================================
    // OPEN QUEUE
    // =================================================

    case QueueAction.OPEN_QUEUE: {
      if (queue.status === QUEUE_STATUS.OPEN) {
        return state;
      }

      return {
        ...state,

        queue: {
          ...queue,
          status: QUEUE_STATUS.OPEN,
        },

        activity: prependActivity(activity, [
          entry({
            action: ACTIVITY_ACTION.QUEUE_OPENED,
          }),
        ]),
      };
    }

    // =================================================
    // WM05: CLOSE QUEUE
    // =================================================

    case QueueAction.CLOSE_QUEUE: {
      if (queue.status === QUEUE_STATUS.CLOSED) {
        return state;
      }

      return {
        ...state,

        queue: {
          ...queue,
          status: QUEUE_STATUS.CLOSED,
        },

        activity: prependActivity(activity, [
          entry({
            action: ACTIVITY_ACTION.QUEUE_CLOSED,
          }),
        ]),
      };
    }

    // =================================================
    // WM06: CANCEL QUEUE
    //
    // Cancellation never creates offenses.
    // =================================================

    case QueueAction.CANCEL_QUEUE: {
      const tickets = [
        queue.current,
        ...queue.waiting,
      ].filter(Boolean);

      // Ignore repeated cancellation
      // of an already empty, closed queue.
      if (
        queue.status === QUEUE_STATUS.CLOSED &&
        tickets.length === 0
      ) {
        return state;
      }

      const reason = payload.reason ?? '';

      const cancellationLogs = tickets.map(
        (ticket) =>
          entry({
            action: ACTIVITY_ACTION.CANCELLED,
            ticket,
            from: ticket.status,
            to: TICKET_STATUS.CANCELLED,
            reason,
          }),
      );

      return {
        ...state,

        queue: {
          ...queue,
          status: QUEUE_STATUS.CLOSED,
          current: null,
          waiting: [],
        },

        // Preserve the existing offense records.
        offenses,

        activity: prependActivity(activity, [
          ...cancellationLogs,

          entry({
            action: ACTIVITY_ACTION.QUEUE_CANCELLED,
            reason,
          }),
        ]),
      };
    }

    // =================================================
    // WM07: OVERRIDE CUTOFF
    // =================================================

    case QueueAction.OVERRIDE_CUTOFF: {
      if (queue.cutoff_overridden) {
        return state;
      }

      return {
        ...state,

        queue: {
          ...queue,
          cutoff_overridden: true,
        },

        activity: prependActivity(activity, [
          entry({
            action: ACTIVITY_ACTION.CUTOFF_OVERRIDE,
          }),
        ]),
      };
    }

    // =================================================
    // WM08: REVOKE OFFENSE
    //
    // Revoked records remain in history.
    // Penalty calculations automatically exclude
    // revoked offenses.
    // =================================================

    case QueueAction.REVOKE_OFFENSE: {
      const { offenseId, reason } = payload;

      const offense = offenses.find(
        (item) => item.id === offenseId,
      );

      if (!offense || offense.revoked_at) {
        return state;
      }

      return {
        ...state,

        offenses: offenses.map((item) =>
          item.id === offenseId
            ? {
                ...item,
                revoked_at: now,
              }
            : item,
        ),

        activity: prependActivity(activity, [
          entry({
            action: ACTIVITY_ACTION.OFFENSE_REVOKED,
            ticket: offense,
            reason,
            note: offense.holder.name,
          }),
        ]),
      };
    }

    default:
      return state;
  }
}

// =====================================================
// PROVIDER
//
// Preserves the existing public API used by:
//
// useStaffQueue.js
// useOffenses.js
// useActivityLog.js
// queue.jsx
// offenses.jsx
// =====================================================

// A stored ticket as the staff panel and table read it: short number and a holder block.
// The schema keeps only the holder's name and ID (no program), so the detail line is just the ID.
function toStaffTicket(ticket) {
  return {
    ...ticket,
    short_ticket_number: toShortTicketNumber(ticket.ticket_number),
    holder: { name: ticket.holder_name, id_number: ticket.holder_institutional_id },
  };
}

export function QueueProvider({ children }) {
  const { user } = useSession();

  // Fix #3: One state instead of three separate states.
  const [state, dispatch] = useReducer(
    queueReducer,
    undefined,
    createInitialState,
  );

  const actor = user?.name ?? 'System';

  // IDs and timestamps are generated BEFORE dispatch.
  // The reducer receives a fully specified event.
  const send = (type, payload = {}) => {
    dispatch({
      type,
      payload,
      actor,
      now: new Date().toISOString(),
      id: newId('action'),
    });
  };

  const { queue: mockQueue, offenses, activity } = state;

  // Open/closed, the waiting list and the current ticket are real (Firestore). Verify, no-show,
  // complete, cancel-queue, offenses and the activity log are still mock until their slices.
  // No queue doc for today means staff have not opened the queue.
  const { office } = useOffice();
  const todayQueue = useTodayQueue(office?.id);
  const officeTickets = useOfficeTickets(office?.id);
  const currentTicket = officeTickets.find(
    (ticket) =>
      ticket.id === todayQueue?.current_ticket_id &&
      (ticket.status === TICKET_STATUS.CALLED || ticket.status === TICKET_STATUS.IN_SERVICE),
  );
  const queue = {
    ...mockQueue,
    status: todayQueue?.status === QUEUE_STATUS.OPEN ? QUEUE_STATUS.OPEN : QUEUE_STATUS.CLOSED,
    current: currentTicket ? toStaffTicket(currentTicket) : null,
    waiting: waitingTickets(officeTickets).map(toStaffTicket),
    average_service_minutes: office?.default_service_minutes ?? mockQueue.average_service_minutes,
    // The real capacity cutoff arrives with the limits slice; this silences the mock cutoff banner
    cutoff_overridden: true,
  };

  // =================================================
  // WM01: CALL NEXT / OVERRIDE FIFO
  // =================================================

  // The listeners on the queue and ticket docs update the console; a refused write only logs for now
  const callNext = () => {
    if (office) callNextTicket(db, { office, tickets: officeTickets }).catch((error) => console.warn('Could not call next', error));
  };

  const overrideCall = (ticketId) => {
    if (office) callTicket(db, { office, ticketId }).catch((error) => console.warn('Could not call the ticket', error));
  };

  // =================================================
  // WM02: VERIFY BY ID
  // =================================================

  // Staff verify the called ticket by the holder's ID: CALLED -> IN_SERVICE inside the grace period.
  // Resolves to a VerifyResult for the modal (a refused write also reads as no match).
  const verifyById = async (idNumber) => {
    if (!currentTicket) return VerifyResult.NO_MATCH;
    try {
      await verifyByHolderId(db, { ticket: currentTicket, idNumber });
      return VerifyResult.OK;
    } catch (error) {
      return error.code === TicketingError.GRACE_EXPIRED ? VerifyResult.EXPIRED : VerifyResult.NO_MATCH;
    }
  };

  // =================================================
  // WM03: MARK NO-SHOW
  // =================================================

  // Staff mark the ticket at the window a no-show: a CALLED ticket after its grace period, an IN_SERVICE
  // one (verification reversed) with a reason. Resolves to a NoShowResult for the modal.
  // No offense is recorded yet; penalties come in their own slice.
  const markNoShow = async (reason = '') => {
    if (!currentTicket) return NoShowResult.INVALID_STATE;
    try {
      await markTicketNoShow(db, { office, ticket: currentTicket, reason });
      return NoShowResult.OK;
    } catch (error) {
      if (error.code === TicketingError.GRACE_NOT_EXPIRED) return NoShowResult.TOO_EARLY;
      if (error.code === TicketingError.REASON_REQUIRED) return NoShowResult.REASON_REQUIRED;
      return NoShowResult.INVALID_STATE;
    }
  };

  // =================================================
  // WM04: COMPLETE SERVICE
  // =================================================

  // Staff finish the ticket in service; the window is free again once the write lands
  const completeService = () => {
    if (office && currentTicket) {
      completeTicket(db, { office, ticket: currentTicket }).catch((error) => console.warn('Could not complete the ticket', error));
    }
  };

  // =================================================
  // QUEUE CONTROLS
  // =================================================

  // The listener on today's queue doc flips the console state; a refused write only logs for now
  const openQueue = () => {
    if (office) openQueueDoc(db, office).catch((error) => console.warn('Could not open the queue', error));
  };

  const closeQueue = () => {
    if (office) closeQueueDoc(db, office).catch((error) => console.warn('Could not close the queue', error));
  };

  const cancelQueue = (reason) => {
    send(QueueAction.CANCEL_QUEUE, {
      reason,
    });
  };

  const overrideCutoff = () => {
    send(QueueAction.OVERRIDE_CUTOFF);
  };

  // =================================================
  // WM08: REVOKE OFFENSE
  // =================================================

  const revokeOffense = (offenseId, reason) => {
    send(QueueAction.REVOKE_OFFENSE, {
      offenseId,
      reason,
    });
  };

  // Keep existing hook and screen interfaces.
  const value = {
    queue,
    offenses,
    activity,
    notifications: MOCK_STAFF_NOTIFICATIONS,

    callNext,
    overrideCall,
    verifyById,
    markNoShow,
    completeService,
    openQueue,
    closeQueue,
    cancelQueue,
    overrideCutoff,
    revokeOffense,
  };

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
}

// =====================================================
// QUEUE STORE HOOK
// =====================================================

export function useQueueStore() {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error(
      'useQueueStore must be used within a QueueProvider',
    );
  }

  return context;
}
