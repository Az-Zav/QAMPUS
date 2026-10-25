
import { QUEUE_STATUS, TICKET_STATUS } from '@qampus/core/domain';

import { toShortTicketNumber } from '@qampus/core/ticket';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ACTION_ERROR_COPY } from '@/constants';
import { useOfficeOffenses } from '@/hooks/useOfficeOffenses';
import { useOfficeTickets } from '@/hooks/useOfficeTickets';
import { useTodayQueue } from '@/hooks/useTodayQueue';
import { db } from '@/lib/firebase';
import { pushYourTurn } from '@/lib/push';
import {
  callNext as callNextTicket,
  callTicket,
  cancelOfficeQueue,
  closeQueue as closeQueueDoc,
  completeTicket,
  markTicketNoShow,
  cutoffState,
  openQueue as openQueueDoc,
  overrideCutoff as overrideCutoffDoc,
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
// Staff announcements are not built yet (they need an `announcements` collection): the bell shows only the cutoff warning.
// =====================================================

const QueueContext = createContext(null);

const NO_ANNOUNCEMENTS = Object.freeze([]);

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

  // The last refused action, shown as a banner on every console screen until dismissed or 8 seconds pass
  const [notice, setNotice] = useState(null);
  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(id);
  }, [notice]);
  // The catch handler of an action: log it and tell the staff member why it did not go through
  const refused = (what) => (error) => {
    console.warn(`Couldn't ${what}`, error);
    const reason = ACTION_ERROR_COPY.reasons[error?.code] ?? ACTION_ERROR_COPY.reasons.UNKNOWN;
    setNotice({ message: `${ACTION_ERROR_COPY.prefix(what)} ${reason}` });
  };

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
  // Capacity cutoff (R-17..R-19): the latest instant a join is still accepted; null when the office has no hours today
  // (`office` is the display view: its `hours` is text, so the stored per-day map is passed instead)
  const cutoff = cutoffState({ office: office && { ...office, hours: office.hoursByDay }, queue: todayQueue });
  const queue = {
    status: todayQueue?.status === QUEUE_STATUS.OPEN ? QUEUE_STATUS.OPEN : QUEUE_STATUS.CLOSED,
    current: currentTicket ? toStaffTicket(currentTicket) : null,
    waiting: waitingTickets(officeTickets).map(toStaffTicket),
    average_service_minutes: Math.round(cutoff.avgMinutes),
    cutoff_at: cutoff.cutoffAt,
    cutoff_overridden: todayQueue?.cutoff_overridden === true,
  };

  // =================================================
  // WM01: CALL NEXT / OVERRIDE FIFO
  // =================================================

  // The listeners on the queue and ticket docs update the console; a refused write shows a banner (`notice`)
  const callNext = () => {
    if (office) {
      callNextTicket(db, { office, tickets: officeTickets, actor })
        .then((called) => pushYourTurn(called, office))
        .catch(refused('call the next ticket'));
    }
  };

  const overrideCall = (ticketId, reason = null) => {
    if (office) {
      callTicket(db, { office, ticketId, actor, tickets: officeTickets, override: true, reason })
        .then((called) => pushYourTurn(called, office))
        .catch(refused('call that ticket'));
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
      completeTicket(db, { office, ticket: currentTicket, actor }).catch(refused('complete the service'));
    }
  };

  // =================================================
  // QUEUE CONTROLS
  // =================================================

  // The listener on today's queue doc flips the console state; a refused write shows a banner (`notice`)
  const openQueue = () => {
    if (office) openQueueDoc(db, office, actor).catch(refused('open the queue'));
  };

  const closeQueue = () => {
    if (office) closeQueueDoc(db, office, actor).catch(refused('close the queue'));
  };

  // Office cancels the whole queue (R-16): every unfinished ticket is cancelled by the office, nobody is penalized
  const cancelQueue = (reason) => {
    if (office) {
      cancelOfficeQueue(db, { office, reason, actor }).catch(refused('cancel the queue'));
    }
  };

  // WM07: let students join past the cutoff for the rest of the day (logged)
  const overrideCutoff = () => {
    if (office) {
      overrideCutoffDoc(db, office, actor).catch(refused('override the cutoff'));
    }
  };

  // =================================================
  // WM08: REVOKE OFFENSE
  // =================================================

  // Revoke an offense of this office (R-15): it stays on record, marked revoked, and the student's strikes
  // and ban are corrected. A refused write shows a banner (`notice`).
  const revokeOffense = (offenseId, reason) => {
    const offense = officeOffenses.find((item) => item.id === offenseId);
    if (!offense) return;
    revokeOffenseDoc(db, { offense, reason, staffEmail: user.email }).catch(refused('revoke the offense'));
  };

  // Keep existing hook and screen interfaces.
  const value = {
    queue,
    offenses,
    notifications: NO_ANNOUNCEMENTS,
    notice,
    dismissNotice: () => setNotice(null),

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
