import assert from 'node:assert/strict';
import { test } from 'node:test';
import { waitingTickets } from '../src/ticketing/derive.js';
import { checkCall, TicketingError } from '../src/ticketing/preflight.js';

const open = { status: 'OPEN', last_seq: 3, last_called_seq: 0, current_ticket_id: null };
const waiting = { office_id: 'off_reg_001', status: 'WAITING', daily_sequence: 2 };

test('a waiting ticket of the office can be called when the window is free', () => {
  assert.equal(checkCall({ officeId: 'off_reg_001', queue: open, ticket: waiting }), null);
});

test('a closed or missing queue cannot call', () => {
  assert.equal(checkCall({ officeId: 'off_reg_001', queue: null, ticket: waiting }), TicketingError.QUEUE_CLOSED);
  assert.equal(
    checkCall({ officeId: 'off_reg_001', queue: { ...open, status: 'CLOSED' }, ticket: waiting }),
    TicketingError.QUEUE_CLOSED,
  );
});

test('the window is busy while a ticket is current', () => {
  assert.equal(
    checkCall({ officeId: 'off_reg_001', queue: { ...open, current_ticket_id: 'x_1' }, ticket: waiting }),
    TicketingError.WINDOW_BUSY,
  );
});

test('only a WAITING ticket of the same office can be called', () => {
  const call = (ticket) => checkCall({ officeId: 'off_reg_001', queue: open, ticket });
  assert.equal(call(null), TicketingError.TICKET_UNAVAILABLE);
  assert.equal(call({ ...waiting, status: 'CALLED' }), TicketingError.TICKET_UNAVAILABLE);
  assert.equal(call({ ...waiting, status: 'CANCELLED' }), TicketingError.TICKET_UNAVAILABLE);
  assert.equal(call({ ...waiting, office_id: 'off_csh_002' }), TicketingError.TICKET_UNAVAILABLE);
});

test('waiting tickets are the WAITING ones in number order', () => {
  const tickets = [
    { id: 'c', daily_sequence: 3, status: 'WAITING' },
    { id: 'a', daily_sequence: 1, status: 'CALLED' },
    { id: 'b', daily_sequence: 2, status: 'WAITING' },
    { id: 'd', daily_sequence: 4, status: 'CANCELLED' },
  ];
  assert.deepEqual(waitingTickets(tickets).map((t) => t.id), ['b', 'c']);
});

// --- arrival (slice D) ---
import { checkCheckIn, checkVerifyById } from '../src/ticketing/preflight.js';

const calledAt = '2026-10-24T04:00:00.000Z';
const called = { status: 'CALLED', called_at: calledAt, holder_institutional_id: '2410388' };
const office = { check_in_code: '082607' };
const at = (seconds) => new Date(new Date(calledAt).getTime() + seconds * 1000);

test('check-in succeeds with the right code inside the grace period', () => {
  assert.equal(checkCheckIn({ ticket: called, office, code: '082607', now: at(30) }), null);
  assert.equal(checkCheckIn({ ticket: called, office, code: ' 082 607 ', now: at(59) }), null);
});

test('check-in needs a CALLED ticket and a live grace period', () => {
  assert.equal(checkCheckIn({ ticket: { ...called, status: 'WAITING' }, office, code: '082607', now: at(5) }), TicketingError.NOT_CALLED);
  assert.equal(checkCheckIn({ ticket: null, office, code: '082607', now: at(5) }), TicketingError.NOT_CALLED);
  assert.equal(checkCheckIn({ ticket: called, office, code: '082607', now: at(61) }), TicketingError.GRACE_EXPIRED);
});

test('a wrong or empty code is refused', () => {
  assert.equal(checkCheckIn({ ticket: called, office, code: '111111', now: at(5) }), TicketingError.INVALID_CODE);
  assert.equal(checkCheckIn({ ticket: called, office, code: '', now: at(5) }), TicketingError.INVALID_CODE);
});

test('staff verify by ID ignores case and spaces, and still needs the grace period', () => {
  const guest = { ...called, holder_institutional_id: 'G104728' };
  assert.equal(checkVerifyById({ ticket: guest, idNumber: ' g104728 ', now: at(10) }), null);
  assert.equal(checkVerifyById({ ticket: guest, idNumber: 'G000000', now: at(10) }), TicketingError.ID_MISMATCH);
  assert.equal(checkVerifyById({ ticket: guest, idNumber: 'G104728', now: at(75) }), TicketingError.GRACE_EXPIRED);
});
