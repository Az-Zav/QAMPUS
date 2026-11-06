// QA Attempt 1: edge-case probes on the Firestore and Auth emulators (temporary; no real data is touched).
import { deleteApp, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, GoogleAuthProvider, signInAnonymously, signInWithCredential } from 'firebase/auth';
import { connectFirestoreEmulator, doc, getDoc, getFirestore } from 'firebase/firestore';
import { campusDate } from '@qampus/core/format';
import {
  callNext,
  callTicket,
  cancelOwnTicket,
  completeTicket,
  issueGuestProfile,
  joinQueue,
  markTicketNoShow,
  openQueue,
  queueIdFor,
} from '../src/index.js';

const PROJECT = process.env.GCLOUD_PROJECT || 'demo-qampus';
const FS_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const AUTH_HOST = process.env.FIREBASE_AUTH_EMULATOR_HOST || '127.0.0.1:9099';
const A = { id: 'off_a', code: 'A', name: 'Office A', status: 'ACTIVE' };
const B = { id: 'off_b', code: 'B', name: 'Office B', status: 'ACTIVE' };
const C = { id: 'off_c', code: 'C', name: 'Office C', status: 'ACTIVE' };
const allDay = { open_min: 0, close_min: 1440 };
const hours = { MON: allDay, TUE: allDay, WED: allDay, THU: allDay, FRI: allDay, SAT: allDay, SUN: allDay };

const toValue = (v) => {
  if (v === null) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'object') return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toValue(x)])) } };
  return { stringValue: String(v) };
};
async function seed(path, data, mask = null) {
  const q = mask ? '?' + mask.map((f) => `updateMask.fieldPaths=${f}`).join('&') : '';
  const res = await fetch(`http://${FS_HOST}/v1/projects/${PROJECT}/databases/(default)/documents/${path}${q}`, {
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
let n = 0;
const apps = [];
async function client(signIn) {
  const app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT, authDomain: 'localhost' }, `q${n++}`);
  apps.push(app);
  const auth = getAuth(app);
  connectAuthEmulator(auth, `http://${AUTH_HOST}`, { disableWarnings: true });
  const db = getFirestore(app);
  const [h, p] = FS_HOST.split(':');
  connectFirestoreEmulator(db, h, Number(p));
  const user = await signIn(auth);
  return { db, uid: user.user.uid };
}
const google = (sub, email) => (auth) =>
  signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify({ sub, email, email_verified: true })));
async function student(sub, name, id, extra = {}) {
  const c = await client(google(sub, `${sub}@tip.edu.ph`));
  await seed(`users/${c.uid}`, { role: 'STUDENT', name, institutional_id: id, strike_count: 0, banned_until: null, active_count: 0, active_offices: {}, ...extra });
  await seed(`institutionalIds/${id}`, { uid: c.uid });
  return { ...c, profile: { id: c.uid, name, institutional_id: id } };
}
const out = [];
async function step(id, label, fn) {
  try {
    const r = await fn();
    out.push(`${id.padEnd(5)} OK       ${label}${r !== undefined ? `  -> ${JSON.stringify(r)}` : ''}`);
  } catch (e) {
    out.push(`${id.padEnd(5)} REFUSED  ${label}  -> ${e?.code ?? ''} ${e?.message ?? e}`.trimEnd());
  }
}
const read = async (db, path) => (await getDoc(doc(db, path))).data();

