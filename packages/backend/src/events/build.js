// The activity log line (no Firebase here, so it runs under plain Node and is unit tested). One line per
// action, written in the same transaction as the change it describes. See docs/ARCHITECTURE.md (`events`).

import { ACTIVITY_ACTION } from '@qampus/core/domain';

export const EVENT_ENTITY = Object.freeze({
  TICKET: 'TICKET',
  QUEUE: 'QUEUE',
});

export const EVENTS_PAGE_SIZE = 50;

// Fields of the stored document except `created_at` (the server time is added where it is written).
// `entityId` is the ticket id or the queue id; `actor` is { uid, name }; `ticketNumber` is the full number.
export function buildEvent({ entity, entityId, action, officeId, ticketNumber = null, from = null, to = null, actor, reason = null }) {
  if (!Object.values(EVENT_ENTITY).includes(entity)) throw new Error(`Unknown event entity: ${entity}`);
  if (!Object.values(ACTIVITY_ACTION).includes(action)) throw new Error(`Unknown event action: ${action}`);
  if (!actor?.uid) throw new Error('An event needs the signed-in actor');
  if (!entityId || !officeId) throw new Error('An event needs an entity id and an office');

  const trimmed = typeof reason === 'string' ? reason.trim() : '';
  return {
    entity_type: entity,
    entity_id: entityId,
    action,
    from_status: from,
    to_status: to,
    actor_uid: actor.uid,
    actor_name: actor.name || 'Staff',
    reason: trimmed || null,
    office_id: officeId,
    ticket_number: ticketNumber,
  };
}
