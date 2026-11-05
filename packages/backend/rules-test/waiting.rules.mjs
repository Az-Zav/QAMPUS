// Rules check for queues.waiting_seqs against the Firestore and Auth emulators (no real data is touched).
// Runs the app's own ticketing writes as a staff member and three guests, and checks that the rules accept them,
// keep the list right, still accept writes from apps that predate the list, and refuse a wrong list.
//
// From the repo root:
//   firebase emulators:exec --only firestore,auth --project demo-qampus "node packages/backend/rules-test/waiting.rules.mjs"
// (a `demo-` project id keeps the emulators offline; the rules file is the repo's firestore.rules)

import assert from 'node:assert/strict';
import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInAnonymously, signInWithCredential } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  deleteField,
  doc,
  getDoc,
  getFirestore,
  increment,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { campusDate } from '@qampus/core/format';
import {
  callTicket,
  cancelOfficeQueue,
  cancelOwnTicket,
  completeTicket,
  joinQueue,
  openQueue,
  queueIdFor,
  verifyByHolderId,
} from '../src/index.js';

const PROJECT = process.env.GCLOUD_PROJECT || 'demo-qampus';
const FS_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const STAFF_EMAIL = 'staff.registrar@tip.edu.ph';
const OFFICE = { id: 'off_test', code: 'T', name: 'Test Office', status: 'ACTIVE' };

// ---------- seeding as the emulator owner (bypasses rules) ----------
const toValue = (v) => {
  if (v === null) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toValue(x)])) } };
  return { stringValue: String(v) };
};
async function seed(path, data) {
  const url = `http://${FS_HOST}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, toValue(v)])) }),
  });
  if (!res.ok) throw new Error(`seed ${path}: ${res.status} ${await res.text()}`);
}
async function clearAll() {
  await fetch(`http://${FS_HOST}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://${AUTH_HOST}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
}

