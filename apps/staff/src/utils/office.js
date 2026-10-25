import { formatMinutes, todayHours } from '@qampus/core/format';

// Office record -> the display fields staff screens read (hours, closes, opens).
// A day missing from `hours` means closed that day.
export function toOfficeView(office) {
  if (!office) return null;
  const today = todayHours(office.hours);
  return {
    ...office,
    hoursByDay: office.hours, // the stored per-day map; `hours` below is its text for today
    opens: today ? formatMinutes(today.open_min) : '—',
    closes: today ? formatMinutes(today.close_min) : '—',
    hours: today ? `${formatMinutes(today.open_min)}–${formatMinutes(today.close_min)}` : 'closed today',
  };
}

// Payload encoded in the office QR on the public display; the student app reads it back with the same module
export { checkInPayload } from '@qampus/backend';
