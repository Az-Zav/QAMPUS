import { MOCK_OFFICES } from '@qampus/core/mock';
import { useMemo } from 'react';
import { useSession } from '@/providers/SessionProvider';
import { toOfficeView } from '@/utils/office';

// The office the signed-in staff member is assigned to (null when unassigned).
// Backend swap: subscribe to the office document for user.office_id; keep the return shape.
export function useStaffOffice() {
  const { user } = useSession();
  return useMemo(
    () => ({ office: toOfficeView(MOCK_OFFICES.find((office) => office.id === user?.office_id)) }),
    [user?.office_id],
  );
}

// Public display (D01) looks the office up by its code, with no session
export function useOfficeByCode(code) {
  return useMemo(
    () => toOfficeView(MOCK_OFFICES.find((office) => office.code.toLowerCase() === String(code).toLowerCase())),
    [code],
  );
}
