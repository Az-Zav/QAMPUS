// Profile form validation (client-side hints only; the server re-validates).

const STUDENT_ID_PATTERN = /^\d{7}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// R-01: student ID is exactly 7 digits
export function isValidStudentId(value) {
  return STUDENT_ID_PATTERN.test(value.trim());
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value.trim());
}