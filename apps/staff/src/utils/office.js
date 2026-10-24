// Campus runs on one timezone (UTC+8); "today" comes from it, not the browser clock
const CAMPUS_UTC_OFFSET_MINUTES = 8 * 60;
const DAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

// 480 -> "08:00"
const clock = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

function campusDayKey(now = new Date()) {
  const campus = new Date(now.getTime() + CAMPUS_UTC_OFFSET_MINUTES * 60000);
  return DAY_KEYS[campus.getUTCDay()];
}

// Office record -> the display fields staff screens read (hours, closes, opens).
// A day missing from `hours` means closed that day.
export function toOfficeView(office) {
  if (!office) return null;
  const today = office.hours?.[campusDayKey()];
  return {
    ...office,
    opens: today ? clock(today.open_min) : '—',
    closes: today ? clock(today.close_min) : '—',
    hours: today ? `${clock(today.open_min)}–${clock(today.close_min)}` : 'closed today',
  };
}

// Payload encoded in the office QR on the public display; the mobile scanner resolves it server-side
export function checkInPayload(office) {
  return `qampus://check-in/${office.code}/${office.check_in_code}`;
}
