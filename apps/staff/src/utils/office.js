import { formatClock } from '@qampus/core/format';

// Office record -> the display fields staff screens read (hours, closes, opens)
export function toOfficeView(office) {
  if (!office) return null;
  const { open_time, close_time } = office.operating_hours;
  return {
    ...office,
    opens: formatClock(open_time),
    closes: formatClock(close_time),
    hours: `${formatClock(open_time)}–${formatClock(close_time)}`,
  };
}

// Payload encoded in the office QR on the public display; the mobile scanner resolves it server-side
export function checkInPayload(office) {
  return `qampus://check-in/${office.code}/${office.manual_code}`;
}
