// The relay's pure helpers (no network, so they run under plain Node and are unit tested in test/).

export const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';
// Must match `defaultChannel` of the expo-notifications plugin in apps/mobile/app.json and lib/push.js
export const PUSH_CHANNEL = 'default';

const EXPO_TOKEN = /^Expo(nent)?PushToken\[[A-Za-z0-9_-]+\]$/;
const OFFICE_NAME_MAX = 80;

export const allowedOrigins = (env) =>
  String(env?.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// A browser always names its origin and must be on the list; a call with no origin (curl, a test) is let through
// because it still has to carry a staff member's sign-in token.
export const originAllowed = (origin, env) => !origin || allowedOrigins(env).includes(origin);

// CORS headers for a listed origin, none otherwise (the browser then blocks the response)
export function corsHeaders(origin, env) {
  if (!origin || !allowedOrigins(env).includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function bearerToken(header) {
  const match = /^Bearer\s+(\S+)$/i.exec(String(header ?? '').trim());
  return match ? match[1] : null;
}

// The email inside a Firebase ID token, in lowercase, or null. The token is NOT trusted here: Firestore verifies it
// when the relay reads the staff document with it (a forged email fails the rule that a user reads only their own doc).
export function emailFromIdToken(token) {
  try {
    const payload = String(token).split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    const { email } = JSON.parse(atob(base64));
    return typeof email === 'string' && email.includes('@') ? email.toLowerCase() : null;
  } catch {
    return null;
  }
}

// The body the staff console sends: { to, officeName }
export function validatePush(body) {
  const to = typeof body?.to === 'string' ? body.to.trim() : '';
  if (!EXPO_TOKEN.test(to)) return { ok: false, error: 'invalid push token' };
  const officeName = typeof body?.officeName === 'string' ? body.officeName.trim().slice(0, OFFICE_NAME_MAX) : '';
  return { ok: true, to, officeName };
}

// The ONLY message the relay ever sends: fixed text, no personal data, nothing taken from the caller but the office name.
// A call lapses after 60 seconds, so the message is worthless after two minutes (ttl).
export function buildMessage({ to, officeName }) {
  const where = officeName ? `Go to ${officeName}` : 'Go to the counter';
  return {
    to,
    title: "It's your turn",
    body: `${where} and check in within 1 minute.`,
    channelId: PUSH_CHANNEL,
    priority: 'high',
    ttl: 120,
    data: { type: 'YOUR_TURN' },
  };
}
