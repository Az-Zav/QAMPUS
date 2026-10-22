// Staff queue: the office's live queue, its offenses and its activity log, plus every staff action.
// In-memory for now. Backend swap: each action becomes a server call that re-checks office
// assignment (R-27, R-32) and the state comes from polling; screens keep the same value shape.

import {
  MOCK_STAFF_ACTIVITY,
  MOCK_STAFF_NOTIFICATIONS,
  MOCK_STAFF_OFFENSES,
  MOCK_STAFF_QUEUE,
} from '@qampus/core/mock';
import { ACTIVITY_ACTION, OFFENSE_TYPE, QUEUE_STATUS, TICKET_STATUS } from '@qampus/core/domain';
import { getRemainingSeconds } from '@qampus/core/ticket';
import { createContext, useContext, useMemo, useState } from 'react';
import { useSession } from './SessionProvider';

const QueueContext = createContext(null);

export const VerifyResult = Object.freeze({
  OK: 'ok',
  NO_MATCH: 'noMatch',
  EXPIRED: 'expired',
});

let nextId = 0;
const newId = (prefix) => `${prefix}_local_${++nextId}`;

const logEntry = ({ action, ticket = null, actor, from = null, to = null, reason = null, note = null }) => ({
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
    // Entries in the order they happened; the log is newest first
    const log = (...entries) => setActivity((prev) => [...entries.reverse(), ...prev]);

    // Head-of-line or override call: the ticket becomes CALLED; the waiting list is not reordered (R-06)
    const call = (ticketId, { override = false, reason } = {}) => {
      const ticket = queue.waiting.find((t) => t.id === ticketId);
      if (!ticket || queue.current || queue.status !== QUEUE_STATUS.OPEN) return;
      const called = { ...ticket, status: TICKET_STATUS.CALLED, called_at: new Date().toISOString() };
      setQueue((q) => ({ ...q, current: called, waiting: q.waiting.filter((t) => t.id !== ticketId) }));
      log(
        logEntry({
          action: override ? ACTIVITY_ACTION.OVERRIDE : ACTIVITY_ACTION.CALLED,
          ticket,
          actor,
          from: TICKET_STATUS.WAITING,
          to: TICKET_STATUS.CALLED,
          reason: override ? (reason ?? 'called ahead of FIFO') : null,
        }),
      );
    };

    return {
      queue,
      offenses,
      activity,
      notifications: MOCK_STAFF_NOTIFICATIONS,

      callNext: () => queue.waiting[0] && call(queue.waiting[0].id),
      overrideCall: (ticketId) => call(ticketId, { override: true }),

      // WM02 — same transition as a QR scan (R-22). Failures change nothing and are logged only.
      verifyById: (idNumber) => {
        const ticket = queue.current;
        if (!ticket || ticket.status !== TICKET_STATUS.CALLED) return VerifyResult.NO_MATCH;
        const matches = ticket.holder.id_number.toUpperCase() === idNumber.trim().toUpperCase();
        const expired = getRemainingSeconds(ticket.called_at, Date.now()) === 0;
        if (!matches || expired) {
          log(
            logEntry({
              action: ACTIVITY_ACTION.INVALID_SCAN,
              ticket,
              actor,
              note: expired ? 'Verify by ID rejected: ticket expired' : 'Verify by ID: no match',
            }),
          );
          return expired ? VerifyResult.EXPIRED : VerifyResult.NO_MATCH;
        }
        setQueue((q) => ({
          ...q,
          current: { ...q.current, status: TICKET_STATUS.IN_SERVICE, service_started_at: new Date().toISOString() },
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

      // WM03 — only after the grace period; records an offense. Call Next stays a separate action (R-05).
      markNoShow: () => {
        const ticket = queue.current;
        if (!ticket || getRemainingSeconds(ticket.called_at, Date.now()) > 0) return;
        const priorActive = offenses.filter((o) => o.holder.user_id === ticket.holder.user_id && !o.revoked_at).length;
        setQueue((q) => ({ ...q, current: null }));
        setOffenses((prev) => [
          {
            id: newId('offense'),
            holder: ticket.holder,
            ticket_number: ticket.ticket_number,
            type: OFFENSE_TYPE.NO_SHOW,
            resulted_in_ban: priorActive + 1 >= 2, // R-13: the second strike bans
            revoked_at: null,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
        log(
          logEntry({
            action: ACTIVITY_ACTION.NO_SHOW,
            ticket,
            actor,
            from: TICKET_STATUS.CALLED,
            to: TICKET_STATUS.NO_SHOW,
            reason: 'grace period lapsed',
          }),
          logEntry({ action: ACTIVITY_ACTION.OFFENSE_RECORDED, ticket, actor: 'System' }),
        );
      },

      // WM04
      completeService: () => {
        const ticket = queue.current;
        if (!ticket || ticket.status !== TICKET_STATUS.IN_SERVICE) return;
        setQueue((q) => ({ ...q, current: null }));
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

      openQueue: () => {
        setQueue((q) => ({ ...q, status: QUEUE_STATUS.OPEN }));
        log(logEntry({ action: ACTIVITY_ACTION.QUEUE_OPENED, actor }));
      },

      // WM05 — existing tickets stay valid
      closeQueue: () => {
        setQueue((q) => ({ ...q, status: QUEUE_STATUS.CLOSED }));
        log(logEntry({ action: ACTIVITY_ACTION.QUEUE_CLOSED, actor }));
      },

      // WM06 — every ticket cancelled by the office; no one is penalized (R-16)
      cancelQueue: (reason) => {
        const tickets = [queue.current, ...queue.waiting].filter(Boolean);
        setQueue((q) => ({ ...q, status: QUEUE_STATUS.CLOSED, current: null, waiting: [] }));
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
          logEntry({ action: ACTIVITY_ACTION.QUEUE_CANCELLED, actor, reason }),
        );
      },

      // WM07 (R-19)
      overrideCutoff: () => {
        setQueue((q) => ({ ...q, cutoff_overridden: true }));
        log(logEntry({ action: ACTIVITY_ACTION.CUTOFF_OVERRIDE, actor }));
      },

      // WM08 — reverses the strike and lifts any ban it caused (R-15)
      revokeOffense: (offenseId, reason) => {
        const offense = offenses.find((o) => o.id === offenseId);
        if (!offense || offense.revoked_at) return;
        setOffenses((prev) =>
          prev.map((o) => (o.id === offenseId ? { ...o, revoked_at: new Date().toISOString() } : o)),
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

  return <QueueContext.Provider value={value}>{children}</QueueContext.Provider>;
}

export function useQueueStore() {
  const context = useContext(QueueContext);
  if (!context) throw new Error('useQueueStore must be used within a QueueProvider');
  return context;
}
