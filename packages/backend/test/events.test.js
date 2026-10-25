import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildEvent, EVENT_ENTITY } from '../src/events/build.js';

const actor = { uid: 'u1', name: 'N. Reyes' };
const base = { entity: EVENT_ENTITY.TICKET, entityId: 'q_1', action: 'CALLED', officeId: 'off_reg_001', actor };

test('an event carries the actor, the office and the transition', () => {
  const event = buildEvent({ ...base, ticketNumber: 'R-10-24-1', from: 'WAITING', to: 'CALLED' });
  assert.deepEqual(event, {
    entity_type: 'TICKET',
    entity_id: 'q_1',
    action: 'CALLED',
    from_status: 'WAITING',
    to_status: 'CALLED',
    actor_uid: 'u1',
    actor_name: 'N. Reyes',
    reason: null,
    office_id: 'off_reg_001',
    ticket_number: 'R-10-24-1',
  });
});

test('a queue event has no ticket number and no transition', () => {
  const event = buildEvent({ ...base, entity: EVENT_ENTITY.QUEUE, entityId: 'off_reg_001_20261025', action: 'QUEUE_OPENED' });
  assert.equal(event.ticket_number, null);
  assert.equal(event.from_status, null);
  assert.equal(event.to_status, null);
});

test('a blank reason is stored as null and a reason is trimmed', () => {
  assert.equal(buildEvent({ ...base, reason: '   ' }).reason, null);
  assert.equal(buildEvent({ ...base, reason: '  skipped the line ' }).reason, 'skipped the line');
});

test('a missing actor name falls back to Staff', () => {
  assert.equal(buildEvent({ ...base, actor: { uid: 'u1' } }).actor_name, 'Staff');
});

test('an event without an actor, an office or a known action is refused', () => {
  assert.throws(() => buildEvent({ ...base, actor: null }));
  assert.throws(() => buildEvent({ ...base, officeId: '' }));
  assert.throws(() => buildEvent({ ...base, action: 'MADE_UP' }));
  assert.throws(() => buildEvent({ ...base, entity: 'USER' }));
});
