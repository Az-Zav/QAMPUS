// The signed-in staff member's office: one Firestore listener shared by every screen.
// `office` is null while loading, for unassigned users, and when the doc is missing or unreadable.

import { db } from '@/lib/firebase';
import { useSession } from '@/providers/SessionProvider';
import { toOfficeView } from '@/utils/office';
import { doc, onSnapshot } from 'firebase/firestore';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const OfficeContext = createContext(null);

export function OfficeProvider({ children }) {
  const { user } = useSession();
  const officeId = user?.office_id;
  // Tagged with the id it was loaded for, so a stale office is never shown after the user changes
  const [state, setState] = useState({ id: null, record: null });

  useEffect(() => {
    if (!officeId) return undefined;
    return onSnapshot(
      doc(db, 'offices', officeId),
      (snap) => setState({ id: officeId, record: snap.exists() ? { id: snap.id, ...snap.data() } : null }),
      (error) => {
        console.warn('Could not load office', error);
        setState({ id: officeId, record: null });
      },
    );
  }, [officeId]);

  const loading = !!officeId && state.id !== officeId;
  const record = state.id === officeId ? state.record : null;
  const value = useMemo(() => ({ office: toOfficeView(record), loading }), [record, loading]);

  return <OfficeContext.Provider value={value}>{children}</OfficeContext.Provider>;
}

export function useOffice() {
  const context = useContext(OfficeContext);
  if (!context) throw new Error('useOffice must be used within an OfficeProvider');
  return context;
}
