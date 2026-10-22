
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
  TICKET_STATUS,
} from '@qampus/core/domain';

import { getRemainingSeconds } from '@qampus/core/ticket';
import { createContext, useContext, useMemo, useState } from 'react';
import { useSession } from './SessionProvider';

// Staff queue is currently stored in memory.
// Backend integration will replace mock actions with server requests.
const QueueContext = createContext(null);

export const VerifyResult = Object.freeze({
  OK: 'ok',
  NO_MATCH: 'noMatch',
  EXPIRED: 'expired',
});

// Fix #1: Explicit results for no-show operations.
export const NoShowResult = Object.freeze({
  OK: 'ok',
  INVALID_STATE: 'invalidState',
  TOO_EARLY: 'tooEarly',
  REASON_REQUIRED: 'reasonRequired',
  ALREADY_RECORDED: 'alreadyRecorded',
});

let nextId = 0;

const newId = (prefix) => `${prefix}_local_${++nextId}`;

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
    // New activity entries appear first.
    const log = (...entries) =>
      setActivity((prev) => [...entries.reverse(), ...prev]);

    // WM01: Call the next ticket or override FIFO.
    const call = (ticketId, { override = false, reason } = {}) => {
      const ticket = queue.waiting.find((t) => t.id === ticketId);

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
        waiting: q.waiting.filter((t) => t.id !== ticketId),
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

      // Call the first waiting ticket.
      callNext: () =>
        queue.waiting[0] && call(queue.waiting[0].id),

      // Override normal FIFO order.
      overrideCall: (ticketId) =>
        call(ticketId, { override: true }),

      // WM02: Verify the currently called ticket by ID.
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
          getRemainingSeconds(ticket.called_at, Date.now()) === 0;

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
            service_started_at: new Date().toISOString(),
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
      // FIX #1: NO-SHOW HANDLING
      // =====================================================
      //
      // CALLED -> NO_SHOW:
      // Only after the grace period expires.
      //
      // IN_SERVICE -> NO_SHOW:
      // Allowed when the verified person never arrived
      // at the service window. A reason is required.
      //
      // Prevent duplicate offenses and invalid transitions.
      // The next ticket is never called automatically.
      // =====================================================

      markNoShow: (reason = '') => {
        const ticket = queue.current;

        // Validate the current ticket state.
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

        // Reversing a verification requires an explanation.
        if (verifiedButAbsent && !trimmedReason) {
          return NoShowResult.REASON_REQUIRED;
        }

        // Called tickets must finish the grace period.
        if (
          !verifiedButAbsent &&
          getRemainingSeconds(
            ticket.called_at,
            Date.now(),
          ) > 0
        ) {
          return NoShowResult.TOO_EARLY;
        }

        // Never create a second no-show offense
        // for the same ticket.
        const alreadyRecorded = offenses.some(
          (offense) =>
            offense.ticket_number === ticket.ticket_number &&
            offense.type === OFFENSE_TYPE.NO_SHOW,
        );

        if (alreadyRecorded) {
          return NoShowResult.ALREADY_RECORDED;
        }

        // Existing mock strike-count calculation.
        // Full ban management will be addressed in Fix #2.
        const priorActive = offenses.filter(
          (offense) =>
            offense.holder.user_id === ticket.holder.user_id &&
            !offense.revoked_at,
        ).length;

        const offense = {
          id: newId('offense'),
          holder: ticket.holder,
          ticket_number: ticket.ticket_number,
          type: OFFENSE_TYPE.NO_SHOW,
          resulted_in_ban: priorActive + 1 >= 2,
          revoked_at: null,
          created_at: new Date().toISOString(),
        };

        // Remove the current ticket.
        // The next ticket must be called manually.
        setQueue((q) => ({
          ...q,
          current: null,
        }));

        // Record exactly one new offense.
        setOffenses((prev) => [offense, ...prev]);

        // Record the actual previous ticket status.
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

      // WM04: Complete a verified service.
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

      // Open the office queue.
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

      // WM05: Close the queue to new users.
      // Existing tickets remain valid.
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

      // WM06: Cancel all tickets without penalties.
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

      // WM07: Override the queue cutoff.
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

      // WM08: Revoke an existing offense.
      // Full ban recalculation belongs to Fix #2.
      revokeOffense: (offenseId, reason) => {
        const offense = offenses.find(
          (o) => o.id === offenseId,
        );

        if (!offense || offense.revoked_at) {
          return;
        }

        setOffenses((prev) =>
          prev.map((o) =>
            o.id === offenseId
              ? {
                  ...o,
                  revoked_at: new Date().toISOString(),
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