async function main() {
  await clearAll();
  for (const o of [A, B, C]) {
    await seed(`offices/${o.id}`, { code: o.code, name: o.name, short_name: o.code, status: 'ACTIVE', default_service_minutes: 1, check_in_code: '482913', hours });
  }
  for (const o of [A, B, C]) await seed(`staff/staff.${o.code.toLowerCase()}@gmail.com`, { office_id: o.id, role: 'STAFF', name: `Staff ${o.code}` });
  const sA = await client(google('sa', 'staff.a@gmail.com'));
  const sB = await client(google('sb', 'staff.b@gmail.com'));
  const sC = await client(google('sc', 'staff.c@gmail.com'));
  const aA = { uid: sA.uid, name: 'Staff A' };
  const aB = { uid: sB.uid, name: 'Staff B' };
  const aC = { uid: sC.uid, name: 'Staff C' };
  for (const [s, o, a] of [[sA, A, aA], [sB, B, aB], [sC, C, aC]]) await openQueue(s.db, o, a);

  // E1: guest with a long name (the guest form has no length limit; event actor_name must be <= 100)
  const longName = 'Maria Clara '.repeat(10).trim(); // 119 characters
  const g1 = await client((auth) => signInAnonymously(auth));
  let g1Id;
  await step('E1a', `guest profile with a ${longName.length}-char name`, async () => (g1Id = await issueGuestProfile(g1.db, { uid: g1.uid, name: longName, guestType: 'ALUMNI' })));
  await step('E1b', 'that guest joins Office A', () => joinQueue(g1.db, { user: { id: g1.uid, name: longName, institutional_id: g1Id }, office: A }));
  const g2 = await client((auth) => signInAnonymously(auth));
  let g2Id;
  await step('E1c', 'control: guest with a short name', async () => (g2Id = await issueGuestProfile(g2.db, { uid: g2.uid, name: 'Short Name', guestType: 'ALUMNI' })));
  await step('E1d', 'control: short-name guest joins Office A', () => joinQueue(g2.db, { user: { id: g2.uid, name: 'Short Name', institutional_id: g2Id }, office: A }));

  // E2: student opens "Cancel ticket?" while WAITING; staff call the ticket before the student taps Confirm
  const s2 = await student('race', 'Race Student', '2200001');
  const t2 = await joinQueue(s2.db, { user: s2.profile, office: B });
  const staleView = { id: t2.id, ...(await read(s2.db, `tickets/${t2.id}`)) }; // what the app holds when the dialog opens
  await step('E2a', 'staff B calls the ticket', () => callTicket(sB.db, { office: B, ticketId: t2.id, actor: aB }).then(() => 'CALLED'));
  await step('E2b', 'student confirms the "free" cancel with the WAITING copy still in hand', () => cancelOwnTicket(s2.db, { ticket: staleView }));
  await step('E2c', 'student profile after the cancel', async () => {
    const u = await read(s2.db, `users/${s2.uid}`);
    return { strike_count: u.strike_count, offense_exists: !!(await getDoc(doc(sB.db, 'offenses', t2.id))).exists() };
  });

  // E3: a ticket left IN_SERVICE at yesterday's window (staff went home / midnight passed)
  const s3 = await student('stuck', 'Stuck Student', '2200002', { active_count: 1, active_offices: { [A.id]: true } });
  const yesterday = new Date(Date.now() - 86400000);
  const yq = queueIdFor(A.id, yesterday);
  const yt = `${yq}_1`;
  await seed(`queues/${yq}`, { status: 'CLOSED', last_seq: 1, last_called_seq: 1, current_ticket_id: yt, waiting_seqs: [], cutoff_overridden: false, completed_count: 0, service_seconds_total: 0 });
  await seed(`tickets/${yt}`, {
    office_id: A.id, office_name: A.name, queue_date: campusDate(yesterday).key, user_id: s3.uid, holder_name: 'Stuck Student',
    holder_institutional_id: '2200002', daily_sequence: 1, ticket_number: 'A-00-00-001', status: 'IN_SERVICE',
    joined_at: yesterday, called_at: yesterday, service_started_at: yesterday,
  });
  const ytView = { id: yt, ...(await read(s3.db, `tickets/${yt}`)) };
  await step('E3a', 'staff A completes yesterday\'s IN_SERVICE ticket (console uses today)', () => completeTicket(sA.db, { office: A, ticket: ytView, actor: aA }));
  await step('E3b', 'student cancels it', () => cancelOwnTicket(s3.db, { ticket: ytView }));
  await step('E3c', 'student joins Office A today', () => joinQueue(s3.db, { user: s3.profile, office: A }));

  // E4: staff PC clock 45 minutes fast; second offense (ban) on a no-show
  const s4 = await student('skew', 'Skew Student', '2200003', { strike_count: 1 });
  const t4 = await joinQueue(s4.db, { user: s4.profile, office: C });
  await callTicket(sC.db, { office: C, ticketId: t4.id, actor: aC });
  await seed(`tickets/${t4.id}`, { called_at: new Date(Date.now() - 120000) }, ['called_at']); // grace ran out 1 min ago
  const v4 = async () => ({ id: t4.id, ...(await read(sC.db, `tickets/${t4.id}`)) });
  await step('E4a', 'no-show (2nd offense -> ban) with staff clock +45 min', async () =>
    markTicketNoShow(sC.db, { office: C, ticket: await v4(), actor: aC, now: new Date(Date.now() + 45 * 60000) }));
  await step('E4b', 'control: same no-show with a correct clock', async () => markTicketNoShow(sC.db, { office: C, ticket: await v4(), actor: aC }));

  // E5: staff double-click "Call next" (no in-flight guard in the console)
  const s5a = await student('dbl1', 'Dbl One', '2200004');
  const s5b = await student('dbl2', 'Dbl Two', '2200005');
  await joinQueue(s5a.db, { user: s5a.profile, office: B });
  await joinQueue(s5b.db, { user: s5b.profile, office: B });
  await completeTicketIfAny(sB, B, aB);
  const { getDocs, collection, query, where } = await import('firebase/firestore');
  const tix = (await getDocs(query(collection(sB.db, 'tickets'), where('office_id', '==', B.id), where('queue_date', '==', campusDate().key)))).docs.map((d) => ({ id: d.id, ...d.data() }));
  const r = await Promise.allSettled([callNext(sB.db, { office: B, tickets: tix, actor: aB }), callNext(sB.db, { office: B, tickets: tix, actor: aB })]);
  out.push(`E5    two Call next at once -> ${r.map((x) => (x.status === 'fulfilled' ? 'called' : x.reason?.code)).join(', ')}`);

  // E6: the three-ticket limit (R-07) on the server side
  const D = { id: 'off_d', code: 'D', name: 'Office D', status: 'ACTIVE' };
  const E = { id: 'off_e', code: 'E', name: 'Office E', status: 'ACTIVE' };
  for (const o of [D, E]) {
    await seed(`offices/${o.id}`, { code: o.code, name: o.name, short_name: o.code, status: 'ACTIVE', default_service_minutes: 1, check_in_code: '482913', hours });
    await seed(`staff/staff.${o.code.toLowerCase()}@gmail.com`, { office_id: o.id, role: 'STAFF', name: `Staff ${o.code}` });
    const s = await client(google(`s${o.code}`, `staff.${o.code.toLowerCase()}@gmail.com`));
    await openQueue(s.db, o, { uid: s.uid, name: `Staff ${o.code}` });
  }
  const s6 = await student('limit', 'Limit Student', '2200006');
  for (const o of [A, B, C]) await joinQueue(s6.db, { user: s6.profile, office: o });
  await step('E6a', 'fourth join through the app code (3 held)', () => joinQueue(s6.db, { user: s6.profile, office: D }));
  const { runTransaction, serverTimestamp, setDoc } = await import('firebase/firestore');
  await step('E6b', 'hand-made fourth join that skips the app check', () =>
    runTransaction(s6.db, async (tx) => {
      const qRef = doc(s6.db, 'queues', queueIdFor(D.id));
      const q = (await tx.get(qRef)).data();
      const seq = q.last_seq + 1;
      tx.update(qRef, { last_seq: seq, waiting_seqs: [...q.waiting_seqs, seq], updated_at: serverTimestamp() });
      tx.update(doc(s6.db, 'users', s6.uid), { active_count: 4, [`active_offices.${D.id}`]: true });
      tx.set(doc(s6.db, 'tickets', `${qRef.id}_${seq}`), {
        office_id: D.id, office_name: D.name, queue_date: campusDate().key, user_id: s6.uid, holder_name: s6.profile.name,
        holder_institutional_id: s6.profile.institutional_id, daily_sequence: seq, ticket_number: `D-00-00-${String(seq).padStart(3, '0')}`,
        status: 'WAITING', joined_at: serverTimestamp(),
      });
    }));
  const s7 = await student('race2', 'Race Two', '2200007');
  await joinQueue(s7.db, { user: s7.profile, office: A });
  await joinQueue(s7.db, { user: s7.profile, office: B });
  const both = await Promise.allSettled([
    joinQueue(s7.db, { user: s7.profile, office: D }),
    joinQueue(s7.db, { user: s7.profile, office: E }),
  ]);
  const u7 = await read(s7.db, `users/${s7.uid}`);
  out.push(`E6c   two joins at once while holding 2 -> ${both.map((x) => (x.status === 'fulfilled' ? 'joined' : x.reason?.code)).join(', ')}; active_count now ${u7.active_count}`);
  void setDoc;

  // E7: a student holds three tickets and all three offices call at the same moment
  const F = { id: 'off_f', code: 'F', name: 'Office F', status: 'ACTIVE', check_in_code: '111111' };
  const G = { id: 'off_g', code: 'G', name: 'Office G', status: 'ACTIVE', check_in_code: '222222' };
  const H = { id: 'off_h', code: 'H', name: 'Office H', status: 'ACTIVE', check_in_code: '333333' };
  const staffOf = {};
  for (const o of [F, G, H]) {
    await seed(`offices/${o.id}`, { code: o.code, name: o.name, short_name: o.code, status: 'ACTIVE', default_service_minutes: 1, check_in_code: o.check_in_code, hours });
    await seed(`staff/staff.${o.code.toLowerCase()}@gmail.com`, { office_id: o.id, role: 'STAFF', name: `Staff ${o.code}` });
    const s = await client(google(`s${o.code}`, `staff.${o.code.toLowerCase()}@gmail.com`));
    staffOf[o.id] = { ...s, actor: { uid: s.uid, name: `Staff ${o.code}` } };
    await openQueue(s.db, o, staffOf[o.id].actor);
  }
  const s8 = await student('three', 'Three Calls', '2200008');
  const t8 = {};
  for (const o of [F, G, H]) t8[o.id] = (await joinQueue(s8.db, { user: s8.profile, office: o })).id;
  const calls = await Promise.allSettled([F, G, H].map((o) => callTicket(staffOf[o.id].db, { office: o, ticketId: t8[o.id], actor: staffOf[o.id].actor })));
  out.push(`E7a   three offices call the same student at once -> ${calls.map((x) => (x.status === 'fulfilled' ? 'called' : x.reason?.code)).join(', ')}`);

  // The app's own choice (apps/mobile/src/hooks/useCheckIn.js): the first CALLED ticket still in its grace period,
  // in the order the tickets listener returns them; the typed code is then checked against THAT ticket's office.
  const { getRemainingSeconds } = await import('@qampus/core/ticket');
  const mine = (await getDocs(query(collection(s8.db, 'tickets'), where('user_id', '==', s8.uid)))).docs.map((d) => ({ id: d.id, ...d.data() }));
  const called = mine.filter((t) => t.status === 'CALLED').map((t) => ({ ...t, called_at: t.called_at.toDate().toISOString() }));
  const pick = called.find((t) => getRemainingSeconds(t.called_at, Date.now()) > 0) ?? called[0];
  out.push(`E7b   called tickets the app sees: ${called.map((t) => t.office_id).join(', ')}; app picks ${pick.office_id}`);
  const { checkCheckIn, checkInByCode } = await import('../src/index.js');
  // The student is standing at Office H and types H's code
  out.push(`E7c   student at Office H types H's code 333333 -> app answers: ${checkCheckIn({ ticket: pick, office: [F, G, H].find((o) => o.id === pick.office_id), code: '333333', now: Date.now() }) ?? 'OK'}`);
  const hTicket = called.find((t) => t.office_id === H.id);
  await step('E7d', 'same code sent for the H ticket directly (what the app should do)', () =>
    checkInByCode(s8.db, { ticket: hTicket, office: H, code: '333333' }).then(() => 'IN_SERVICE'));

  // The two tickets the student cannot attend run out; both offices mark them no-shows
  for (const o of [F, G]) await seed(`tickets/${t8[o.id]}`, { called_at: new Date(Date.now() - 120000) }, ['called_at']);
  for (const o of [F, G]) {
    const t = { id: t8[o.id], ...(await read(staffOf[o.id].db, `tickets/${t8[o.id]}`)) };
    await step(`E7e`, `Office ${o.code} marks its ticket a no-show`, () => markTicketNoShow(staffOf[o.id].db, { office: o, ticket: t, actor: staffOf[o.id].actor }));
  }
  const u8 = await read(s8.db, `users/${s8.uid}`);
  out.push(`E7f   student after the two no-shows -> strike_count ${u8.strike_count}, banned_until ${u8.banned_until ? u8.banned_until.toDate().toISOString() : 'none'}`);

  console.log(out.join('\n'));
}
async function completeTicketIfAny(s, office, actor) {
  const q = await read(s.db, `queues/${queueIdFor(office.id)}`);
  if (!q.current_ticket_id) return;
  const t = { id: q.current_ticket_id, ...(await read(s.db, `tickets/${q.current_ticket_id}`)) };
  // the E2 ticket was cancelled, so the window should already be free; this is a guard only
  if (t.status === 'IN_SERVICE') await completeTicket(s.db, { office, ticket: t, actor });
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => Promise.all(apps.map((a) => deleteApp(a))).then(() => process.exit()));
