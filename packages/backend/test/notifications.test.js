import assert from 'node:assert/strict';
import { test } from 'node:test';
import { approachingTicket, buildNotification } from '../src/notifications/build.js';

const ticket = { id: 'q_4', office_id: 'off_reg_001', office_name: 'Registrar', ticket_number: 'R-10-25-004' };

test('every notification starts unread and points at the ticket and office', () => {
  const n = buildNotification('YOUR_TURN', { ticket });
  assert.equal(n.type, 'YOUR_TURN');
  assert.equal(n.is_read, false);
  assert.equal(n.read_at, null);
  assert.equal(n.ticket_id, 'q_4');
  assert.equal(n.office_id, 'off_reg_001');
  assert.match(n.title, /Registrar/);
  assert.match(n.message, /R-004/);
});

test('approaching turn names the place in line', () => {
  assert.match(buildNotification('APPROACHING_TURN', { ticket, position: 3 }).message, /3rd in line/);
});

test('a no-show says whether it is a strike or a ban', () => {
  assert.match(buildNotification('NO_SHOW', { ticket, resultedInBan: false }).message, /strike/);
  assert.match(buildNotification('NO_SHOW', { ticket, resultedInBan: true }).message, /24 hours/);
});

test('cancelling after a call is a warning with the same consequence text', () => {
  assert.match(buildNotification('WARNING', { ticket, resultedInBan: false }).message, /after it was called/);
  assert.match(buildNotification('WARNING', { ticket, resultedInBan: true }).message, /24 hours/);
});

test('the reason is appended to a cancelled queue and a revoked offense only when given', () => {
  assert.match(buildNotification('QUEUE_CANCELLED', { ticket, reason: 'Power outage' }).message, /Reason: Power outage/);
  assert.doesNotMatch(buildNotification('QUEUE_CANCELLED', { ticket, reason: '  ' }).message, /Reason/);
  assert.match(buildNotification('OFFENSE_REVOKED', { ticket, reason: 'Mistake' }).message, /Reason: Mistake/);
});

test('an unknown type or a missing ticket is refused', () => {
  assert.throws(() => buildNotification('MADE_UP', { ticket }));
  assert.throws(() => buildNotification('YOUR_TURN', { ticket: null }));
});

test('the student three places back, not counting the called ticket, is told theirs is near', () => {
  const waiting = [1, 2, 3, 4, 5].map((n) => ({ id: `t${n}` }));
  assert.equal(approachingTicket(waiting, 't1').id, 't4');
  assert.equal(approachingTicket(waiting, 't5').id, 't3');
  assert.equal(approachingTicket(waiting.slice(0, 3), 't1'), null);
});
