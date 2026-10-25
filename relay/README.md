# QAMPUS push relay

A small Cloudflare Worker. The staff console cannot call Expo's push service from the browser (the browser blocks it), so it
asks this relay. The relay checks the caller is a staff member and sends one fixed "It's your turn" message to Expo, which
delivers it to the student's phone through Google's FCM.

```
staff console  --POST /push + the staff member's Firebase ID token-->  relay  --POST-->  Expo  -->  FCM  -->  the phone
```

## How it stays safe
- It reads `staff/{email}` from Firestore's web API using the caller's **own** token. The Security Rules let a user read only
  their own staff document, so Firestore itself validates the token. No admin key is stored here.
- It sends nothing but the fixed message (`src/lib.js`, `buildMessage`); the only caller-supplied text is the office name.
- Browsers may only call it from the origins in `ALLOWED_ORIGINS` (`wrangler.jsonc`).

## Run it on your PC (no Cloudflare account needed)
```bash
cd relay
npm run dev        # serves http://localhost:8787
```
The staff `.env` already points at it: `EXPO_PUBLIC_PUSH_RELAY_URL=http://localhost:8787`. Restart the staff app after changing it.
Wrangler runs through `npx`, so nothing is installed in the repo.

## Put it online (Cloudflare free plan: 100,000 requests a day)
```bash
cd relay
npm run deploy     # first time: opens the browser to log in and asks you to register a workers.dev name
```
Copy the printed address into the staff `.env` as `EXPO_PUBLIC_PUSH_RELAY_URL`, and add the staff console's own address to
`ALLOWED_ORIGINS` in `wrangler.jsonc` once it is hosted, then deploy again.

## Test
```bash
npm test           # unit tests of the helpers
```
