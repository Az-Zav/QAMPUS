// The check-in QR (R-20): what the public display encodes and what the student app reads back. Pure, no Firebase,
// unit tested. One place for the format, so the two sides cannot drift apart.

// Payload for an office's QR: qampus://check-in/{office code}/{6-digit check-in code}
export const checkInPayload = (office) => `qampus://check-in/${office.code}/${office.check_in_code}`;

const PAYLOAD = /^qampus:\/\/check-in\/([A-Za-z0-9]+)\/(\d{6})$/;

// The office code (capitals) and the 6 digits inside a scanned QR, or null when it is not one of ours
export function parseCheckInPayload(data) {
  const match = PAYLOAD.exec(String(data ?? '').trim());
  return match ? { officeCode: match[1].toUpperCase(), code: match[2] } : null;
}
