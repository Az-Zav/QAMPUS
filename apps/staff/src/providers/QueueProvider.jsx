
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

import { getRemainingSeconds } from '@qampus/core/ticket';

import {
  getPenaltyState,
  hasActiveNoShowOffense,
} from '@/utils/penalties';

import {
  buildReasonDetails,
  formatReasonForLog,
  REASON_ACTION,
  ReasonValidationResult,
  validateReasonSelection,
} from '@/constants/reasons';

import {
  createContext,
  useContext,
  useReducer,
} from 'react';

import { useSession } from './SessionProvider';

// =====================================================
// QAMPUS STAFF QUEUE PROVIDER
//
// Preserves:
// - Manual FIFO advancement
// - Manual No-Show handling
// - Two-offense penalty calculation
// - Unified reducer state
// - Structured multi-select reasons
// - Action result validation
//
// Temporary mock data remains for backend handoff.
//
// Fix #6 demo/reset actions have been removed.
// =====================================================

const QueueContext = createContext(null);

// =====================================================
// ACTION RESULTS
// =====================================================

export const QueueActionResult = Object.freeze({
  OK: 'ok',
  INVALID_STATE: 'invalidState',
  QUEUE_CLOSED: 'queueClosed',
  ACTIVE_TICKET: 'activeTicket',
  NO_WAITING_TICKETS: 'noWaitingTickets',
  TICKET_NOT_FOUND: 'ticketNotFound',
  ALREADY_OPEN: 'alreadyOpen',
  ALREADY_CLOSED: 'alreadyClosed',
  ALREADY_OVERRIDDEN: 'alreadyOverridden',
});

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

export const OverrideResult = Object.freeze({
  OK: 'ok',
  REASON_REQUIRED: 'reasonRequired',
  INVALID_STATE: 'invalidState',
  TICKET_NOT_FOUND: 'ticketNotFound',
  ALREADY_NEXT: 'alreadyNext',
});

export const RevokeResult = Object.freeze({
  OK: 'ok',
  INVALID_REASON: 'invalidReason',
  OFFENSE_NOT_FOUND: 'offenseNotFound',
  ALREADY_REVOKED: 'alreadyRevoked',
});

