// The offense document (offenses/{ticketId}). Pure: no Firebase. `created_at` is added by the writer with a
// server timestamp, so rules can require it to equal the request time.

import { OFFENSE_TYPE } from '@qampus/core/domain';

export { OFFENSE_TYPE };

// `ticket` is the stored ticket (needs id, user_id, office_id, office_name, ticket_number, holder_name,
// holder_institutional_id); `type` is an OFFENSE_TYPE; `resultedInBan` comes from nextPenalty.
export function buildOffense({ ticket, type, resultedInBan }) {
  return {
    user_id: ticket.user_id,
    ticket_id: ticket.id,
    office_id: ticket.office_id,
    office_name: ticket.office_name,
    ticket_number: ticket.ticket_number,
    holder_name: ticket.holder_name,
    holder_institutional_id: ticket.holder_institutional_id,
    type,
    resulted_in_ban: resultedInBan,
    revoked_by: null,
    revoked_at: null,
  };
}
