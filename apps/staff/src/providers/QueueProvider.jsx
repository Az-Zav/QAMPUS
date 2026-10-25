
import { MOCK_STAFF_NOTIFICATIONS } from '@qampus/core/mock';

import { QUEUE_STATUS, TICKET_STATUS } from '@qampus/core/domain';

import { toShortTicketNumber } from '@qampus/core/ticket';

import { createContext, useContext, useMemo } from 'react';

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
// The ticket flow (queue, tickets), the offenses and the activity log read and write Firestore through
// @qampus/backend. Every staff action passes `actor` ({ uid, name }) so the activity log names who did it.
// Still mock: the cutoff override and the notifications.
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
// PROVIDER
//
// Preserves the existing public API used by:
//
// useStaffQueue.js
// useOffenses.js
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

  // The signed-in staff member, as the activity log names them
  const actor = useMemo(() => ({ uid: user?.id, name: user?.name }), [user?.id, user?.name]);

  // The whole ticket flow, the offenses and the activity log are real (Firestore). Notifications are still
  // mock until their slice.
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
    if (office) {
      callNextTicket(db, { office, tickets: officeTickets, actor }).catch((error) =>
        console.warn('Could not call next', error),
      );
    }
  };

  const overrideCall = (ticketId, reason = null) => {
    if (office) {
      callTicket(db, { office, ticketId, actor, override: true, reason }).catch((error) =>
        console.warn('Could not call the ticket', error),
      );
    }
  };

  // =================================================
  // WM02: VERIFY BY ID
  // =================================================

  // Staff verify the called ticket by the holder's ID: CALLED -> IN_SERVICE inside the grace period.
  // Resolves to a VerifyResult for the modal (a refused write also reads as no match).
  const verifyById = async (idNumber) => {
    if (!currentTicket) return VerifyResult.NO_MATCH;
    try {
      await verifyByHolderId(db, { ticket: currentTicket, idNumber, actor });
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
      await markTicketNoShow(db, { office, ticket: currentTicket, actor, reason });
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
      completeTicket(db, { office, ticket: currentTicket, actor }).catch((error) =>
        console.warn('Could not complete the ticket', error),
      );
    }
  };

  // =================================================
  // QUEUE CONTROLS
  // =================================================

  // The listener on today's queue doc flips the console state; a refused write only logs for now
  const openQueue = () => {
    if (office) openQueueDoc(db, office, actor).catch((error) => console.warn('Could not open the queue', error));
  };

  const closeQueue = () => {
    if (office) closeQueueDoc(db, office, actor).catch((error) => console.warn('Could not close the queue', error));
  };

  // Office cancels the whole queue (R-16): every unfinished ticket is cancelled by the office, nobody is penalized
  const cancelQueue = (reason) => {
    if (office) {
      cancelOfficeQueue(db, { office, reason, actor }).catch((error) => console.warn('Could not cancel the queue', error));
    }
  };

  // The cutoff is not real yet (capacity slice); nothing to change until then
  const overrideCutoff = () => {};

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
