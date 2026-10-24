import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkCancel, checkComplete, checkNoShow, TicketingError } from '../src/ticketing/preflight.js';

const calledAt = '2026-10-24T04:00:00.000Z';
const at = (seconds) => new Date(new Date(calledAt).getTime() + seconds * 1000);
const inService = { id: 't1', status: 'IN_SERVICE', called_at: calledAt };
const atWindow = { current_ticket_id: 't1' };

test('complete needs the IN_SERVICE ticket that is at the window', () => {
  assert.equal(checkComplete({ ticket: inService, queue: atWindow }), null);
  assert.equal(checkComplete({ ticket: { ...inService, status: 'CALLED' }, queue: atWindow }), TicketingError.NOT_IN_SERVICE);
  assert.equal(checkComplete({ ticket: inService, queue: { current_ticket_id: 't9' } }), TicketingError.NOT_IN_SERVICE);
  assert.equal(checkComplete({ ticket: null, queue: atWindow }), TicketingError.NOT_IN_SERVICE);
});

test('a CALLED ticket is a no-show only after the grace period', () => {
  const called = { id: 't1', status: 'CALLED', called_at: calledAt };
  assert.equal(checkNoShow({ ticket: called, queue: atWindow, reason: '', now: at(30) }), TicketingError.GRACE_NOT_EXPIRED);
  assert.equal(checkNoShow({ ticket: called, queue: atWindow, reason: '', now: at(61) }), null);
});

test('reversing an IN_SERVICE ticket to no-show needs a reason', () => {
  assert.equal(checkNoShow({ ticket: inService, queue: atWindow, reason: '  ', now: at(100) }), TicketingError.REASON_REQUIRED);
  assert.equal(checkNoShow({ ticket: inService, queue: atWindow, reason: 'left the counter', now: at(100) }), null);
});

test('no-show only applies to the ticket at the window', () => {
  assert.equal(
    checkNoShow({ ticket: inService, queue: { current_ticket_id: 'other' }, reason: 'x', now: at(100) }),
    TicketingError.TICKET_UNAVAILABLE,
  );
  assert.equal(
    checkNoShow({ ticket: { id: 't1', status: 'WAITING' }, queue: atWindow, reason: 'x', now: at(100) }),
    TicketingError.TICKET_UNAVAILABLE,
  );
});

test('a student can cancel a WAITING or CALLED ticket, not one in service or finished', () => {
  assert.equal(checkCancel({ ticket: { status: 'WAITING' } }), null);
  assert.equal(checkCancel({ ticket: { status: 'CALLED' } }), null);
  assert.equal(checkCancel({ ticket: { status: 'IN_SERVICE' } }), TicketingError.TICKET_UNAVAILABLE);
  assert.equal(checkCancel({ ticket: { status: 'COMPLETED' } }), TicketingError.TICKET_UNAVAILABLE);
  assert.equal(checkCancel({ ticket: null }), TicketingError.TICKET_UNAVAILABLE);
});