export const CancelResult = Object.freeze({
  OK: 'ok',
  INVALID_REASON: 'invalidReason',
  INVALID_STATE: 'invalidState',
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
// INITIAL MOCK STATE
// =====================================================

function createInitialState() {
  return {
    queue: {
      ...MOCK_STAFF_QUEUE,
      current: MOCK_STAFF_QUEUE.current
        ? { ...MOCK_STAFF_QUEUE.current }
        : null,
      waiting: MOCK_STAFF_QUEUE.waiting.map(
        (ticket) => ({ ...ticket }),
      ),
    },

    offenses: MOCK_STAFF_OFFENSES.map(
      (offense) => ({ ...offense }),
    ),

    activity: MOCK_STAFF_ACTIVITY.map(
      (item) => ({ ...item }),
    ),
  };
}

// =====================================================
// ACTIVITY HELPERS
// =====================================================

let nextId = 0;

const newId = (prefix) =>
  `${prefix}_local_${++nextId}`;

function makeLog({
  id,
  action,
  ticket = null,
  actor,
  from = null,
  to = null,
  reason = null,
  reasonDetails = null,
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
    reason_details: reasonDetails,
    note,
    created_at: now,
  };
}

function prependActivity(activity, entries) {
  return [
    ...[...entries].reverse(),
    ...activity,
  ];
}

// =====================================================
// REASON VALIDATION
// =====================================================

function isValidReason(action, selection) {
  return (
    validateReasonSelection(action, selection) ===
    ReasonValidationResult.OK
  );
}

function getReasonData(action, selection) {
  if (!isValidReason(action, selection)) {
    return null;
  }

  return {
    text: formatReasonForLog(action, selection),
    details: buildReasonDetails(action, selection),
  };
}

// =====================================================
// VERIFY BY ID VALIDATION
// =====================================================

function validateVerification(state, idNumber, now) {
  const ticket = state.queue.current;

  if (
    !ticket ||
    ticket.status !== TICKET_STATUS.CALLED
  ) {
    return VerifyResult.NO_MATCH;
  }

  if (
    getRemainingSeconds(ticket.called_at, now) === 0
  ) {
    return VerifyResult.EXPIRED;
  }

  const expectedId = String(
    ticket.holder?.id_number ?? '',
  ).trim().toUpperCase();

  const enteredId = String(
    idNumber ?? '',
  ).trim().toUpperCase();

  if (!enteredId || expectedId !== enteredId) {
    return VerifyResult.NO_MATCH;
  }

  return VerifyResult.OK;
}

// =====================================================
// NO-SHOW VALIDATION
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

  if (
    verified &&
    !isValidReason(
      REASON_ACTION.VERIFIED_NO_SHOW,
      reason,
    )
  ) {
    return NoShowResult.REASON_REQUIRED;
  }

  if (
    !verified &&
    getRemainingSeconds(ticket.called_at, now) > 0
  ) {
    return NoShowResult.TOO_EARLY;
  }

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
// FIFO OVERRIDE VALIDATION
// =====================================================

function validateOverride(state, ticketId, reason) {
  const { queue } = state;

  if (
    !isValidReason(
      REASON_ACTION.FIFO_OVERRIDE,
      reason,
    )
  ) {
    return OverrideResult.REASON_REQUIRED;
  }

  if (
    queue.status !== QUEUE_STATUS.OPEN ||
    queue.current
  ) {
    return OverrideResult.INVALID_STATE;
  }

  const ticket = queue.waiting.find(
    (item) => item.id === ticketId,
  );

  if (!ticket) {
    return OverrideResult.TICKET_NOT_FOUND;
  }

  if (queue.waiting[0]?.id === ticketId) {
    return OverrideResult.ALREADY_NEXT;
  }

  return OverrideResult.OK;
}

// =====================================================
// QUEUE CANCELLATION VALIDATION
// =====================================================

function validateCancellation(state, reason) {
  if (
    !isValidReason(
      REASON_ACTION.QUEUE_CANCELLATION,
      reason,
    )
  ) {
    return CancelResult.INVALID_REASON;
  }

  const { queue } = state;

  if (
    queue.status === QUEUE_STATUS.CLOSED &&
    !queue.current &&
    queue.waiting.length === 0
  ) {
    return CancelResult.INVALID_STATE;
  }

  return CancelResult.OK;
}

// =====================================================
// OFFENSE REVOCATION VALIDATION
// =====================================================

function validateRevocation(state, offenseId, reason) {
  if (
    !isValidReason(
      REASON_ACTION.OFFENSE_REVOCATION,
      reason,
    )
  ) {
    return RevokeResult.INVALID_REASON;
  }

  const offense = state.offenses.find(
    (item) => item.id === offenseId,
  );

  if (!offense) {
    return RevokeResult.OFFENSE_NOT_FOUND;
  }

  if (offense.revoked_at) {
    return RevokeResult.ALREADY_REVOKED;
  }

  return RevokeResult.OK;
}

// =====================================================
// PURE QUEUE REDUCER
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
  let logIndex = 0;

  const entry = (details) =>
    makeLog({
      ...details,
      id: `${id}_log_${++logIndex}`,
      actor: details.actor ?? actor,
      now,
    });

  switch (type) {
    // ================================================
    // CALL NEXT / FIFO OVERRIDE
    // ================================================

    case QueueAction.CALL: {
      const {
        ticketId,
        override = false,
        reason,
      } = payload;

      const ticket = queue.waiting.find(
        (item) => item.id === ticketId,
      );

      if (
        !ticket ||
        queue.current ||
        queue.status !== QUEUE_STATUS.OPEN
      ) {
        return state;
      }

      if (
        !override &&
        queue.waiting[0]?.id !== ticketId
      ) {
        return state;
      }

      if (
        override &&
        validateOverride(
          state,
          ticketId,
          reason,
        ) !== OverrideResult.OK
      ) {
        return state;
      }

      const reasonData = override
        ? getReasonData(
            REASON_ACTION.FIFO_OVERRIDE,
            reason,
          )
        : null;

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
            reason: reasonData?.text ?? null,
            reasonDetails:
              reasonData?.details ?? null,
          }),
        ]),
      };
    }

    // ================================================
    // VERIFY BY ID
    // ================================================

    case QueueAction.VERIFY: {
      const ticket = queue.current;

      if (
        validateVerification(
          state,
          payload.idNumber,
          timestamp,
        ) !== VerifyResult.OK
      ) {
        return state;
      }

      return {
        ...state,

        queue: {
          ...queue,
          current: {
            ...ticket,
            status: TICKET_STATUS.IN_SERVICE,
            service_started_at: now,
          },
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

    // ================================================
    // INVALID VERIFICATION LOG
    // ================================================

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

    // ================================================
    // MANUAL NO-SHOW
    // ================================================

    case QueueAction.NO_SHOW: {
      const ticket = queue.current;
      const reason = payload.reason ?? '';

      if (
        validateNoShow(
          state,
          reason,
          timestamp,
        ) !== NoShowResult.OK
      ) {
        return state;
      }

      const verified =
        ticket.status === TICKET_STATUS.IN_SERVICE;

      const reasonData = verified
        ? getReasonData(
            REASON_ACTION.VERIFIED_NO_SHOW,
            reason,
          )
        : null;

      const penaltyBefore = getPenaltyState(
        offenses,
        ticket.holder.user_id,
        timestamp,
      );

      const triggersBan =
        penaltyBefore.strikeCount + 1 >=
        RULES.OFFENSES_PER_BAN;

      const offense = {
        id: `${id}_offense`,
        holder: ticket.holder,
        ticket_number: ticket.ticket_number,
        type: OFFENSE_TYPE.NO_SHOW,
        resulted_in_ban: triggersBan,
        revoked_at: null,
        created_at: now,
      };

      return {
        ...state,

        // No automatic queue advancement.
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
              ? reasonData.text
              : 'grace period lapsed',
            reasonDetails: verified
              ? reasonData.details
              : null,
          }),

          entry({
            action: ACTIVITY_ACTION.OFFENSE_RECORDED,
            ticket,
            actor: 'System',
          }),
        ]),
      };
    }

    // ================================================
    // COMPLETE SERVICE
    // ================================================

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

    // ================================================
    // OPEN QUEUE
    // ================================================

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

    // ================================================
    // CLOSE QUEUE
    // ================================================

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

    // ================================================
    // CANCEL ENTIRE QUEUE
    // ================================================

    case QueueAction.CANCEL_QUEUE: {
      const reason = payload.reason;

      if (
        validateCancellation(
          state,
          reason,
        ) !== CancelResult.OK
      ) {
        return state;
      }

      const reasonData = getReasonData(
        REASON_ACTION.QUEUE_CANCELLATION,
        reason,
      );

      const tickets = [
        queue.current,
        ...queue.waiting,
      ].filter(Boolean);

      const cancellationLogs = tickets.map(
        (ticket) =>
          entry({
            action: ACTIVITY_ACTION.CANCELLED,
            ticket,
            from: ticket.status,
            to: TICKET_STATUS.CANCELLED,
            reason: reasonData.text,
            reasonDetails: reasonData.details,
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

        // Queue cancellation creates no offenses.
        activity: prependActivity(activity, [
          ...cancellationLogs,

          entry({
            action: ACTIVITY_ACTION.QUEUE_CANCELLED,
            reason: reasonData.text,
            reasonDetails: reasonData.details,
          }),
        ]),
      };
    }

    // ================================================
    // OVERRIDE CUTOFF
    // ================================================

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

    // ================================================
    // REVOKE OFFENSE
    // ================================================

    case QueueAction.REVOKE_OFFENSE: {
      const {
        offenseId,
        reason,
      } = payload;

      if (
        validateRevocation(
          state,
          offenseId,
          reason,
        ) !== RevokeResult.OK
      ) {
        return state;
      }

      const offense = offenses.find(
        (item) => item.id === offenseId,
      );

      const reasonData = getReasonData(
        REASON_ACTION.OFFENSE_REVOCATION,
        reason,
      );

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
            reason: reasonData.text,
            reasonDetails: reasonData.details,
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
// =====================================================

export function QueueProvider({ children }) {
  const { user } = useSession();

  const [state, dispatch] = useReducer(
    queueReducer,
    undefined,
    createInitialState,
  );

  const actor = user?.name ?? 'System';

  const send = (type, payload = {}) => {
    dispatch({
      type,
      payload,
      actor,
      now: new Date().toISOString(),
      id: newId('action'),
    });
  };

  const {
    queue,
    offenses,
    activity,
  } = state;

  // ================================================
  // CALL NEXT
  // ================================================

  const call = (
    ticketId,
    { override = false, reason } = {},
  ) => {
    send(QueueAction.CALL, {
      ticketId,
      override,
      reason,
    });
  };

  const callNext = () => {
    if (queue.status !== QUEUE_STATUS.OPEN) {
      return QueueActionResult.QUEUE_CLOSED;
    }

    if (queue.current) {
      return QueueActionResult.ACTIVE_TICKET;
    }

    const first = queue.waiting[0];

    if (!first) {
      return QueueActionResult.NO_WAITING_TICKETS;
    }

    call(first.id);
    return QueueActionResult.OK;
  };

  // ================================================
  // FIFO OVERRIDE
  // ================================================

  const overrideCall = (
    ticketId,
    reasonSelection,
  ) => {
    const result = validateOverride(
      state,
      ticketId,
      reasonSelection,
    );

    if (result !== OverrideResult.OK) {
      return result;
    }

    call(ticketId, {
      override: true,
      reason: reasonSelection,
    });

    return OverrideResult.OK;
  };

  // ================================================
  // VERIFY BY ID
  // ================================================

  const verifyById = (idNumber) => {
    const result = validateVerification(
      state,
      idNumber,
      Date.now(),
    );

    if (result === VerifyResult.OK) {
      send(QueueAction.VERIFY, {
        idNumber,
      });
    } else if (
      queue.current?.status === TICKET_STATUS.CALLED
    ) {
      send(QueueAction.INVALID_VERIFY, {
        idNumber,
      });
    }

    return result;
  };

  // ================================================
  // MANUAL NO-SHOW
  // ================================================

  const markNoShow = (reason = '') => {
    const result = validateNoShow(
      state,
      reason,
      Date.now(),
    );

    if (result === NoShowResult.OK) {
      send(QueueAction.NO_SHOW, {
        reason,
      });
    }

    return result;
  };

  // ================================================
  // COMPLETE SERVICE
  // ================================================

  const completeService = () => {
    if (
      queue.current?.status !==
      TICKET_STATUS.IN_SERVICE
    ) {
      return QueueActionResult.INVALID_STATE;
    }

    send(QueueAction.COMPLETE);
    return QueueActionResult.OK;
  };

  // ================================================
  // OPEN / CLOSE QUEUE
  // ================================================

  const openQueue = () => {
    if (queue.status === QUEUE_STATUS.OPEN) {
      return QueueActionResult.ALREADY_OPEN;
    }

    send(QueueAction.OPEN_QUEUE);
    return QueueActionResult.OK;
  };

  const closeQueue = () => {
    if (queue.status === QUEUE_STATUS.CLOSED) {
      return QueueActionResult.ALREADY_CLOSED;
    }

    send(QueueAction.CLOSE_QUEUE);
    return QueueActionResult.OK;
  };

  // ================================================
  // CANCEL QUEUE
  // ================================================

  const cancelQueue = (reasonSelection) => {
    const result = validateCancellation(
      state,
      reasonSelection,
    );

    if (result !== CancelResult.OK) {
      return result;
    }

    send(QueueAction.CANCEL_QUEUE, {
      reason: reasonSelection,
    });

    return CancelResult.OK;
  };

  // ================================================
  // OVERRIDE CUTOFF
  // ================================================

  const overrideCutoff = () => {
    if (queue.cutoff_overridden) {
      return QueueActionResult.ALREADY_OVERRIDDEN;
    }

    send(QueueAction.OVERRIDE_CUTOFF);
    return QueueActionResult.OK;
  };

  // ================================================
  // REVOKE OFFENSE
  // ================================================

  const revokeOffense = (
    offenseId,
    reasonSelection,
  ) => {
    const result = validateRevocation(
      state,
      offenseId,
      reasonSelection,
    );

    if (result !== RevokeResult.OK) {
      return result;
    }

    send(QueueAction.REVOKE_OFFENSE, {
      offenseId,
      reason: reasonSelection,
    });

    return RevokeResult.OK;
  };

  // ================================================
  // CONTEXT VALUE
  //
  // No demo scenario methods exposed.
  // ================================================

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
