
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
// Fix #1: No-show handling
// Fix #2: Offense and ban calculations
// Fix #3: Unified state using useReducer
// Fix #4: Required FIFO override reasons
//
// New: Structured multi-select reason system
//
// Frontend-only mock implementation.
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
// INITIAL STATE
// =====================================================

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
// EVENT AND ACTIVITY HELPERS
// =====================================================

// IDs are generated before dispatch.
// No counters or timestamps are generated in the reducer.
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

    // Human-readable reason, compatible with
    // existing Activity Log records.
    reason: reason || null,

    // Structured reason data for future Firebase
    // integration and richer activity displays.
    reason_details: reasonDetails,

    note,
    created_at: now,
  };
}

// Input entries are in chronological order.
// Activity Log displays the newest entry first.
function prependActivity(activity, entries) {
  return [
    ...[...entries].reverse(),
    ...activity,
  ];
}

// =====================================================
// STRUCTURED REASON VALIDATION
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
// VALIDATION: NO-SHOW
//
// CALLED:
// Grace period must have expired.
//
// IN_SERVICE:
// Requires a valid verified-no-show reason selection.
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
// VALIDATION: FIFO OVERRIDE
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
// VALIDATION: QUEUE CANCELLATION
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
// VALIDATION: OFFENSE REVOCATION
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
//
// Queue, offenses and activity are updated through
// one state transition for every successful action.
//
// This is local React state consistency, not a
// database transaction or server authorization.
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

  // Deterministic log IDs derived from the event ID.
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
    // WM01: CALL NEXT / FIFO OVERRIDE
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

      if (
        !ticket ||
        queue.current ||
        queue.status !== QUEUE_STATUS.OPEN
      ) {
        return state;
      }

      // Normal calls must follow FIFO order.
      if (
        !override &&
        queue.waiting[0]?.id !== ticketId
      ) {
        return state;
      }

      // Priority overrides require valid reasons.
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
            reasonDetails: reasonData?.details ?? null,
          }),
        ]),
      };
    }

    // =================================================
    // WM02: VERIFY BY ID
    // =================================================

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

    // =================================================
    // RECORD INVALID VERIFICATION
    // =================================================

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

    // =================================================
    // WM03: MARK NO-SHOW
    //
    // Preserves Fixes #1 and #2.
    // Adds structured reasons only when reversing
    // a previously verified IN_SERVICE ticket.
    // =================================================

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

      // Existing penalty calculation.
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

        // Staff must call the next ticket separately.
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
    //
    // Existing issued tickets stay valid.
    // No reason dropdown is required.
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
    // WM06: CANCEL ENTIRE QUEUE
    //
    // Requires structured reasons.
    // Creates no offenses.
    // =================================================

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

      // The selected reasons belong to the entire
      // queue cancellation action.
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

        // Office cancellations never add penalties.
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
    // Requires structured reasons.
    // Revoked offenses remain in history.
    // =================================================

    case QueueAction.REVOKE_OFFENSE: {
      const { offenseId, reason } = payload;

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
//
// Public API remains compatible with:
// - useStaffQueue.js
// - useOffenses.js
// - useActivityLog.js
// - queue.jsx
// - offenses.jsx
// =====================================================

export function QueueProvider({ children }) {
  const { user } = useSession();

  const [state, dispatch] = useReducer(
    queueReducer,
    undefined,
    createInitialState,
  );

  const actor = user?.name ?? 'System';

  // IDs and timestamps are generated before dispatch.
  const send = (type, payload = {}) => {
    dispatch({
      type,
      payload,
      actor,
      now: new Date().toISOString(),
      id: newId('action'),
    });
  };

  const { queue, offenses, activity } = state;

  // =================================================
  // WM01: CALL NEXT / OVERRIDE
  // =================================================

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
    const first = queue.waiting[0];

    if (first) {
      call(first.id);
    }
  };

  const overrideCall = (ticketId, reasonSelection) => {
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

  // =================================================
  // WM02: VERIFY BY ID
  // =================================================

  const verifyById = (idNumber) => {
    const result = validateVerification(
      state,
      idNumber,
      Date.now(),
    );

    if (result === VerifyResult.OK) {
      send(QueueAction.VERIFY, { idNumber });
    } else if (
      queue.current?.status === TICKET_STATUS.CALLED
    ) {
      send(QueueAction.INVALID_VERIFY, { idNumber });
    }

    return result;
  };

  // =================================================
  // WM03: MARK NO-SHOW
  // =================================================

  const markNoShow = (reason = '') => {
    const result = validateNoShow(
      state,
      reason,
      Date.now(),
    );

    if (result === NoShowResult.OK) {
      send(QueueAction.NO_SHOW, { reason });
    }

    return result;
  };

  // =================================================
  // WM04: COMPLETE SERVICE
  // =================================================

  const completeService = () => {
    send(QueueAction.COMPLETE);
  };

  // =================================================
  // QUEUE CONTROLS
  // =================================================

  const openQueue = () => {
    send(QueueAction.OPEN_QUEUE);
  };

  const closeQueue = () => {
    send(QueueAction.CLOSE_QUEUE);
  };

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

  const overrideCutoff = () => {
    send(QueueAction.OVERRIDE_CUTOFF);
  };

  // =================================================
  // WM08: REVOKE OFFENSE
  // =================================================

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

  // =================================================
  // CONTEXT VALUE
  // =================================================

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
