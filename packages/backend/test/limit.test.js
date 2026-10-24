import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chunkByHolder, isActiveTicket, remainingSlots } from '../src/ticketing/derive.js';
import { checkJoin, TicketingError } from '../src/ticketing/preflight.js';

const user = { id: 'u1', name: 'Jazz Binalla', institutional_id: '2410001' };
const office = { id: 'off_reg_001', status: 'ACTIVE' };
const open = { status: 'OPEN', last_seq: 0, last_called_seq: 0 };

test('a student with fewer than three active tickets can join', () => {
  assert.equal(checkJoin({ user, office, queue: open, activeCount: 0 }), null);
  assert.equal(checkJoin({ user, office, queue: open, activeCount: 2 }), null);
});

test('the fourth active ticket is refused, naming the limit', () => {
  assert.equal(checkJoin({ user, office, queue: open, activeCount: 3 }), TicketingError.LIMIT_REACHED);
  assert.equal(checkJoin({ user, office, queue: open, activeCount: 5 }), TicketingError.LIMIT_REACHED);
});

test('the limit is reported before a closed queue', () => {
  assert.equal(checkJoin({ user, office, queue: null, activeCount: 3 }), TicketingError.LIMIT_REACHED);
});

test('active tickets are WAITING, CALLED and IN_SERVICE', () => {
  for (const status of ['WAITING', 'CALLED', 'IN_SERVICE']) assert.equal(isActiveTicket({ status }), true);
  for (const status of ['COMPLETED', 'CANCELLED', 'NO_SHOW']) assert.equal(isActiveTicket({ status }), false);
});

test('remaining slots count only active tickets, across offices', () => {
  const tickets = [{ status: 'WAITING' }, { status: 'CALLED' }, { status: 'COMPLETED' }, { status: 'CANCELLED' }];
  assert.equal(remainingSlots(tickets), 1);
  assert.equal(remainingSlots([...tickets, { status: 'IN_SERVICE' }]), 0);
  assert.equal(remainingSlots([]), 3);
});

test('chunks never hold two tickets of the same holder and respect the size', () => {
  const t = (id, user_id) => ({ id, user_id });
  const tickets = [t('a', 'u1'), t('b', 'u1'), t('c', 'u2'), t('d', 'u3'), t('e', 'u4'), t('f', 'u1')];
  const chunks = chunkByHolder(tickets, 3);
  for (const chunk of chunks) {
    assert.ok(chunk.length <= 3);
    assert.equal(new Set(chunk.map((x) => x.user_id)).size, chunk.length);
  }
  assert.deepEqual(chunks.flat().map((x) => x.id).sort(), ['a', 'b', 'c', 'd', 'e', 'f']);
  assert.deepEqual(chunkByHolder([], 3), []);
});
