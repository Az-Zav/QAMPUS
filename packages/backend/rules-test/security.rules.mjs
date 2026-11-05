// Security probe of firestore.rules against the Firestore and Auth emulators (no real data is touched).
// Each case is a write or read a hand-made client could send. "control" cases must be refused; "gap" cases show
// what the rules still let through (accepted for the prototype); "flow" cases are the apps' own writes, which must pass.
// The script prints a table and exits 1 if a control case is allowed or a flow is refused.
//
// From the repo root:
//   firebase emulators:exec --only firestore,auth --project demo-qampus "node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON packages/backend/rules-test/security.rules.mjs"

import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInAnonymously, signInWithCredential } from 'firebase/auth';
import {
  collection,
  connectFirestoreEmulator,
  deleteField,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { campusDate } from '@qampus/core/format';
import {
  callTicket,
  cancelOfficeQueue,
  cancelOwnTicket,
  checkInByCode,
  claimStudentProfile,
  closeQueue,
  completeTicket,
  issueGuestProfile,
  joinQueue,
  markTicketNoShow,
  openQueue,
  queueIdFor,
  revokeOffense,
  verifyByHolderId,
} from '../src/index.js';

const PROJECT = process.env.GCLOUD_PROJECT || 'demo-qampus';
const FS_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const OFFICE = { id: 'off_a', code: 'A', name: 'Office A', status: 'ACTIVE' };
const OTHER = { id: 'off_b', code: 'B', name: 'Office B', status: 'ACTIVE' };
const allDay = { open_min: 0, close_min: 1440 };
const hours = { MON: allDay, TUE: allDay, WED: allDay, THU: allDay, FRI: allDay, SAT: allDay, SUN: allDay };

// ---------- seeding as the emulator owner (bypasses rules) ----------
const toValue = (v) => {
  if (v === null) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
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

let appCount = 0;
const apps = [];
async function client(signIn) {
  const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT, authDomain: 'localhost' }, `s${appCount++}`);
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${AUTH_HOST}`, { disableWarnings: true });
  const db = getFirestore(app);
  const [host, port] = FS_HOST.split(':');
  connectFirestoreEmulator(db, host, Number(port));
  const user = await signIn(auth);
  return { app, db, uid: user.user.uid };
}
const google = (sub, email) => (auth) =>
  signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify({ sub, email, email_verified: true })));

// A student or guest whose profile is seeded (as the app would have made it)
async function person(signIn, { role, name, institutional_id, extra = {} }) {
  const c = await client(signIn);
  await seed(`users/${c.uid}`, {
    role,
    name,
    institutional_id,
    strike_count: 0,
    banned_until: null,
    active_count: 0,
    active_offices: {},
    push_token: `ExponentPushToken[${c.uid.slice(0, 10)}]`,
    ...extra,
  });
  await seed(`institutionalIds/${institutional_id}`, { uid: c.uid });
  return { ...c, profile: { id: c.uid, name, institutional_id } };
}

// ---------- result table ----------
const results = [];
async function probe(kind, id, label, fn) {
  let outcome;
  try {
    await fn();
    outcome = 'ALLOWED';
  } catch (e) {
    outcome = /DENIED|permission|insufficient/i.test(`${e?.code} ${e?.message}`) ? 'DENIED' : `ERROR ${e?.code ?? ''} ${e?.message ?? e}`;
  }
  results.push({ kind, id, label, outcome });
}

const queueRef = (db, office = OFFICE) => doc(db, 'queues', queueIdFor(office.id, new Date()));
const dayKey = () => campusDate(new Date()).key;
const ticketOf = async (db, id) => ({ id, ...(await getDoc(doc(db, 'tickets', id))).data() });

// A full hand-made join (what joinQueue writes), with overrides for the ticket fields
const handJoin = (p, { ticket = {}, office = OFFICE, activeCount = 0 } = {}) =>
  runTransaction(p.db, async (tx) => {
    const q = (await tx.get(queueRef(p.db, office))).data();
    const seq = q.last_seq + 1;
    tx.update(queueRef(p.db, office), { last_seq: seq, updated_at: serverTimestamp() });
    tx.update(doc(p.db, 'users', p.uid), { active_count: activeCount + 1, [`active_offices.${office.id}`]: true });
    tx.set(doc(p.db, 'tickets', `${queueRef(p.db, office).id}_${seq}`), {
      office_id: office.id,
      office_name: office.name,
      queue_date: dayKey(),
      user_id: p.uid,
      holder_name: p.profile.name,
      holder_institutional_id: p.profile.institutional_id,
      daily_sequence: seq,
      ticket_number: `${office.code}-00-00-${String(seq).padStart(3, '0')}`,
      status: 'WAITING',
      joined_at: serverTimestamp(),
      ...ticket,
    });
    return `${queueRef(p.db, office).id}_${seq}`;
  });

async function main() {
  await clearAll();
  for (const o of [OFFICE, OTHER]) {
    await seed(`offices/${o.id}`, {
      code: o.code,
      name: o.name,
      short_name: o.code,
      status: 'ACTIVE',
      default_service_minutes: 1,
      check_in_code: o.id === OFFICE.id ? '482913' : '111222',
      hours,
    });
  }
  await seed('staff/staff.a@gmail.com', { office_id: OFFICE.id, role: 'STAFF', name: 'Staff A' });
  await seed('staff/staff.b@gmail.com', { office_id: OTHER.id, role: 'STAFF', name: 'Staff B' });

  const staffA = await client(google('staff-a', 'staff.a@gmail.com'));
  const staffB = await client(google('staff-b', 'staff.b@gmail.com'));
  const actorA = { uid: staffA.uid, name: 'Staff A' };
  const actorB = { uid: staffB.uid, name: 'Staff B' };

  const victim = await person(google('stu-1', 'victim@tip.edu.ph'), { role: 'STUDENT', name: 'Vic Victim', institutional_id: '2100001' });
  const mallory = await person(google('stu-2', 'mallory@tip.edu.ph'), { role: 'STUDENT', name: 'Mal Lory', institutional_id: '2100002' });
  const banned = await person(google('stu-3', 'banned@tip.edu.ph'), {
    role: 'STUDENT',
    name: 'Ban Ned',
    institutional_id: '2100003',
    extra: { banned_until: new Date(Date.now() + 20 * 3600 * 1000), strike_count: 0 },
  });

  await openQueue(staffA.db, OFFICE, actorA);
  await openQueue(staffB.db, OTHER, actorB);
  const victimTicket = (await joinQueue(victim.db, { user: victim.profile, office: OFFICE })).id;

  // Complete whatever ticket is at office A's window, so the next call can go through
  async function freeWindow() {
    const q = (await getDoc(queueRef(staffA.db))).data();
    if (q.current_ticket_id) {
      await completeTicket(staffA.db, { office: OFFICE, ticket: await ticketOf(staffA.db, q.current_ticket_id), actor: actorA });
    }
  }

  // =============== CONTROLS: these must be refused ===============
  await probe('control', 'C1', 'Signed-out client reads offices', async () => {
    const anonApp = initializeApp({ apiKey: 'demo-key', projectId: PROJECT }, 'signedout');
    apps.push(anonApp);
    const db = getFirestore(anonApp);
    const [h, p] = FS_HOST.split(':');
    connectFirestoreEmulator(db, h, Number(p));
    await getDocs(collection(db, 'offices'));
  });
  await probe('control', 'C2', 'Student reads another student\'s ticket', () => getDoc(doc(mallory.db, 'tickets', victimTicket)));
  await probe('control', 'C3', 'Student lists all tickets of an office', () =>
    getDocs(query(collection(mallory.db, 'tickets'), where('office_id', '==', OFFICE.id))));
  await probe('control', 'C4', 'Student reads another student\'s profile', () => getDoc(doc(mallory.db, 'users', victim.uid)));
  await probe('control', 'C5', 'Student reads another student\'s notifications', () =>
    getDocs(collection(mallory.db, 'users', victim.uid, 'notifications')));
  await probe('control', 'C6', 'Student lowers own strikes / lifts own ban', () =>
    updateDoc(doc(banned.db, 'users', banned.uid), { banned_until: null }));
  await probe('control', 'C7', 'Banned student joins (rules ban check)', () => handJoin(banned));
  await probe('control', 'C8', 'Student changes own role to STAFF', () => updateDoc(doc(mallory.db, 'users', mallory.uid), { role: 'STAFF' }));
  await probe('control', 'C9', 'Student changes a saved student ID', () =>
    updateDoc(doc(mallory.db, 'users', mallory.uid), { institutional_id: '2100009' }));
  await probe('control', 'C10', 'Student calls a ticket (staff action)', () =>
    callTicket(mallory.db, { office: OFFICE, ticketId: victimTicket, actor: { uid: mallory.uid, name: 'x' } }));
  await probe('control', 'C11', 'Staff of office B calls a ticket of office A', () =>
    callTicket(staffB.db, { office: OFFICE, ticketId: victimTicket, actor: actorB }));
  await probe('control', 'C12', 'Staff of office B reads office A\'s tickets', () =>
    getDocs(query(collection(staffB.db, 'tickets'), where('office_id', '==', OFFICE.id))));
  await probe('control', 'C13', 'Staff of office B reads office A\'s activity log', () =>
    getDocs(query(collection(staffB.db, 'events'), where('office_id', '==', OFFICE.id))));
  await probe('control', 'C14', 'Staff lists all users', () => getDocs(collection(staffA.db, 'users')));
  await probe('control', 'C15', 'Student writes to an office doc', () => updateDoc(doc(mallory.db, 'offices', OFFICE.id), { check_in_code: '000000' }));
  await probe('control', 'C16', 'Student creates (opens) a queue for an office', () =>
    setDoc(doc(mallory.db, 'queues', queueIdFor('off_c', new Date())), {
      status: 'OPEN', last_seq: 0, last_called_seq: 0, current_ticket_id: null, waiting_seqs: [], cutoff_overridden: false,
      completed_count: 0, service_seconds_total: 0, created_at: serverTimestamp(), updated_at: serverTimestamp(),
    }));
  await probe('control', 'C24', 'Student closes an open queue', () =>
    updateDoc(queueRef(mallory.db, OTHER), { status: 'CLOSED', updated_at: serverTimestamp() }));
  await probe('control', 'C25', 'Student sets cutoff_overridden on a queue', () =>
    updateDoc(queueRef(mallory.db), { cutoff_overridden: true, updated_at: serverTimestamp() }));
  await probe('control', 'C17', 'Student writes a YOUR_TURN notification to self', () =>
    setDoc(doc(collection(mallory.db, 'users', mallory.uid, 'notifications')), {
      type: 'YOUR_TURN', title: 't', message: 'm', ticket_id: 'x', office_id: OFFICE.id, is_read: false,
      created_at: serverTimestamp(), read_at: null,
    }));
  await probe('control', 'C18', 'Student writes a notification to another student', () =>
    setDoc(doc(collection(mallory.db, 'users', victim.uid, 'notifications')), {
      type: 'QUEUE_CONFIRMED', title: 't', message: 'm', ticket_id: 'x', office_id: OFFICE.id, is_read: false,
      created_at: serverTimestamp(), read_at: null,
    }));
  await probe('control', 'C19', 'Join with someone else\'s name on the ticket', () =>
    handJoin(mallory, { ticket: { holder_name: 'Vic Victim' } }));
  await probe('control', 'C20', 'Join with a skipped number (last_seq + 2)', () =>
    runTransaction(mallory.db, async (tx) => {
      const q = (await tx.get(queueRef(mallory.db))).data();
      const seq = q.last_seq + 2;
      tx.update(queueRef(mallory.db), { last_seq: seq, updated_at: serverTimestamp() });
      tx.update(doc(mallory.db, 'users', mallory.uid), { active_count: 1, [`active_offices.${OFFICE.id}`]: true });
      tx.set(doc(mallory.db, 'tickets', `${queueRef(mallory.db).id}_${seq}`), {
        office_id: OFFICE.id, office_name: OFFICE.name, queue_date: dayKey(), user_id: mallory.uid,
        holder_name: mallory.profile.name, holder_institutional_id: mallory.profile.institutional_id,
        daily_sequence: seq, ticket_number: `A-00-00-${seq}00`, status: 'WAITING', joined_at: serverTimestamp(),
      });
    }));
  await probe('control', 'C21', 'Guest account claims a 7-digit student ID', async () => {
    const g = await client((auth) => signInAnonymously(auth));
    const b = writeBatch(g.db);
    b.set(doc(g.db, 'users', g.uid), { role: 'GUEST', strike_count: 0, banned_until: null, active_count: 0, institutional_id: '2100077' });
    b.set(doc(g.db, 'institutionalIds', '2100077'), { uid: g.uid });
    await b.commit();
  });
  await probe('control', 'C22', 'Guest account creates a STUDENT profile', async () => {
    const g = await client((auth) => signInAnonymously(auth));
    await setDoc(doc(g.db, 'users', g.uid), { role: 'STUDENT', strike_count: 0, banned_until: null, active_count: 0 });
  });
  await probe('control', 'C23', 'Student deletes an offense', async () => {
    const { deleteDoc } = await import('firebase/firestore');
    await deleteDoc(doc(mallory.db, 'offenses', victimTicket));
  });

  // =============== GAPS: what a hand-made client can do today ===============
  // G1: a profile is created with any ID, without reserving it (the claim is only checked on UPDATE)
  await probe('control', 'G1', 'New student account creates its profile with ANOTHER student\'s ID (no claim)', async () => {
    const s = await client(google('stu-9', 'imposter@tip.edu.ph'));
    await setDoc(doc(s.db, 'users', s.uid), {
      role: 'STUDENT', name: 'Vic Victim', institutional_id: '2100001', strike_count: 0, banned_until: null, active_count: 0,
    });
  });
  await probe('control', 'G2', 'Guest (anonymous) creates its profile holding a 7-digit student ID (no claim)', async () => {
    const g = await client((auth) => signInAnonymously(auth));
    await setDoc(doc(g.db, 'users', g.uid), {
      role: 'GUEST', name: 'Vic Victim', institutional_id: '2100001', strike_count: 0, banned_until: null, active_count: 0,
    });
  });
  // G3: ban evasion with a fresh guest identity
  await probe('gap', 'G3', 'Banned student makes a new guest account and joins the queue', async () => {
    const g = await client((auth) => signInAnonymously(auth));
    const b = writeBatch(g.db);
    b.set(doc(g.db, 'users', g.uid), {
      role: 'GUEST', name: 'Ban Ned', institutional_id: 'G999001', strike_count: 0, banned_until: null, active_count: 0, active_offices: {},
    });
    b.set(doc(g.db, 'institutionalIds', 'G999001'), { uid: g.uid });
    await b.commit();
    await handJoin({ ...g, profile: { name: 'Ban Ned', institutional_id: 'G999001' } });
  });
  // G4: unlimited tickets per account (counter can be lowered without finishing a ticket)
  await probe('gap', 'G4', 'Student lowers active_count and clears active_offices, then joins the SAME office again', async () => {
    await handJoin(mallory);
    await updateDoc(doc(mallory.db, 'users', mallory.uid), { active_count: 0, [`active_offices.${OFFICE.id}`]: deleteField() });
    await handJoin(mallory);
  });
  // G5: self check-in without the code, from anywhere
  await probe('gap', 'G5', 'Any signed-in guest reads the office check-in code', async () => {
    const g = await client((auth) => signInAnonymously(auth));
    const code = (await getDoc(doc(g.db, 'offices', OFFICE.id))).data().check_in_code;
    if (code !== '482913') throw new Error('code not readable');
  });
  await probe('gap', 'G6', 'Called student starts service without any code (direct write)', async () => {
    await callTicket(staffA.db, { office: OFFICE, ticketId: victimTicket, actor: actorA });
    await updateDoc(doc(victim.db, 'tickets', victimTicket), { status: 'IN_SERVICE', service_started_at: serverTimestamp() });
  });
  // G7..G9: staff of ANY office can change ANY student's penalties
  await probe('control', 'G7', 'Staff of office B lifts the ban of a student (no offense revoked)', () =>
    updateDoc(doc(staffB.db, 'users', banned.uid), { banned_until: null, strike_count: 0 }));
  await probe('control', 'G8', 'Staff of office B gives a strike to a student of office A (no offense)', () =>
    updateDoc(doc(staffB.db, 'users', victim.uid), { strike_count: 1 }));
  await probe('control', 'G9', 'Staff of office B lowers a student\'s active_count and clears an office', () =>
    updateDoc(doc(staffB.db, 'users', victim.uid), { active_count: 0, [`active_offices.${OFFICE.id}`]: deleteField() }));
  await probe('gap', 'G10', 'Staff of office B reads any student profile (name, email, ID, push token)', async () => {
    const p = (await getDoc(doc(staffB.db, 'users', victim.uid))).data();
    if (!p.push_token) throw new Error('no token');
  });
  await probe('control', 'G11', 'Staff of office B writes a free-text GLOBAL_ANNOUNCEMENT into a student\'s inbox', () =>
    setDoc(doc(collection(staffB.db, 'users', victim.uid, 'notifications')), {
      type: 'GLOBAL_ANNOUNCEMENT', title: 'Account problem', message: 'Send your password to ...', ticket_id: '', office_id: '',
      is_read: false, created_at: serverTimestamp(), read_at: null,
    }));
  // G12: forged activity log lines from any account
  await probe('control', 'G12', 'Guest writes a forged "Staff A revoked an offense" line into office A\'s log', async () => {
    const g = await client((auth) => signInAnonymously(auth));
    await setDoc(doc(collection(g.db, 'events')), {
      entity_type: 'TICKET', entity_id: victimTicket, action: 'OFFENSE_REVOKED', from_status: null, to_status: null,
      actor_uid: g.uid, actor_name: 'Staff A', reason: 'forged', office_id: OFFICE.id, ticket_number: 'A-11-06-001',
      created_at: serverTimestamp(),
    });
  });
  // G13: waiting list tampering by anyone
  await probe('control', 'G13', 'Guest takes another person\'s number off waiting_seqs (no ticket change)', async () => {
    const honest = await person((auth) => signInAnonymously(auth), { role: 'GUEST', name: 'Hon Est', institutional_id: 'G555001' });
    await joinQueue(honest.db, { user: honest.profile, office: OFFICE });
    const g = await client((auth) => signInAnonymously(auth));
    const q = (await getDoc(queueRef(g.db))).data();
    if (!q.waiting_seqs?.length) throw new Error('empty list, nothing to remove');
    await updateDoc(queueRef(g.db), { waiting_seqs: q.waiting_seqs.slice(1), updated_at: serverTimestamp() });
  });
  // G14: the ticket number string is free within the pattern
  await probe('gap', 'G14', 'Student joins with a forged ticket number (looks like number 001)', async () => {
    const s = await person(google('stu-5', 'forger@tip.edu.ph'), { role: 'STUDENT', name: 'For Ger', institutional_id: '2100005' });
    await handJoin(s, { ticket: { ticket_number: 'A-11-06-001' } });
  });
  // G15: a student renames themselves (the name is copied onto every new ticket)
  await probe('gap', 'G15', 'Student renames own profile to another person\'s name', () =>
    updateDoc(doc(mallory.db, 'users', mallory.uid), { name: 'Vic Victim' }));
  // G16: who holds an ID can be looked up
  await probe('gap', 'G16', 'Any guest looks up which uid holds a student ID', async () => {
    const g = await client((auth) => signInAnonymously(auth));
    const d = await getDoc(doc(g.db, 'institutionalIds', '2100001'));
    if (!d.exists()) throw new Error('not found');
  });
  // G17: student points their push token at someone else's device
  await probe('gap', 'G17', 'Student sets their push_token to another device\'s token', () =>
    updateDoc(doc(mallory.db, 'users', mallory.uid), { push_token: 'ExponentPushToken[someoneelse]' }));
  // G18: staff re-open a past day's queue
  await probe('gap', 'G18', 'Staff re-open yesterday\'s queue doc', async () => {
    const y = new Date(Date.now() - 24 * 3600 * 1000);
    const id = queueIdFor(OFFICE.id, y);
    await seed(`queues/${id}`, { status: 'CLOSED', last_seq: 0, last_called_seq: 0, current_ticket_id: null });
    await updateDoc(doc(staffA.db, 'queues', id), { status: 'OPEN', updated_at: serverTimestamp() });
  });

  // =============== More must-refuse cases for the 2026-11-06 rules ===============
  await probe('control', 'C26', 'Student writes a log line about own ticket that does not change', () =>
    setDoc(doc(collection(victim.db, 'events')), {
      entity_type: 'TICKET', entity_id: victimTicket, action: 'CANCELLED', from_status: null, to_status: null,
      actor_uid: victim.uid, actor_name: 'Vic Victim', reason: null, office_id: OFFICE.id, ticket_number: null,
      created_at: serverTimestamp(),
    }));
  await probe('control', 'C27', 'Staff of office A writes a log line into office B\'s log', () =>
    setDoc(doc(collection(staffA.db, 'events')), {
      entity_type: 'QUEUE', entity_id: queueRef(staffA.db, OTHER).id, action: 'QUEUE_CLOSED', from_status: null, to_status: null,
      actor_uid: staffA.uid, actor_name: 'Staff A', reason: null, office_id: OTHER.id, ticket_number: null,
      created_at: serverTimestamp(),
    }));
  await probe('control', 'C28', 'Staff of office A logs under another staff name', () =>
    setDoc(doc(collection(staffA.db, 'events')), {
      entity_type: 'QUEUE', entity_id: queueRef(staffA.db).id, action: 'QUEUE_CLOSED', from_status: null, to_status: null,
      actor_uid: staffA.uid, actor_name: 'Staff B', reason: null, office_id: OFFICE.id, ticket_number: null,
      created_at: serverTimestamp(),
    }));
  await probe('control', 'C29', 'Staff of office A writes a ticket message tagged with office B', () =>
    setDoc(doc(collection(staffA.db, 'users', victim.uid, 'notifications')), {
      type: 'YOUR_TURN', title: 't', message: 'm', ticket_id: victimTicket, office_id: OTHER.id,
      is_read: false, created_at: serverTimestamp(), read_at: null,
    }));

  // =============== FLOWS: the real app writes must still be accepted ===============
  await probe('flow', 'F1', 'Guest sign-up: profile and Guest ID in one write (issueGuestProfile)', async () => {
    const g = await client((auth) => signInAnonymously(auth));
    const id = await issueGuestProfile(g.db, { uid: g.uid, name: 'New Guest', guestType: 'VISITOR' });
    if (!/^G\d{6}$/.test(id)) throw new Error(`bad id ${id}`);
  });
  let fresh;
  await probe('flow', 'F2', 'Student sign-up: empty profile, then save the student ID with its claim', async () => {
    const s = await client(google('stu-7', 'fresh@tip.edu.ph'));
    await setDoc(doc(s.db, 'users', s.uid), {
      role: 'STUDENT', name: 'Fresh Man', email: 'fresh@tip.edu.ph', institutional_id: null, program: null, guest_type: null,
      push_enabled: true, strike_count: 0, banned_until: null, active_count: 0, active_offices: {}, created_at: serverTimestamp(),
    });
    await claimStudentProfile(s.db, { uid: s.uid, studentId: '2100007', program: 'BSCS' });
    fresh = { ...s, profile: { id: s.uid, name: 'Fresh Man', institutional_id: '2100007' } };
  });
  let offenseTicket;
  await probe('flow', 'F3', 'Join, called, check in by code, verified no-show with reason (offense + strike)', async () => {
    const t = (await joinQueue(fresh.db, { user: fresh.profile, office: OFFICE })).id;
    await freeWindow();
    await callTicket(staffA.db, { office: OFFICE, ticketId: t, actor: actorA });
    const office = (await getDoc(doc(fresh.db, 'offices', OFFICE.id))).data();
    await checkInByCode(fresh.db, { ticket: await ticketOf(fresh.db, t), office, code: office.check_in_code });
    await markTicketNoShow(staffA.db, { office: OFFICE, ticket: await ticketOf(staffA.db, t), actor: actorA, reason: 'Left before service' });
    const u = (await getDoc(doc(fresh.db, 'users', fresh.uid))).data();
    if (u.strike_count !== 1 || u.active_count !== 0) throw new Error(`profile ${JSON.stringify(u)}`);
    offenseTicket = t;
  });
  await probe('control', 'C30', 'Staff of office B revokes an office A offense (naming it on the profile)', () =>
    runTransaction(staffB.db, async (tx) => {
      await tx.get(doc(staffB.db, 'offenses', offenseTicket));
      tx.update(doc(staffB.db, 'users', fresh.uid), { strike_count: 0, last_revoked_offense: offenseTicket });
      tx.update(doc(staffB.db, 'offenses', offenseTicket), { revoked_at: serverTimestamp(), revoked_by: 'staff.b@gmail.com', revoke_reason: 'x' });
    }));
  await probe('flow', 'F4', 'Staff of the office revokes the offense (revokeOffense)', async () => {
    const offense = { id: offenseTicket, ...(await getDoc(doc(staffA.db, 'offenses', offenseTicket))).data() };
    await revokeOffense(staffA.db, { offense, reason: 'Rules test', staffEmail: 'staff.a@gmail.com' });
    const u = (await getDoc(doc(fresh.db, 'users', fresh.uid))).data();
    if (u.strike_count !== 0) throw new Error(`strikes ${u.strike_count}`);
  });
  await probe('flow', 'F5', 'Join, called, student cancels the called ticket (offense) then completes another visit', async () => {
    const t = (await joinQueue(fresh.db, { user: fresh.profile, office: OFFICE })).id;
    await callTicket(staffA.db, { office: OFFICE, ticketId: t, actor: actorA });
    await cancelOwnTicket(fresh.db, { ticket: await ticketOf(fresh.db, t) });
    const t2 = (await joinQueue(fresh.db, { user: fresh.profile, office: OFFICE })).id;
    await callTicket(staffA.db, { office: OFFICE, ticketId: t2, actor: actorA });
    await verifyByHolderId(staffA.db, { ticket: await ticketOf(staffA.db, t2), idNumber: '2100007', actor: actorA });
    await completeTicket(staffA.db, { office: OFFICE, ticket: await ticketOf(staffA.db, t2), actor: actorA });
  });
  await probe('flow', 'F6', 'Student cancels a WAITING ticket that is on the list', async () => {
    const t = (await joinQueue(fresh.db, { user: fresh.profile, office: OFFICE })).id;
    await cancelOwnTicket(fresh.db, { ticket: await ticketOf(fresh.db, t) });
  });

  // =============== Known issue check: cancel entire queue on a CLOSED queue ===============
  await probe('flow', 'K1', 'Cancel entire queue after Close: waiting tickets are cancelled', async () => {
    const s = await person(google('stu-6', 'late@tip.edu.ph'), { role: 'STUDENT', name: 'Late Comer', institutional_id: '2100006' });
    const t = (await joinQueue(s.db, { user: s.profile, office: OTHER })).id;
    await closeQueue(staffB.db, OTHER, actorB);
    await cancelOfficeQueue(staffB.db, { office: OTHER, reason: 'Closed early', actor: actorB });
    const status = (await getDoc(doc(s.db, 'tickets', t))).data().status;
    if (status !== 'CANCELLED') throw new Error(`ticket still ${status}`);
  });

  // ---------- report ----------
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`\n${pad('id', 5)}${pad('kind', 9)}${pad('result', 10)}case`);
  for (const r of results) console.log(`${pad(r.id, 5)}${pad(r.kind, 9)}${pad(r.outcome, 10)}${r.label}`);
  const brokenControls = results.filter((r) => r.kind === 'control' && r.outcome !== 'DENIED');
  const openGaps = results.filter((r) => r.kind === 'gap' && r.outcome === 'ALLOWED');
  const brokenFlows = results.filter((r) => r.kind === 'flow' && r.outcome !== 'ALLOWED');
  console.log(`\ncontrols refused: ${results.filter((r) => r.kind === 'control').length - brokenControls.length}/${results.filter((r) => r.kind === 'control').length}`);
  console.log(`app flows accepted: ${results.filter((r) => r.kind === 'flow').length - brokenFlows.length}/${results.filter((r) => r.kind === 'flow').length}`);
  console.log(`gaps open: ${openGaps.length}/${results.filter((r) => r.kind === 'gap').length}`);
  for (const a of apps) await deleteApp(a).catch(() => {});
  process.exit(brokenControls.length || brokenFlows.length ? 1 : 0);
}

main().catch((error) => {
  console.error('\nFAILED:', error?.stack ?? error);
  process.exit(1);
});
