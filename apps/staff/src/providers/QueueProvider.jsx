
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
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useSession } from './SessionProvider';

// Staff queue is currently stored in memory.
// Future backend integration will replace mock actions
// with authorized server requests.
const QueueContext = createContext(null);

// Verification results.
export const VerifyResult = Object.freeze({
  OK: 'ok',
  NO_MATCH: 'noMatch',
  EXPIRED: 'expired',
});

// Fix #1: No-show operation results.
export const NoShowResult = Object.freeze({
  OK: 'ok',
  INVALID_STATE: 'invalidState',
  TOO_EARLY: 'tooEarly',
  REASON_REQUIRED: 'reasonRequired',
  ALREADY_RECORDED: 'alreadyRecorded',
});

let nextId = 0;

const newId = (prefix) => `${prefix}_local_${++nextId}`;

// Creates an activity log entry.
const logEntry = ({
  action,
  ticket = null,
  actor,
  from = null,
  to = null,
  reason = null,
  note = null,
}) => ({
  id: newId('log'),
  action,
  ticket_number: ticket?.ticket_number ?? null,
  actor,
  from,
  to,
  reason: reason || null,
  note,
  created_at: new Date().toISOString(),
});

export function QueueProvider({ children }) {
  const { user } = useSession();

  const [queue, setQueue] = useState(MOCK_STAFF_QUEUE);
  const [offenses, setOffenses] = useState(MOCK_STAFF_OFFENSES);
  const [activity, setActivity] = useState(MOCK_STAFF_ACTIVITY);

  const actor = user?.name ?? 'System';

  const value = useMemo(() => {
    // Newest activity entries appear first.
    const log = (...entries) => {
      setActivity((prev) => [
        ...entries.reverse(),
        ...prev,
      ]);
    };

    // =====================================================
    // WM01: CALL NEXT / OVERRIDE FIFO
    // =====================================================

    const call = (
      ticketId,
      { override = false, reason } = {},
    ) => {
      const ticket = queue.waiting.find(
        (t) => t.id === ticketId,
      );

      if (
        !ticket ||
        queue.current ||
        queue.status !== QUEUE_STATUS.OPEN
      ) {
        return;
      }

      const called = {
        ...ticket,
        status: TICKET_STATUS.CALLED,
        called_at: new Date().toISOString(),
      };

      setQueue((q) => ({
        ...q,
        current: called,
        waiting: q.waiting.filter(
          (t) => t.id !== ticketId,
        ),
      }));

      log(
        logEntry({
          action: override
            ? ACTIVITY_ACTION.OVERRIDE
            : ACTIVITY_ACTION.CALLED,
          ticket,
          actor,
          from: TICKET_STATUS.WAITING,
          to: TICKET_STATUS.CALLED,
          reason: override
            ? (reason ?? 'called ahead of FIFO')
            : null,
        }),
      );
    };

    return {
      queue,
      offenses,
      activity,
      notifications: MOCK_STAFF_NOTIFICATIONS,

      // Call the next person in FIFO order.
      callNext: () => {
        if (queue.waiting.length === 0) return;

        call(queue.waiting[0].id);
      },

      // Staff-controlled priority override.
      overrideCall: (ticketId) =>
        call(ticketId, { override: true }),

      // =====================================================
      // WM02: VERIFY BY ID
      // =====================================================

      verifyById: (idNumber) => {
        const ticket = queue.current;

        if (
          !ticket ||
          ticket.status !== TICKET_STATUS.CALLED
        ) {
          return VerifyResult.NO_MATCH;
        }

        const matches =
          ticket.holder.id_number.toUpperCase() ===
          idNumber.trim().toUpperCase();

        const expired =
          getRemainingSeconds(
            ticket.called_at,
            Date.now(),
          ) === 0;

        if (!matches || expired) {
          log(
            logEntry({
              action: ACTIVITY_ACTION.INVALID_SCAN,
              ticket,
              actor,
              note: expired
                ? 'Verify by ID rejected: ticket expired'
                : 'Verify by ID: no match',
            }),
          );

          return expired
            ? VerifyResult.EXPIRED
            : VerifyResult.NO_MATCH;
        }

        setQueue((q) => ({
          ...q,
          current: {
            ...q.current,
            status: TICKET_STATUS.IN_SERVICE,
            service_started_at:
              new Date().toISOString(),
          },
        }));

        log(
          logEntry({
            action: ACTIVITY_ACTION.SERVICE_STARTED,
            ticket,
            actor,
            from: TICKET_STATUS.CALLED,
            to: TICKET_STATUS.IN_SERVICE,
            note: 'Verified by ID',
          }),
        );

        return VerifyResult.OK;
      },

      // =====================================================
      // WM03: MARK NO-SHOW
      // FIX #1 + FIX #2
      // =====================================================
      //
      // CALLED -> NO_SHOW:
      // Allowed only after the grace period.
      //
      // IN_SERVICE -> NO_SHOW:
      // Allowed with a required explanation.
      //
      // Fix #2:
      // Ban eligibility is determined from the user's
      // remaining strikes, not lifetime offense totals.
      // =====================================================

      markNoShow: (reason = '') => {
        const ticket = queue.current;

        // Only CALLED and IN_SERVICE tickets qualify.
        if (
          !ticket ||
          ![
            TICKET_STATUS.CALLED,
            TICKET_STATUS.IN_SERVICE,
          ].includes(ticket.status)
        ) {
          return NoShowResult.INVALID_STATE;
        }

        const verifiedButAbsent =
          ticket.status === TICKET_STATUS.IN_SERVICE;

        const trimmedReason = reason.trim();

        // Reversing a verified arrival requires a reason.
        if (verifiedButAbsent && !trimmedReason) {
          return NoShowResult.REASON_REQUIRED;
        }

        // CALLED tickets must exhaust the grace period.
        if (
          !verifiedButAbsent &&
          getRemainingSeconds(
            ticket.called_at,
            Date.now(),
          ) > 0
        ) {
          return NoShowResult.TOO_EARLY;
        }

        // Prevent duplicate active no-show offenses.
        if (
          hasActiveNoShowOffense(
            offenses,
            ticket.ticket_number,
          )
        ) {
          return NoShowResult.ALREADY_RECORDED;
        }

        // =================================================
        // FIX #2: ACCURATE PENALTY CALCULATION
        // =================================================

        const penaltyBefore = getPenaltyState(
          offenses,
          ticket.holder.user_id,
        );

        // A ban occurs when this offense completes
        // the next two-offense penalty cycle.
        const triggersBan =
          penaltyBefore.strikeCount + 1 >=
          RULES.OFFENSES_PER_BAN;

        const offense = {
          id: newId('offense'),
          holder: ticket.holder,
          ticket_number: ticket.ticket_number,
          type: OFFENSE_TYPE.NO_SHOW,
          resulted_in_ban: triggersBan,
          revoked_at: null,
          created_at: new Date().toISOString(),
        };

        // Clear current ticket.
        // Never automatically call the next ticket.
        setQueue((q) => ({
          ...q,
          current: null,
        }));

        // Save the new mock offense.
        setOffenses((prev) => [
          offense,
          ...prev,
        ]);

        // Record both the status transition and offense.
        log(
          logEntry({
            action: ACTIVITY_ACTION.NO_SHOW,
            ticket,
            actor,
            from: ticket.status,
            to: TICKET_STATUS.NO_SHOW,
            reason: verifiedButAbsent
              ? trimmedReason
              : 'grace period lapsed',
          }),
          logEntry({
            action: ACTIVITY_ACTION.OFFENSE_RECORDED,
            ticket,
            actor: 'System',
          }),
        );

        return NoShowResult.OK;
      },

      // =====================================================
      // WM04: COMPLETE SERVICE
      // =====================================================

      completeService: () => {
        const ticket = queue.current;

        if (
          !ticket ||
          ticket.status !== TICKET_STATUS.IN_SERVICE
        ) {
          return;
        }

        setQueue((q) => ({
          ...q,
          current: null,
        }));

        log(
          logEntry({
            action: ACTIVITY_ACTION.COMPLETED,
            ticket,
            actor,
            from: TICKET_STATUS.IN_SERVICE,
            to: TICKET_STATUS.COMPLETED,
          }),
        );
      },

      // =====================================================
      // OPEN QUEUE
      // =====================================================

      openQueue: () => {
        setQueue((q) => ({
          ...q,
          status: QUEUE_STATUS.OPEN,
        }));

        log(
          logEntry({
            action: ACTIVITY_ACTION.QUEUE_OPENED,
            actor,
          }),
        );
      },

      // =====================================================
      // WM05: CLOSE QUEUE
      // =====================================================
      // Existing tickets remain valid.
      // Only new joining is blocked.

      closeQueue: () => {
        setQueue((q) => ({
          ...q,
          status: QUEUE_STATUS.CLOSED,
        }));

        log(
          logEntry({
            action: ACTIVITY_ACTION.QUEUE_CLOSED,
            actor,
          }),
        );
      },

      // =====================================================
      // WM06: CANCEL QUEUE
      // =====================================================
      // Office cancellations never create offenses.

      cancelQueue: (reason) => {
        const tickets = [
          queue.current,
          ...queue.waiting,
        ].filter(Boolean);

        setQueue((q) => ({
          ...q,
          status: QUEUE_STATUS.CLOSED,
          current: null,
          waiting: [],
        }));

        log(
          ...tickets.map((ticket) =>
            logEntry({
              action: ACTIVITY_ACTION.CANCELLED,
              ticket,
              actor,
              from: ticket.status,
              to: TICKET_STATUS.CANCELLED,
              reason,
            }),
          ),
          logEntry({
            action: ACTIVITY_ACTION.QUEUE_CANCELLED,
            actor,
            reason,
          }),
        );
      },

      // =====================================================
      // WM07: OVERRIDE CUTOFF
      // =====================================================

      overrideCutoff: () => {
        setQueue((q) => ({
          ...q,
          cutoff_overridden: true,
        }));

        log(
          logEntry({
            action: ACTIVITY_ACTION.CUTOFF_OVERRIDE,
            actor,
          }),
        );
      },

      // =====================================================
      // WM08: REVOKE OFFENSE
      // FIX #2
      // =====================================================
      //
      // Revoked offenses remain in history.
      // getPenaltyState() ignores revoked records.
      //
      // The penalty state is recalculated whenever
      // the offenses array changes.
      // =====================================================

      revokeOffense: (offenseId, reason) => {
        const offense = offenses.find(
          (o) => o.id === offenseId,
        );

        if (!offense || offense.revoked_at) {
          return;
        }

        const revokedAt = new Date().toISOString();

        setOffenses((prev) =>
          prev.map((o) =>
            o.id === offenseId
              ? {
                  ...o,
                  revoked_at: revokedAt,
                }
              : o,
          ),
        );

        log(
          logEntry({
            action: ACTIVITY_ACTION.OFFENSE_REVOKED,
            ticket: offense,
            actor,
            reason,
            note: offense.holder.name,
          }),
        );
      },
    };
  }, [queue, offenses, activity, actor]);

  return (
    <QueueContext.Provider value={value}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueueStore() {
  const context = useContext(QueueContext);

  if (!context) {
    throw new Error(
      'useQueueStore must be used within a QueueProvider',
    );
  }

  return context;
}
