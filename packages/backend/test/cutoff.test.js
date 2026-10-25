import assert from 'node:assert/strict';
import { test } from 'node:test';
import { averageServiceMinutes, CutoffReason, cutoffState, estimatedWaitMinutes } from '../src/ticketing/derive.js';
import { checkJoin, TicketingError } from '../src/ticketing/preflight.js';

// Campus time is UTC+8. Monday 2026-10-26: 16:00 campus = 08:00Z, closing 17:00 campus = 09:00Z.
const weekdays = { open_min: 480, close_min: 1020 };
const office = {
  id: 'off_reg_001',
  status: 'ACTIVE',
  default_service_minutes: 10,
  hours: { MON: weekdays, TUE: weekdays, WED: weekdays, THU: weekdays, FRI: weekdays },
};
const queue = (extra = {}) => ({
  status: 'OPEN',
  last_seq: 0,
  last_called_seq: 0,
  completed_count: 0,
  service_seconds_total: 0,
  cutoff_overridden: false,
  ...extra,
});
const at = (iso) => new Date(iso);

test('an empty line an hour before closing accepts a join', () => {
  const state = cutoffState({ office, queue: queue(), now: at('2026-10-26T08:00:00Z') });
  assert.equal(state.canJoin, true);
  assert.equal(state.reason, null);
  assert.equal(state.closesInMinutes, 60);
});

test('the join exactly at the cutoff is accepted, one minute later is refused', () => {
  // 5 waiting + 1 new = 6 visits of 10 minutes: the cutoff is 16:00 campus (08:00Z)
  const full = queue({ last_seq: 5 });
  const exact = cutoffState({ office, queue: full, now: at('2026-10-26T08:00:00Z') });
  assert.equal(exact.canJoin, true);
  assert.equal(exact.cutoffAt.toISOString(), '2026-10-26T08:00:00.000Z');
  const late = cutoffState({ office, queue: full, now: at('2026-10-26T08:01:00Z') });
  assert.equal(late.canJoin, false);
  assert.equal(late.reason, CutoffReason.NO_CAPACITY);
});

test('after closing time a join is refused whatever the line', () => {
  const state = cutoffState({ office, queue: queue(), now: at('2026-10-26T09:30:00Z') });
  assert.equal(state.canJoin, false);
  assert.equal(state.reason, CutoffReason.PAST_CLOSING);
});

test('a staff override lets the join through', () => {
  const state = cutoffState({ office, queue: queue({ cutoff_overridden: true }), now: at('2026-10-26T09:30:00Z') });
  assert.equal(state.canJoin, true);
  assert.equal(state.reason, null);
});

test('a measured average replaces the office default', () => {
  const measured = queue({ completed_count: 3, service_seconds_total: 900 });
  assert.equal(averageServiceMinutes(office, measured), 5);
  assert.equal(averageServiceMinutes(office, queue()), 10);
  assert.equal(averageServiceMinutes(office, null), 10);
  assert.equal(estimatedWaitMinutes(4, office, measured), 20);
  assert.equal(estimatedWaitMinutes(3, office, queue({ completed_count: 3, service_seconds_total: 495 })), 8);
});

test('fewer than three completed visits keep the office default', () => {
  assert.equal(averageServiceMinutes(office, queue({ completed_count: 2, service_seconds_total: 20 })), 10);
  assert.equal(averageServiceMinutes(office, queue({ completed_count: 1, service_seconds_total: 600 })), 10);
});

test('a measured visit length is never below one minute', () => {
  assert.equal(averageServiceMinutes(office, queue({ completed_count: 4, service_seconds_total: 40 })), 1);
  assert.equal(averageServiceMinutes(office, queue({ completed_count: 3, service_seconds_total: 120 })), 1);
  assert.equal(averageServiceMinutes(office, queue({ completed_count: 3, service_seconds_total: 270 })), 1.5);
});

test('a day without hours has no cutoff and names the next opening day', () => {
  const state = cutoffState({ office, queue: queue(), now: at('2026-10-25T04:00:00Z') }); // Sunday
  assert.equal(state.canJoin, true);
  assert.equal(state.cutoffAt, null);
  assert.deepEqual(state.nextOpen, { day: 'MON', open_min: 480, daysAhead: 1 });
});

test('after Friday closing the next opening is Monday', () => {
  const state = cutoffState({ office, queue: queue(), now: at('2026-10-30T10:00:00Z') }); // Friday 18:00 campus
  assert.equal(state.reason, CutoffReason.PAST_CLOSING);
  assert.deepEqual(state.nextOpen, { day: 'MON', open_min: 480, daysAhead: 3 });
  assert.equal(state.closesAtMinute, 1020);
});

test('an office record without hours has no cutoff', () => {
  const state = cutoffState({ office: { id: 'x', default_service_minutes: 10 }, queue: queue(), now: at('2026-10-26T09:30:00Z') });
  assert.equal(state.canJoin, true);
});

test('the join check refuses past the cutoff after the cheaper checks pass', () => {
  const user = { name: 'A', institutional_id: '1' };
  const join = (now, extra = {}) => checkJoin({ user, office, queue: queue(extra), now });
  assert.equal(join(at('2026-10-26T08:00:00Z')), null);
  assert.equal(join(at('2026-10-26T09:30:00Z')), TicketingError.PAST_CUTOFF);
  assert.equal(join(at('2026-10-26T09:30:00Z'), { cutoff_overridden: true }), null);
  assert.equal(join(at('2026-10-26T09:30:00Z'), { status: 'CLOSED' }), TicketingError.QUEUE_CLOSED);
});
