import { MOCK_PROGRAMS } from '@/data/mock';
import { useMemo } from 'react';

// Academic programs for the searchable picker (S05, S14).
// Source is an open PRD question; backend swap: replace MOCK_PROGRAMS with a Firestore read.
export function usePrograms() {
  return useMemo(() => ({ programs: MOCK_PROGRAMS }), []);
}