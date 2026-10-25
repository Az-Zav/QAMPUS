// QAMPUS push relay: a Cloudflare Worker. The staff console cannot call Expo's push service from the browser, so it
// asks this relay, which (1) checks the caller is a staff member and (2) sends one fixed "your turn" message.
//
//   POST /push   Authorization: Bearer <the staff member's Firebase ID token>   { "to": "ExponentPushToken[...]", "officeName": "..." }
//
// Staff check without a server key: the relay reads staff/{email} from Firestore's web API with the caller's OWN token.
// The Security Rules let a user read only their own staff document, so Firestore itself validates the token, and a
// forged, expired or non-staff token is refused. No admin credentials live here.

import { bearerToken, buildMessage, corsHeaders, emailFromIdToken, EXPO_PUSH_URL, originAllowed, validatePush } from './lib.js';

const json = (body, status, headers = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });

async function isStaff(env, email, idToken) {
  const url = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/staff/${encodeURIComponent(email)}`;
  const response = await fetch(url, { headers: { authorization: `Bearer ${idToken}` } });
  return response.ok;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('origin');
    const cors = corsHeaders(origin, env);

    if (request.method === 'OPTIONS') return new Response(null, { status: originAllowed(origin, env) ? 204 : 403, headers: cors });
    if (!originAllowed(origin, env)) return json({ error: 'origin not allowed' }, 403);

    const { pathname } = new URL(request.url);
    if (request.method !== 'POST' || pathname !== '/push') return json({ error: 'not found' }, 404, cors);

    const idToken = bearerToken(request.headers.get('authorization'));
    const email = idToken ? emailFromIdToken(idToken) : null;
    if (!email) return json({ error: 'sign in required' }, 401, cors);
    if (!(await isStaff(env, email, idToken))) return json({ error: 'staff only' }, 403, cors);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid json' }, 400, cors);
    }
    const push = validatePush(body);
    if (!push.ok) return json({ error: push.error }, 400, cors);

    const expo = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify(buildMessage(push)),
    });
    const result = await expo.json().catch(() => null);
    // `ticket` is Expo's answer (status ok, or an error such as DeviceNotRegistered); the staff console only logs it
    return json({ ok: expo.ok, ticket: result?.data ?? null }, expo.ok ? 200 : 502, cors);
  },
};
