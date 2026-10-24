import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildOffense } from '../src/penalties/offense.js';
import { activeBanEnd, nextPenalty, revokeEffect } from '../src/penalties/progress.js';
import { checkJoin, TicketingError } from '../src/ticketing/preflight.js';

const now = new Date('2026-10-24T04:00:00Z');

test('the first offense is a strike and sets no ban', () => {
  assert.deepEqual(nextPenalty({ strike_count: 0 }, now), { strike_count: 1, resulted_in_ban: false });
  assert.deepEqual(nextPenalty(null, now), { strike_count: 1, resulted_in_ban: false });
});

test('the second offense resets the strikes and sets a flat 24-hour ban', () => {
  const penalty = nextPenalty({ strike_count: 1 }, now);
  assert.equal(penalty.strike_count, 0);
  assert.equal(penalty.resulted_in_ban, true);
  assert.equal(penalty.banned_until.getTime() - now.getTime(), 24 * 3600 * 1000);
});

test('a ban is active until its end, then not', () => {
  const profile = { banned_until: '2026-10-25T04:00:00Z' };
  assert.equal(activeBanEnd(profile, now).toISOString(), '2026-10-25T04:00:00.000Z');
  assert.equal(activeBanEnd(profile, new Date('2026-10-25T04:00:01Z')), null);
  assert.equal(activeBanEnd({ banned_until: null }, now), null);
  assert.equal(activeBanEnd(null, now), null);
});

test('revoking the offense that caused a ban lifts it and sets the strikes back to 1', () => {
  const profile = { strike_count: 0, banned_until: '2026-10-25T04:00:00Z' };
  assert.deepEqual(revokeEffect(profile, { resulted_in_ban: true }), { strike_count: 1, banned_until: null });
});

test('revoking another offense lowers the strikes by one, only if there is one', () => {
  assert.deepEqual(revokeEffect({ strike_count: 1 }, { resulted_in_ban: false }), { strike_count: 0 });
  assert.equal(revokeEffect({ strike_count: 0 }, { resulted_in_ban: false }), null);
});

test('revoking a ban offense changes nothing when there is no ban and one strike', () => {
  assert.equal(revokeEffect({ strike_count: 1, banned_until: null }, { resulted_in_ban: true }), null);
});

test('an offense copies its ticket and starts unrevoked', () => {
  const ticket = {
    id: 'off_reg_001_20261024_3',
    user_id: 'u1',
    office_id: 'off_reg_001',
    office_name: 'Office of the Registrar',
    ticket_number: 'R-10-24-003',
    holder_name: 'Jazz Binalla',
    holder_institutional_id: '2410001',
    status: 'CALLED',
  };
  const offense = buildOffense({ ticket, type: 'NO_SHOW', resultedInBan: false });
  assert.equal(offense.ticket_id, ticket.id);
  assert.equal(offense.user_id, 'u1');
  assert.equal(offense.holder_name, 'Jazz Binalla');
  assert.equal(offense.type, 'NO_SHOW');
  assert.equal(offense.revoked_at, null);
  assert.equal(offense.revoked_by, null);
  assert.equal('status' in offense, false);
});

test('a banned student cannot join, and the ban is reported before anything else about the queue', () => {
  const user = { id: 'u1', name: 'Jazz Binalla', institutional_id: '2410001' };
  const office = { id: 'off_reg_001', status: 'ACTIVE' };
  const bannedUntil = new Date('2026-10-25T04:00:00Z');
  assert.equal(checkJoin({ user, office, queue: null, bannedUntil, now }), TicketingError.BANNED);
  assert.equal(
    checkJoin({ user, office, queue: { status: 'OPEN' }, bannedUntil, now: new Date('2026-10-25T05:00:00Z') }),
    null,
  );
});
