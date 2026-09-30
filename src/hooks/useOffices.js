import { MOCK_OFFICES } from '@/data/mock';
import { toOfficeView } from '@/utils';
import { useMemo } from 'react';

// All offices as OfficeCard/InfoCard views.
// Backend swap: replace MOCK_OFFICES with a Firestore `offices` subscription; keep the return shape.
export function useOffices() {
  return useMemo(() => ({ offices: MOCK_OFFICES.map(toOfficeView) }), []);
}
