import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildGuestProfile } from '../src/identity/profile.js';

test('a new guest profile has the fields and starting counters the create rule requires', () => {
  const profile = buildGuestProfile({ name: '  Ana Cruz ', email: ' ana@example.com ', guestType: 'ALUMNI', id: 'G104728' });
  assert.equal(profile.role, 'GUEST');
  assert.equal(profile.name, 'Ana Cruz');
  assert.equal(profile.email, 'ana@example.com');
  assert.equal(profile.guest_type, 'ALUMNI');
  assert.equal(profile.institutional_id, 'G104728');
  assert.equal(profile.strike_count, 0);
  assert.equal(profile.banned_until, null);
  assert.equal(profile.active_count, 0);
  assert.deepEqual(profile.active_offices, {});
});

test('a blank email is stored as null', () => {
  assert.equal(buildGuestProfile({ name: 'A', email: '   ', guestType: 'PARENT', id: 'G000001' }).email, null);
  assert.equal(buildGuestProfile({ name: 'A', guestType: 'PARENT', id: 'G000001' }).email, null);
});