// ---------- one signed-in client per person ----------
let appCount = 0;
async function client(signIn) {
  const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT, authDomain: 'localhost' }, `c${appCount++}`);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${AUTH_HOST}`, { disableWarnings: true });
  const db = getFirestore(app);
  const [host, port] = FS_HOST.split(':');
  connectFirestoreEmulator(db, host, Number(port));
  const user = await signIn(auth);
  return { app, db, uid: user.user.uid };
}
const staffClient = () =>
  client((auth) =>
    signInWithCredential(
      auth,
      GoogleAuthProvider.credential(JSON.stringify({ sub: 'staff-1', email: STAFF_EMAIL, email_verified: true })),
    ),
  );
async function guestClient(n) {
  const c = await client((auth) => signInAnonymously(auth));
  const profile = { id: c.uid, name: `Guest ${n}`, institutional_id: `G00000${n}` };
  await seed(`users/${c.uid}`, {
    role: 'GUEST',
    name: profile.name,
    institutional_id: profile.institutional_id,
    strike_count: 0,
    active_count: 0,
    active_offices: {},
  });
  return { ...c, profile };
}

const allDay = { open_min: 0, close_min: 1440 };
const queueRef = (db) => doc(db, 'queues', queueIdFor(OFFICE.id, new Date()));
const seqsOf = async (db) => (await getDoc(queueRef(db))).data().waiting_seqs;
const ticketOf = async (db, id) => ({ id, ...(await getDoc(doc(db, 'tickets', id))).data() });
async function refused(promise, label) {
  await assert.rejects(promise, (e) => /DENIED|permission/i.test(`${e.code} ${e.message}`), label);
}

let passed = 0;
const step = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`  ok  ${name}`);
};

async function main() {
  await clearAll();
  await seed(`staff/${STAFF_EMAIL}`, { office_id: OFFICE.id, role: 'STAFF', name: 'Test Staff' });
  await seed(`offices/${OFFICE.id}`, {
    code: OFFICE.code,
    name: OFFICE.name,
    short_name: 'Test',
    status: 'ACTIVE',
    location: 'Building 0',
    default_service_minutes: 1,
    hours: { MON: allDay, TUE: allDay, WED: allDay, THU: allDay, FRI: allDay, SAT: allDay, SUN: allDay },
  });

  const staff = await staffClient();
  const actor = { uid: staff.uid, name: 'Test Staff' };
  const [a, b, c, d] = [await guestClient(1), await guestClient(2), await guestClient(3), await guestClient(4)];
  const ids = {};

  await step('staff open creates the queue with an empty list', async () => {
    await openQueue(staff.db, OFFICE, actor);
    assert.deepEqual(await seqsOf(staff.db), []);
  });

  await step('three joins add 1, 2 and 3', async () => {
    for (const g of [a, b, c]) ids[g.profile.name] = (await joinQueue(g.db, { user: g.profile, office: OFFICE })).id;
    assert.deepEqual(await seqsOf(staff.db), [1, 2, 3]);
  });

  await step('an override call of number 2 takes only 2 off the list', async () => {
    await callTicket(staff.db, { office: OFFICE, ticketId: ids['Guest 2'], actor, override: true });
    assert.deepEqual(await seqsOf(staff.db), [1, 3]);
  });

  await step('a waiting cancel of number 3 takes 3 off the list', async () => {
    await cancelOwnTicket(c.db, { ticket: await ticketOf(c.db, ids['Guest 3']) });
    assert.deepEqual(await seqsOf(staff.db), [1]);
  });

  await step('verify and complete the called ticket leave the list alone', async () => {
    const t = await ticketOf(staff.db, ids['Guest 2']);
    await verifyByHolderId(staff.db, { ticket: t, idNumber: 'G000002', actor });
    await completeTicket(staff.db, { office: OFFICE, ticket: await ticketOf(staff.db, ids['Guest 2']), actor });
    assert.deepEqual(await seqsOf(staff.db), [1]);
  });

  // A complete hand-written join, as the old joinQueue wrote it; `queueExtra` adds fields to the queue update
  const handJoin = (g, queueExtra = {}) =>
    runTransaction(g.db, async (tx) => {
      const q = (await tx.get(queueRef(g.db))).data();
      const seq = q.last_seq + 1;
      tx.update(queueRef(g.db), { last_seq: seq, ...queueExtra, updated_at: serverTimestamp() });
      tx.update(doc(g.db, 'users', g.uid), { active_count: 1, [`active_offices.${OFFICE.id}`]: true });
      tx.set(doc(g.db, 'tickets', `${queueRef(g.db).id}_${seq}`), {
        office_id: OFFICE.id,
        office_name: OFFICE.name,
        queue_date: campusDate(new Date()).key,
        user_id: g.uid,
        holder_name: g.profile.name,
        holder_institutional_id: g.profile.institutional_id,
        daily_sequence: seq,
        ticket_number: `T-00-00-${String(seq).padStart(3, '0')}`,
        status: 'WAITING',
        joined_at: serverTimestamp(),
      });
    });

  await step('a join that writes a wrong list is refused (the same join without it passes next)', async () => {
    await refused(handJoin(d, { waiting_seqs: [] }), 'join that drops the waiting numbers');
    assert.deepEqual(await seqsOf(staff.db), [1]);
  });

  await step('a join from an app without the list is still accepted (transition), list unchanged', async () => {
    await handJoin(d);
    assert.deepEqual(await seqsOf(staff.db), [1]);
  });

  await step('a ticket that is not on the list can still be cancelled', async () => {
    const id = `${queueRef(d.db).id}_4`;
    await cancelOwnTicket(d.db, { ticket: await ticketOf(d.db, id) });
    assert.deepEqual(await seqsOf(staff.db), [1]);
  });

  await step('a waiting cancel that removes someone else\'s number is refused; the real cancel passes', async () => {
    // Guest 3 rejoins as number 5, then tries to cancel while taking number 1 (Guest 1) off instead of 5
    const id = (await joinQueue(c.db, { user: c.profile, office: OFFICE })).id;
    assert.deepEqual(await seqsOf(staff.db), [1, 5]);
    const handCancel = (seqsAfter) =>
      runTransaction(c.db, async (tx) => {
        await tx.get(doc(c.db, 'tickets', id));
        tx.update(queueRef(c.db), { waiting_seqs: seqsAfter, updated_at: serverTimestamp() });
        tx.update(doc(c.db, 'users', c.uid), { active_count: increment(-1), [`active_offices.${OFFICE.id}`]: deleteField() });
        tx.update(doc(c.db, 'tickets', id), { status: 'CANCELLED', cancelled_by: 'USER', cancelled_at: serverTimestamp() });
      });
    await refused(handCancel([5]), 'cancel that removes another number');
    assert.deepEqual(await seqsOf(staff.db), [1, 5]);
    await handCancel([1]);
    assert.deepEqual(await seqsOf(staff.db), [1]);
  });

  await step('cancel entire queue empties the list', async () => {
    await cancelOfficeQueue(staff.db, { office: OFFICE, reason: 'Rules test', actor });
    assert.deepEqual(await seqsOf(staff.db), []);
    assert.equal((await ticketOf(staff.db, ids['Guest 1'])).status, 'CANCELLED');
  });

  await step('a queue doc from before the list keeps working without one', async () => {
    const other = { id: 'off_old', code: 'O', name: 'Old Office', status: 'ACTIVE' };
    await seed(`offices/${other.id}`, {
      code: other.code,
      name: other.name,
      short_name: 'Old',
      status: 'ACTIVE',
      default_service_minutes: 1,
      hours: { MON: allDay, TUE: allDay, WED: allDay, THU: allDay, FRI: allDay, SAT: allDay, SUN: allDay },
    });
    await seed(`queues/${queueIdFor(other.id, new Date())}`, {
      status: 'OPEN',
      last_seq: 0,
      last_called_seq: 0,
      current_ticket_id: null,
      cutoff_overridden: false,
      completed_count: 0,
      service_seconds_total: 0,
    });
    await joinQueue(a.db, { user: a.profile, office: other });
    const q = (await getDoc(doc(a.db, 'queues', queueIdFor(other.id, new Date())))).data();
    assert.equal(q.last_seq, 1);
    assert.equal('waiting_seqs' in q, false);
  });

  for (const x of [staff, a, b, c, d]) await deleteApp(x.app);
  console.log(`\n${passed} rules checks passed`);
}

main().catch((error) => {
  console.error('\nFAILED:', error?.message ?? error);
  process.exit(1);
});
