
import {
  MOCK_STAFF_ACTIVITY,
  MOCK_STAFF_NOTIFICATIONS,
} from '@qampus/core/mock';

import {
  ACTIVITY_ACTION,
  QUEUE_STATUS,
  TICKET_STATUS,
} from '@qampus/core/domain';

import { toShortTicketNumber } from '@qampus/core/ticket';

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import { useOfficeOffenses } from '@/hooks/useOfficeOffenses';
import { useOfficeTickets } from '@/hooks/useOfficeTickets';
import { useTodayQueue } from '@/hooks/useTodayQueue';
import { db } from '@/lib/firebase';
import {
  callNext as callNextTicket,
  callTicket,
  cancelOfficeQueue,
  closeQueue as closeQueueDoc,
  completeTicket,
  markTicketNoShow,
  openQueue as openQueueDoc,
  revokeOffense as revokeOffenseDoc,
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
// The ticket flow (queue, tickets) and the offenses read and write Firestore through @qampus/backend.
// The activity log is still local mock state.
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
  OVERRIDE_CUTOFF: 'OVERRIDE_CUTOFF',
});

// =====================================================
// INITIAL STATE
// =====================================================

// Copy the mock collections so the reducer never
// modifies the original imported mock data.
function createInitialState() {
  return {
    queue: { cutoff_overridden: false },
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
// FIX #3: PURE QUEUE REDUCER
//
// Queue cutoff and activity changes
// happen in a single state transition.
//
// The reducer never calls Date.now(),
// generates random IDs, or dispatches actions.
// =====================================================

function queueReducer(state, event) {
  const {
    queue,
    activity,
  } = state;

  const {
    type,
    actor = 'System',
    now,
    id,
  } = event;

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

  const { activity } = state;

  // The whole ticket flow and the offenses are real (Firestore). The activity log and notifications are still
  // mock until their slices.
  // No queue doc for today means staff have not opened the queue.
  const { office } = useOffice();
  const todayQueue = useTodayQueue(office?.id);
  const officeTickets = useOfficeTickets(office?.id);
  // Offenses recorded at this office, as the Offenses screen reads them (holder block)
  const officeOffenses = useOfficeOffenses(office?.id);
  const offenses = useMemo(
    () =>
      officeOffenses.map((offense) => ({
        ...offense,
        holder: { user_id: offense.user_id, name: offense.holder_name, id_number: offense.holder_institutional_id },
      })),
    [officeOffenses],
  );
  const currentTicket = officeTickets.find(
    (ticket) =>
      ticket.id === todayQueue?.current_ticket_id &&
      (ticket.status === TICKET_STATUS.CALLED || ticket.status === TICKET_STATUS.IN_SERVICE),
  );
  const queue = {
    status: todayQueue?.status === QUEUE_STATUS.OPEN ? QUEUE_STATUS.OPEN : QUEUE_STATUS.CLOSED,
    current: currentTicket ? toStaffTicket(currentTicket) : null,
    waiting: waitingTickets(officeTickets).map(toStaffTicket),
    average_service_minutes: office?.default_service_minutes ?? 0,
    // The capacity cutoff arrives with the limits slice; until then joining stays open while the queue is open
    cutoff_at: null,
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
  // The offense and the student's strike or ban are recorded in the same transaction.
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

  // Office cancels the whole queue (R-16): every unfinished ticket is cancelled by the office, nobody is penalized
  const cancelQueue = (reason) => {
    if (office) cancelOfficeQueue(db, { office, reason }).catch((error) => console.warn('Could not cancel the queue', error));
  };

  const overrideCutoff = () => {
    send(QueueAction.OVERRIDE_CUTOFF);
  };

  // =================================================
  // WM08: REVOKE OFFENSE
  // =================================================

  // Revoke an offense of this office (R-15): it stays on record, marked revoked, and the student's strikes
  // and ban are corrected. A refused write only logs for now.
  const revokeOffense = (offenseId, reason) => {
    const offense = officeOffenses.find((item) => item.id === offenseId);
    if (!offense) return;
    revokeOffenseDoc(db, { offense, reason, staffEmail: user.email }).catch((error) =>
      console.warn('Could not revoke the offense', error),
    );
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
