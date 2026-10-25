// "Your turn" push (R-25), sent after staff call a ticket. The staff web page cannot call Expo's push service itself (the
// browser blocks it), so it asks the relay (relay/), which checks the caller is staff and sends one fixed message.
// Best effort: this never throws, so a push that fails can never undo or hide the call.

import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

const RELAY_URL = process.env.EXPO_PUBLIC_PUSH_RELAY_URL?.replace(/\/+$/, '');

// `called` is what callTicket resolves to ({ user_id, ... }); `office` is the staff member's office
export async function pushYourTurn(called, office) {
  if (!RELAY_URL || !called?.user_id || !auth.currentUser) return;
  try {
    // Staff may read one student profile at a time; it holds the phone's token and whether push is on
    const snap = await getDoc(doc(db, 'users', called.user_id));
    const profile = snap.exists() ? snap.data() : null;
    if (!profile?.push_token || profile.push_enabled === false) return;

    const idToken = await auth.currentUser.getIdToken();
    const response = await fetch(`${RELAY_URL}/push`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ to: profile.push_token, officeName: office?.name ?? '' }),
    });
    if (!response.ok) console.warn('The push relay refused the message', response.status);
  } catch (error) {
    console.warn('Could not send the push', error);
  }
}
