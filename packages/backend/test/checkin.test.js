import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkInPayload, parseCheckInPayload } from '../src/ticketing/checkin.js';

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
