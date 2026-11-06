import assert from 'node:assert/strict';
import { test } from 'node:test';
import { upcomingOpening } from '@qampus/core/format';

// Weekdays 08:00-17:00 (minutes since campus midnight), closed on weekends
const day = { open_min: 480, close_min: 1020 };
const hours = { MON: day, TUE: day, WED: day, THU: day, FRI: day };
// Campus time is UTC+8: Friday 2026-11-06 at hh:mm campus
const friday = (hh, mm = 0) => new Date(Date.UTC(2026, 10, 6, hh - 8, mm));

test('before opening, the queue opens later today (BUG-018)', () => {
  assert.deepEqual(upcomingOpening(hours, friday(7, 30)), { when: 'LATER_TODAY', open_min: 480 });
});

test('inside the hours, a closed queue has not opened yet, not "opens again at 08:00"', () => {
  assert.deepEqual(upcomingOpening(hours, friday(8, 59)), { when: 'DURING_HOURS' });
});

test('after closing on a Friday, the next opening is Monday', () => {
  assert.deepEqual(upcomingOpening(hours, friday(18)), { when: 'DAY', day: 'MON', open_min: 480, daysAhead: 3 });
});

test('after closing on a weekday, the next opening is tomorrow', () => {
  const thursdayEvening = new Date(Date.UTC(2026, 10, 5, 18 - 8));
  assert.equal(upcomingOpening(hours, thursdayEvening).daysAhead, 1);
});

test('no hours on any day gives null', () => {
  assert.equal(upcomingOpening({}, friday(9)), null);
  assert.equal(upcomingOpening(undefined, friday(9)), null);
});
