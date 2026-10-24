// A Firestore snapshot as a plain object: its id, and every timestamp as an ISO string so views can pass it
// straight to `new Date()`. Pending server timestamps read as the local estimate.
export function toPlain(snap) {
  const data = snap.data({ serverTimestamps: 'estimate' });
  const plain = { id: snap.id };
  for (const [key, value] of Object.entries(data)) {
    plain[key] = typeof value?.toDate === 'function' ? value.toDate().toISOString() : value;
  }
  return plain;
}
