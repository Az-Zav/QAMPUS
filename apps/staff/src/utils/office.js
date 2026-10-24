import { formatMinutes, todayHours } from '@qampus/core/format';

// Office record -> the display fields staff screens read (hours, closes, opens).
// A day missing from `hours` means closed that day.
export function toOfficeView(office) {
  if (!office) return null;
  const today = todayHours(office.hours);
  return {
    ...office,
    opens: today ? formatMinutes(today.open_min) : '—',
    closes: today ? formatMinutes(today.close_min) : '—',
    hours: today ? `${formatMinutes(today.open_min)}–${formatMinutes(today.close_min)}` : 'closed today',
  };
}

// Payload encoded in the office QR on the public display; the mobile scanner resolves it server-side
export function checkInPayload(office) {
  return `qampus://check-in/${office.code}/${office.check_in_code}`;
}
