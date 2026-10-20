import { MOCK_OFFICES } from '@qampus/core/mock';
import { useMemo } from 'react';
import { useSession } from '@/providers/SessionProvider';

// The office the signed-in staff member is assigned to (null when unassigned).
// Backend swap: subscribe to the office document for user.office_id; keep the return shape.
export function useStaffOffice() {
  const { user } = useSession();
  return useMemo(
    () => ({ office: MOCK_OFFICES.find((office) => office.id === user?.office_id) ?? null }),
    [user?.office_id],
  );
}
