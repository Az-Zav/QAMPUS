import { db } from '@/lib/firebase';
import { useOffice } from '@/providers/OfficeProvider';
import { toOfficeView } from '@/utils/office';
import { watchOfficeByCode } from '@qampus/backend';
import { useEffect, useMemo, useState } from 'react';
import { PublicSession, usePublicSession } from './usePublicSession';

// The office the signed-in staff member is assigned to: { office, loading }.
export function useStaffOffice() {
  return useOffice();
}

export const OfficeLookup = Object.freeze({ LOADING: 'loading', READY: 'ready', ERROR: 'error' });

// Public display (D01) looks the office up by its code, with no staff session: { office, status }.
// `office` is null when the code matches no office (status READY).
export function useOfficeByCode(code) {
  const session = usePublicSession();
  // Tagged with the code it was loaded for, so a changed link never shows the old office
  const [state, setState] = useState({ code: null, record: null, error: false });

  useEffect(() => {
    if (session !== PublicSession.READY) return undefined;
    return watchOfficeByCode(
      db,
      code,
      (record) => setState({ code, record, error: false }),
      (error) => {
        console.warn('Could not load the office', error);
        setState({ code, record: null, error: true });
      },
    );
  }, [session, code]);

  const record = state.code === code ? state.record : null;
  const office = useMemo(() => toOfficeView(record), [record]);
  const status =
    session === PublicSession.ERROR || (state.code === code && state.error)
      ? OfficeLookup.ERROR
      : session === PublicSession.READY && state.code === code
        ? OfficeLookup.READY
        : OfficeLookup.LOADING;
  return { office, status };
}
