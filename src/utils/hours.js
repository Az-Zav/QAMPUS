// QAMPUS Hours Utilities
// Authoritative pure calculations for office operating hours, closing times, and schedules.

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/**
 * Converts a 24-hour time string ('08:00', '17:00') into 12-hour format ('8:00 AM', '5:00 PM').
 *
 * @param {string} timeStr - Time string in 'HH:mm' or 'HH:mm:ss'
 * @returns {string} Formatted 12-hour time
 */
export function formatTime12(timeStr) {
  if (!timeStr) return '';
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr, 10);
  const m = mStr ? mStr.padStart(2, '0') : '00';
  if (isNaN(h)) return timeStr;

  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m} ${ampm}`;
}

/**
 * Calculates current operating status, closing countdown, and schedule label for an office.
 *
 * @param {import('@/types').Office} office - Office entity containing hours
 * @param {Date|string|number} now - The reference current timestamp
 * @returns {import('@/types').OfficeHoursSummary} Office hours summary object
 */
export function officeHours(office, now) {
  const fallback = {
    isOpen: false,
    label: 'Hours unavailable',
    minutesUntilClose: 0,
    nextOpen: null,
  };

  if (!office || !office.hours) {
    return fallback;
  }

  const nowDate = now instanceof Date ? now : (now ? new Date(now) : new Date());
  const dayIndex = nowDate.getDay();
  const currentDayKey = DAYS[dayIndex];
  const todaySchedule = office.hours[currentDayKey];

  const nowMinutes = nowDate.getHours() * 60 + nowDate.getMinutes();

  // Helper to find the next open day and time
  const findNextOpening = () => {
    for (let offset = 1; offset <= 7; offset++) {
      const nextIndex = (dayIndex + offset) % 7;
      const nextDayKey = DAYS[nextIndex];
      const nextSchedule = office.hours[nextDayKey];
      if (nextSchedule && nextSchedule.open) {
        const dayLabel = offset === 1 ? 'tomorrow' : `on ${DAY_NAMES[nextIndex]}`;
        const timeLabel = formatTime12(nextSchedule.open);
        return {
          formatted: `${offset === 1 ? 'Tomorrow' : DAY_NAMES[nextIndex]} at ${timeLabel}`,
          label: `Opens ${dayLabel} at ${timeLabel}`,
        };
      }
    }
    return null;
  };

  // Case 1: Office has hours for today
  if (todaySchedule && todaySchedule.open && todaySchedule.close) {
    const [openH, openM] = todaySchedule.open.split(':').map(Number);
    const [closeH, closeM] = todaySchedule.close.split(':').map(Number);
    const openMinutes = openH * 60 + (openM || 0);
    const closeMinutes = closeH * 60 + (closeM || 0);

    // Before opening today
    if (nowMinutes < openMinutes) {
      const openTimeFormatted = formatTime12(todaySchedule.open);
      return {
        isOpen: false,
        label: `Opens today at ${openTimeFormatted}`,
        minutesUntilClose: 0,
        nextOpen: `Today at ${openTimeFormatted}`,
      };
    }

    // Currently open
    if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
      const minutesUntilClose = Math.max(0, closeMinutes - nowMinutes);
      return {
        isOpen: true,
        label: `Closes ${formatTime12(todaySchedule.close)}`,
        minutesUntilClose,
        nextOpen: null,
      };
    }

    // After closing today
    const next = findNextOpening();
    return {
      isOpen: false,
      label: next ? next.label : 'Closed for the day',
      minutesUntilClose: 0,
      nextOpen: next ? next.formatted : null,
    };
  }

  // Case 2: Office is closed today
  const next = findNextOpening();
  return {
    isOpen: false,
    label: next ? next.label : 'Closed',
    minutesUntilClose: 0,
    nextOpen: next ? next.formatted : null,
  };
}
