import { MOCK_OFFICES } from '@qampus/core/mock';
import { useOffice } from '@/providers/OfficeProvider';
import { toOfficeView } from '@/utils/office';
import { useMemo } from 'react';

// The office the signed-in staff member is assigned to: { office, loading }.
export function useStaffOffice() {
  return useOffice();
}

// Public display (D01) looks the office up by its code, with no session
export function useOfficeByCode(code) {
  return useMemo(
    () => toOfficeView(MOCK_OFFICES.find((office) => office.code.toLowerCase() === String(code).toLowerCase())),
    [code],
  );
}
