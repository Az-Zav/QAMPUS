import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isGuestId, isStudentId, randomGuestId } from '../src/identity/ids.js';

test('a guest ID is G plus six digits, with leading zeros kept', () => {
  assert.equal(randomGuestId(() => 0), 'G000000');
  assert.equal(randomGuestId(() => 0.104728), 'G104728');
  assert.equal(randomGuestId(() => 0.5), 'G500000');
  assert.equal(randomGuestId(() => 0.9999999), 'G999999');
});

test('every generated guest ID passes the guest ID check', () => {
  for (let i = 0; i < 200; i += 1) assert.equal(isGuestId(randomGuestId()), true);
});

test('guest IDs reject a dash, wrong length and a lowercase letter', () => {
  assert.equal(isGuestId('G104728'), true);
  assert.equal(isGuestId('G-104728'), false);
  assert.equal(isGuestId('G10472'), false);
  assert.equal(isGuestId('g104728'), false);
  assert.equal(isGuestId('1047281'), false);
});

test('student IDs are exactly seven digits', () => {
  assert.equal(isStudentId('2012345'), true);
  assert.equal(isStudentId('201234'), false);
  assert.equal(isStudentId('20123456'), false);
  assert.equal(isStudentId('20123a5'), false);
  assert.equal(isStudentId(null), false);
});
