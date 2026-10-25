// In-app notification text (no Firebase here, so it runs under plain Node and is unit tested). A notification is
// one more write inside the transaction of the change that causes it; the stored doc is
// users/{uid}/notifications/{id}. See docs/SCHEMA.md.

import { NOTIFICATION_TYPE, RULES } from '@qampus/core/domain';
import { toShortTicketNumber } from '@qampus/core/ticket';

export const NOTIFICATIONS_LIMIT = 50;

const ORDINALS = { 1: '1st', 2: '2nd', 3: '3rd' };
const ordinal = (n) => ORDINALS[n] ?? `${n}th`;

// What an offense means for the student, in one sentence (R-13, R-26)
const consequence = (resultedInBan) =>
  resultedInBan
    ? `This was your second offense, so you cannot join queues for ${RULES.BAN_HOURS} hours.`
    : 'This is a strike: one more offense results in a ban.';

// The fields of the stored document except `created_at` (the server time is added where it is written).
// `ticket` needs { id, office_id, office_name, ticket_number }. Context by type:
//   APPROACHING_TURN: `position` (their place in line); NO_SHOW, WARNING: `resultedInBan`;
//   QUEUE_CANCELLED, OFFENSE_REVOKED: `reason` (optional).
export function buildNotification(type, { ticket, position = 0, resultedInBan = false, reason = '' }) {
  if (!ticket?.id || !ticket.office_id) throw new Error('A notification needs the ticket and its office');
  const short = toShortTicketNumber(ticket.ticket_number);
  const office = ticket.office_name;
  const why = String(reason ?? '').trim();

  const text = {
    [NOTIFICATION_TYPE.QUEUE_CONFIRMED]: {
      title: 'Queue joined',
      message: `You joined the queue for ${office} as ticket ${short}.`,
    },
    [NOTIFICATION_TYPE.YOUR_TURN]: {
      title: `Your turn at ${office}!`,
      message: `Ticket ${short} has been called. Please go to the counter and check in within ${RULES.GRACE_PERIOD_SECONDS / 60} minute.`,
    },
    [NOTIFICATION_TYPE.APPROACHING_TURN]: {
      title: `Almost your turn (${office})`,
      message: `You are now ${ordinal(position)} in line at ${office}. Please head to the office.`,
    },
    [NOTIFICATION_TYPE.NO_SHOW]: {
      title: `Marked as no-show (${office})`,
      message: `Ticket ${short} was marked as a no-show. ${consequence(resultedInBan)}`,
    },
    [NOTIFICATION_TYPE.WARNING]: {
      title: 'Offense recorded',
      message: `You cancelled ticket ${short} after it was called. ${consequence(resultedInBan)}`,
    },
    [NOTIFICATION_TYPE.QUEUE_CANCELLED]: {
      title: `Queue cancelled (${office})`,
      message: `${office} cancelled the queue, so ticket ${short} was cancelled.${why ? ` Reason: ${why}` : ''}`,
    },
    [NOTIFICATION_TYPE.OFFENSE_REVOKED]: {
      title: 'Offense revoked',
      message: `${office} revoked your offense for ticket ${short}.${why ? ` Reason: ${why}` : ''}`,
    },
  }[type];
  if (!text) throw new Error(`Unknown notification type: ${type}`);

  return { type, ...text, ticket_id: ticket.id, office_id: ticket.office_id, is_read: false, read_at: null };
}

// The waiting ticket whose place in line is `RULES.APPROACHING_PLACE` once `calledId` is called, or null.
// `waiting` is the office's WAITING tickets, first in line first.
export function approachingTicket(waiting, calledId, place = RULES.APPROACHING_PLACE) {
  return waiting.filter((ticket) => ticket.id !== calledId)[place - 1] ?? null;
}
