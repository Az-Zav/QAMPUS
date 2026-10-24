import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatSeq, queueIdFor, shortTicketNumber, ticketIdFor, ticketNumberFor } from '../src/ticketing/ids.js';

// 2026-10-24 17:00 UTC is already 2026-10-25 01:00 on campus (UTC+8)
const lateUtc = new Date('2026-10-24T17:00:00Z');
const noonUtc = new Date('2026-10-24T04:00:00Z');

test('queue id uses the campus day, not the UTC day', () => {
  assert.equal(queueIdFor('off_reg_001', noonUtc), 'off_reg_001_20261024');
  assert.equal(queueIdFor('off_reg_001', lateUtc), 'off_reg_001_20261025');
});

test('ticket id appends the sequence number to the queue id', () => {
  assert.equal(ticketIdFor('off_reg_001_20261024', 7), 'off_reg_001_20261024_7');
});

test('ticket numbers are CODE-MM-DD-SEQ and CODE-SEQ', () => {
  assert.equal(ticketNumberFor('R', noonUtc, 3), 'R-10-24-003');
  assert.equal(ticketNumberFor('R', lateUtc, 12), 'R-10-25-012');
  assert.equal(shortTicketNumber('R', 3), 'R-003');
  assert.equal(formatSeq(1234), '1234');
});

test('single-digit month and day are zero padded', () => {
  assert.equal(ticketNumberFor('C', new Date('2026-03-05T04:00:00Z'), 1), 'C-03-05-001');
});
