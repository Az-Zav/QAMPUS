// Document ids and ticket numbers. Pure: no Firebase. The day in an id is the campus day (UTC+8).

import { campusDate } from '@qampus/core/format';

const pad2 = (n) => String(n).padStart(2, '0');

// 3 -> "003"
export const formatSeq = (seq) => String(seq).padStart(3, '0');

// queues/{officeId}_{yyyymmdd}
export const queueIdFor = (officeId, now = new Date()) => `${officeId}_${campusDate(now).key}`;

// tickets/{queueId}_{seq}; create-only, so a sequence number can never repeat
export const ticketIdFor = (queueId, seq) => `${queueId}_${seq}`;

// "R-10-24-003"
export function ticketNumberFor(officeCode, now, seq) {
  const { month, day } = campusDate(now);
  return `${officeCode}-${pad2(month)}-${pad2(day)}-${formatSeq(seq)}`;
}

// "R-003", the number on the student's Home ticket and the staff panel
export const shortTicketNumber = (officeCode, seq) => `${officeCode}-${formatSeq(seq)}`;
