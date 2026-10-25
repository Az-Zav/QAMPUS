// @qampus/backend: Firestore access shared by apps/mobile and apps/staff, one folder per feature.
// Every function takes the app's own `db` first (each app initializes Firebase for its platform).
// Pure files (ids, derive, preflight) import no Firebase and are unit tested in test/.

export * from './events/index.js';
export * from './ticketing/index.js';
export * from './penalties/index.js';
