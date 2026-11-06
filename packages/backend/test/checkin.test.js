import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkInPayload, parseCheckInPayload, pickCheckInTicket } from '../src/ticketing/checkin.js';

const NOW = Date.UTC(2026, 10, 6, 2, 0, 0);
const ago = (seconds) => new Date(NOW - seconds * 1000).toISOString();
const offices = [
  { id: 'f', code: 'F', check_in_code: '111111' },
  { id: 'g', code: 'G', check_in_code: '222222' },
  { id: 'h', code: 'H', check_in_code: '333333' },
];
const called = (id, office_id, secondsAgo = 5) => ({ id, office_id, status: 'CALLED', called_at: ago(secondsAgo) });

test('a typed code picks the called ticket of the office with that code (BUG-022)', () => {
  const tickets = [called('tf', 'f'), called('tg', 'g'), called('th', 'h')];
  const picked = pickCheckInTicket({ tickets, offices, code: '333333', now: NOW });
  assert.equal(picked.ticket.id, 'th');
  assert.equal(picked.office.id, 'h');
});

test('a scanned QR picks the called ticket of its office, and another office is WRONG_OFFICE', () => {
  const tickets = [called('tf', 'f'), called('th', 'h')];
  assert.equal(pickCheckInTicket({ tickets, offices, code: '333333', officeCode: 'h', now: NOW }).ticket.id, 'th');
  assert.deepEqual(pickCheckInTicket({ tickets, offices, code: '222222', officeCode: 'G', now: NOW }), { error: 'WRONG_OFFICE' });
});

test('a wrong typed code still gets a called ticket so the check-in explains itself', () => {
  const tickets = [called('tf', 'f', 90), called('tg', 'g')];
  // No office matches: the ticket still in its grace period comes first
  assert.equal(pickCheckInTicket({ tickets, offices, code: '999999', now: NOW }).ticket.id, 'tg');
});

test('no called ticket is NOT_CALLED', () => {
  const tickets = [{ id: 'tw', office_id: 'f', status: 'WAITING' }];
  assert.deepEqual(pickCheckInTicket({ tickets, offices, code: '111111', now: NOW }), { error: 'NOT_CALLED' });
});

test('the payload reads back to the office code and the six digits', () => {
  const payload = checkInPayload({ code: 'R', check_in_code: '082607' });
  assert.equal(payload, 'qampus://check-in/R/082607');
  assert.deepEqual(parseCheckInPayload(payload), { officeCode: 'R', code: '082607' });
});

test('the office code is read in capitals and surrounding spaces are ignored', () => {
  assert.deepEqual(parseCheckInPayload('  qampus://check-in/reg/012345\n'), { officeCode: 'REG', code: '012345' });
});

test('anything that is not our QR is refused', () => {
  assert.equal(parseCheckInPayload('https://example.com'), null);
  assert.equal(parseCheckInPayload('qampus://check-in/R/12345'), null); // five digits
  assert.equal(parseCheckInPayload('qampus://check-in/R/1234567'), null); // seven digits
  assert.equal(parseCheckInPayload('qampus://check-in/R/08260a'), null);
  assert.equal(parseCheckInPayload('qampus://check-in/R'), null);
  assert.equal(parseCheckInPayload('qampus://check-in/R/082607/extra'), null);
  assert.equal(parseCheckInPayload('qampus://other/R/082607'), null);
  assert.equal(parseCheckInPayload(''), null);
  assert.equal(parseCheckInPayload(null), null);
});
