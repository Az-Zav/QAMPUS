// QAMPUS Time Utilities
// Pure date and time formatting helpers for history groupings, relative timestamps, and wait durations.

import { HistoryGroup } from '@/constants';
import { formatTime12 } from './hours';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Checks if two Date instances fall on the same calendar day.
 */
function isSameDay(d1, d2) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

/**
 * Checks if target date falls on the day immediately preceding reference date.
 */
function isYesterday(target, reference) {
  const yesterday = new Date(reference);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(target, yesterday);
}

/**
 * Groups an ISO date string into TODAY, YESTERDAY, or EARLIER.
 *
 * @param {string|Date} iso - The target timestamp to group
 * @param {Date|string|number} now - The reference current timestamp
 * @returns {import('@/constants').HistoryGroup[keyof import('@/constants').HistoryGroup]} Group key
 */
export function historyGroup(iso, now) {
  if (!iso) return HistoryGroup.EARLIER;

  const targetDate = iso instanceof Date ? iso : new Date(iso);
  const nowDate = now instanceof Date ? now : (now ? new Date(now) : new Date());

  if (isNaN(targetDate.getTime()) || isNaN(nowDate.getTime())) {
    return HistoryGroup.EARLIER;
  }

  if (isSameDay(targetDate, nowDate)) {
    return HistoryGroup.TODAY;
  }

  if (isYesterday(targetDate, nowDate)) {
    return HistoryGroup.YESTERDAY;
  }

  return HistoryGroup.EARLIER;
}

/**
 * Formats a timestamp into a contextual human-readable string.
 * E.g. 'Today, 2:30 PM', 'Yesterday, 10:15 AM', 'Sep 28, 4:00 PM'.
 *
 * @param {string|Date} iso - Timestamp to format
 * @param {Date|string|number} now - The reference current timestamp
 * @returns {string} Formatted contextual date/time
 */
export function formatWhen(iso, now) {
  if (!iso) return '';

  const targetDate = iso instanceof Date ? iso : new Date(iso);
  const nowDate = now instanceof Date ? now : (now ? new Date(now) : new Date());

  if (isNaN(targetDate.getTime())) return '';

  const timeString = formatTime12(
    `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}`
  );

  const group = historyGroup(targetDate, nowDate);

  if (group === HistoryGroup.TODAY) {
    return `Today, ${timeString}`;
  }

  if (group === HistoryGroup.YESTERDAY) {
    return `Yesterday, ${timeString}`;
  }

  const month = MONTH_NAMES[targetDate.getMonth()];
  const day = targetDate.getDate();
  return `${month} ${day}, ${timeString}`;
}

/**
 * Calculates a concise relative time string (e.g. 'Just now', '5m ago', '2h ago', '3d ago').
 *
 * @param {string|Date} iso - Target timestamp
 * @param {Date|string|number} now - Current timestamp
 * @returns {string} Relative time string
 */
export function timeAgo(iso, now) {
  if (!iso) return '';

  const targetDate = iso instanceof Date ? iso : new Date(iso);
  const nowDate = now instanceof Date ? now : (now ? new Date(now) : new Date());

  const diffMs = nowDate.getTime() - targetDate.getTime();
  if (isNaN(diffMs)) return '';

  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 60) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }

  const month = MONTH_NAMES[targetDate.getMonth()];
  return `${month} ${targetDate.getDate()}`;
}

/**
 * Calculates the total elapsed wait duration for a ticket in minutes.
 * E.g. '12 mins', '1 min', '< 1 min'.
 *
 * @param {import('@/types').Ticket} ticket - Ticket entity
 * @returns {string|null} Formatted wait duration
 */
export function waitedMinutes(ticket) {
  if (!ticket || !ticket.joinedAt) return null;

  const joinTime = new Date(ticket.joinedAt).getTime();
  if (isNaN(joinTime)) return null;

  // Use the earliest terminal or service milestone timestamp
  const endIso =
    ticket.serviceStartedAt ||
    ticket.calledAt ||
    ticket.completedAt ||
    ticket.cancelledAt ||
    ticket.noShowAt;

  if (!endIso) return null;

  const endTime = new Date(endIso).getTime();
  if (isNaN(endTime)) return null;

  const elapsedMs = Math.max(0, endTime - joinTime);
  const totalMinutes = Math.round(elapsedMs / 60000);

  if (totalMinutes < 1) {
    return '< 1 min';
  }

  return totalMinutes === 1 ? '1 min' : `${totalMinutes} mins`;
}
