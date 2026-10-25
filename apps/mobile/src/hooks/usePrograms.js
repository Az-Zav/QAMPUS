import { COLLEGES, PROGRAMS } from '@qampus/core/programs';

// The programs a student can choose from: `programs` is the flat list the pickers show, `colleges` the same grouped.
// Static data (it changes with the school's catalogue, in packages/core/src/programs.js), so one shared value.
const CATALOGUE = Object.freeze({ programs: PROGRAMS, colleges: COLLEGES });

export function usePrograms() {
  return CATALOGUE;
}
