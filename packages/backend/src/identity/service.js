// Identity writes: the unique student and guest IDs. An ID is reserved by creating institutionalIds/{id} (`{ uid }`,
// create-only) in the same transaction that saves it on the user's profile; Security Rules require both together, so
// two accounts can never hold the same ID. Every function takes `db` first.
//
// Guest IDs are generated here, not by a server (Spark has none): this departs from R-30's "server issues it".

import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { isStudentId, randomGuestId } from './ids.js';

export const IdentityError = Object.freeze({
  ID_TAKEN: 'ID_TAKEN',
  INVALID_ID: 'INVALID_ID',
  DENIED: 'DENIED',
  UNKNOWN: 'UNKNOWN',
});

export class IdentityFailure extends Error {
  constructor(code) {
    super(code);
    this.name = 'IdentityFailure';
    this.code = code;
  }
}

// A guest ID is picked at random; this many taken ones in a row means something is wrong
const GUEST_ID_ATTEMPTS = 8;

function asFailure(error) {
  if (error instanceof IdentityFailure) return error;
  return new IdentityFailure(error?.code === 'permission-denied' ? IdentityError.DENIED : IdentityError.UNKNOWN);
}

// Reserve `id` for `uid` inside `tx` (a read, then a write). False when another account already holds it.
async function reserve(db, tx, uid, id) {
  const ref = doc(db, 'institutionalIds', id);
  const snap = await tx.get(ref);
  if (snap.exists()) return snap.data().uid === uid;
  tx.set(ref, { uid });
  return true;
}

// Guest: save the profile and issue a unique Guest ID in one write. Resolves to the guest's ID (the one they
// already hold, if the profile was saved before). `random` is injectable for tests.
export async function issueGuestProfile(db, { uid, name, email = null, guestType, random = Math.random }) {
  const userRef = doc(db, 'users', uid);
  for (let attempt = 0; attempt < GUEST_ID_ATTEMPTS; attempt += 1) {
    const candidate = randomGuestId(random);
    try {
      return await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        const existing = userSnap.exists() ? userSnap.data().institutional_id : null;
        if (existing) return existing;
        if (!(await reserve(db, tx, uid, candidate))) throw new IdentityFailure(IdentityError.ID_TAKEN);
        tx.update(userRef, {
          name: String(name).trim(),
          email: String(email ?? '').trim() || null,
          guest_type: guestType,
          institutional_id: candidate,
          updated_at: serverTimestamp(),
        });
        return candidate;
      });
    } catch (error) {
      if (error instanceof IdentityFailure && error.code === IdentityError.ID_TAKEN) continue;
      throw asFailure(error);
    }
  }
  throw new IdentityFailure(IdentityError.ID_TAKEN);
}

// Student: save the student ID and program, reserving the ID (R-01). Refused with ID_TAKEN when another
// account registered it first.
export async function claimStudentProfile(db, { uid, studentId, program }) {
  const id = String(studentId ?? '').trim();
  if (!isStudentId(id)) throw new IdentityFailure(IdentityError.INVALID_ID);
  try {
    await runTransaction(db, async (tx) => {
      if (!(await reserve(db, tx, uid, id))) throw new IdentityFailure(IdentityError.ID_TAKEN);
      tx.update(doc(db, 'users', uid), { institutional_id: id, program, updated_at: serverTimestamp() });
    });
  } catch (error) {
    throw asFailure(error);
  }
}
