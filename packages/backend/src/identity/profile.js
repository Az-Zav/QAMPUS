// The profile document of a guest (R-02) as it is first created (no Firebase here, so it runs under plain Node and is
// unit tested). The counters start at the values Security Rules require on create (strikes 0, no ban, no active tickets).

import { USER_ROLE } from '@qampus/core/domain';

export function buildGuestProfile({ name, email = null, guestType, id }) {
  return {
    role: USER_ROLE.GUEST,
    name: String(name).trim(),
    email: String(email ?? '').trim() || null,
    guest_type: guestType,
    institutional_id: id,
    program: null,
    push_enabled: true,
    strike_count: 0,
    banned_until: null,
    active_count: 0,
    active_offices: {},
  };
}
