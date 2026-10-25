// Identity ids (no Firebase here, so it runs under plain Node and is unit tested). A student ID is exactly 7
// digits (R-01); a guest ID is `G` plus six digits, no dash (R-02). Both are reserved in institutionalIds.

export const STUDENT_ID_PATTERN = /^\d{7}$/;
export const GUEST_ID_PATTERN = /^G\d{6}$/;

export const isStudentId = (value) => STUDENT_ID_PATTERN.test(String(value ?? ''));
export const isGuestId = (value) => GUEST_ID_PATTERN.test(String(value ?? ''));

// A random candidate guest ID, e.g. G104728. `random` returns a number in [0, 1) (injectable for tests).
export function randomGuestId(random = Math.random) {
  const digits = Math.min(999999, Math.floor(random() * 1000000));
  return `G${String(digits).padStart(6, '0')}`;
}
