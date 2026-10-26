# QAMPUS

A campus queueing app: students join an office's queue from their phone, offices call people from a staff web console, and a
public display shows who is being served. Backend: Firebase (Auth and Firestore on the Spark plan, no Cloud Functions).

## Layout

| Folder | What it is |
|---|---|
| `apps/mobile` | Student and guest app (Expo, React Native, Expo Router). Needs a development build, not Expo Go. |
| `apps/staff` | Staff web console (Expo web). |
| `packages/backend` | `@qampus/backend`: the shared Firestore layer (ticketing, penalties, events, notifications). Unit tested. |
| `packages/core` | `@qampus/core`: shared enums, limits, formats, program catalogue and legal text. |
| `packages/ui` | `@qampus/ui`: shared components and theme tokens. |
| `firestore.rules`, `firestore.indexes.json` | Security Rules and indexes: the source of truth for the database. |
| `docs/` | `ARCHITECTURE.md` (how it is built and why) and `MAINTAINERS.md` (working agreements, status, decisions). The product spec is `KnowledgeBase/QAMPUS_PRD.md`. |

## Run it

```bash
npm install
npm run staff                                              # staff web console
cd apps/mobile && npx expo start --dev-client --tunnel     # student app, in the Expo development build on a phone
cd packages/backend && npm test                            # unit tests
npm run lint                                               # lint both apps
```

Each app reads its Firebase config from its own `.env` (`EXPO_PUBLIC_FIREBASE_*`).

## Deploy the database rules

```bash
firebase deploy --only firestore:rules,firestore:indexes --project qampus-d0718
```

Never edit rules in the Firebase console: the next deploy replaces them with `firestore.rules`.

## Building the apps

Native changes need a new development build (`eas build --profile development` from `apps/mobile`). JavaScript-only changes reload
without a rebuild.
