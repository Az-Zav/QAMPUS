import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  allowedOrigins,
  bearerToken,
  buildMessage,
  corsHeaders,
  emailFromIdToken,
  originAllowed,
  validatePush,
} from '../src/lib.js';

const env = { ALLOWED_ORIGINS: 'http://localhost:8081, https://staff.example.com ' };
const fakeToken = (payload) =>
  `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

test('the allowed origins are the comma separated list, trimmed', () => {
  assert.deepEqual(allowedOrigins(env), ['http://localhost:8081', 'https://staff.example.com']);
  assert.deepEqual(allowedOrigins({}), []);
});

test('a browser origin must be listed, a call with no origin is let through', () => {
  assert.equal(originAllowed('http://localhost:8081', env), true);
  assert.equal(originAllowed('https://evil.example.com', env), false);
  assert.equal(originAllowed(null, env), true);
});

test('CORS headers are only given to a listed origin', () => {
  assert.equal(corsHeaders('http://localhost:8081', env)['Access-Control-Allow-Origin'], 'http://localhost:8081');
  assert.deepEqual(corsHeaders('https://evil.example.com', env), {});
  assert.deepEqual(corsHeaders(null, env), {});
});

test('the bearer token is read from the Authorization header', () => {
  assert.equal(bearerToken('Bearer abc.def.ghi'), 'abc.def.ghi');
  assert.equal(bearerToken('bearer abc'), 'abc');
  assert.equal(bearerToken('Basic abc'), null);
  assert.equal(bearerToken(''), null);
  assert.equal(bearerToken(null), null);
});

test('the email comes out of a token payload in lowercase, and nothing else is trusted', () => {
  assert.equal(emailFromIdToken(fakeToken({ email: 'Jazz@Gmail.com' })), 'jazz@gmail.com');
  assert.equal(emailFromIdToken(fakeToken({ sub: 'anonymous user' })), null);
  assert.equal(emailFromIdToken(fakeToken({ email: 'not-an-email' })), null);
  assert.equal(emailFromIdToken('garbage'), null);
  assert.equal(emailFromIdToken(''), null);
});

test('the push body needs an Expo token and trims the office name', () => {
  assert.deepEqual(validatePush({ to: 'ExponentPushToken[abc_DEF-123]', officeName: '  Registrar ' }), {
    ok: true,
    to: 'ExponentPushToken[abc_DEF-123]',
    officeName: 'Registrar',
  });
  assert.equal(validatePush({ to: 'not-a-token' }).ok, false);
  assert.equal(validatePush({ to: 'ExponentPushToken[]' }).ok, false);
  assert.equal(validatePush({}).ok, false);
  assert.equal(validatePush(null).ok, false);
  assert.equal(validatePush({ to: 'ExponentPushToken[abc]', officeName: 'x'.repeat(500) }).officeName.length, 80);
});

test('the only message ever sent is the fixed "your turn" one', () => {
  const message = buildMessage({ to: 'ExponentPushToken[abc]', officeName: 'Registrar' });
  assert.deepEqual(message, {
    to: 'ExponentPushToken[abc]',
    title: "It's your turn",
    body: 'Go to Registrar and check in within 1 minute.',
    channelId: 'default',
    priority: 'high',
    ttl: 120,
    data: { type: 'YOUR_TURN' },
  });
  assert.match(buildMessage({ to: 'ExponentPushToken[abc]', officeName: '' }).body, /^Go to the counter/);
});
