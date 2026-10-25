// Office selectors: stored office records -> view objects for OfficeCard,
// InfoCard (office hours) and JoinConfirmModal.

import { QUEUE_STATUS } from '@/constants';
import { CutoffReason, estimatedWaitMinutes, nowServing, waitingCount } from '@qampus/backend';
import { formatMinutes, todayHours } from '@qampus/core';

// `queue` is today's queue doc for the office, or null/undefined when staff have not opened it
export function toOfficeView(office, queue) {
  const today = todayHours(office.hours);
  const waiting = waitingCount(queue);

  return {
    id: office.id,
    code: office.code,
    name: office.name,
    status: office.status,
    location: office.location,
    hours: today ? `${formatMinutes(today.open_min)} - ${formatMinutes(today.close_min)}` : 'Closed today',
    open: queue?.status === QUEUE_STATUS.OPEN,
    nowServing: nowServing(office, queue) ?? '—',
    waiting,
    estimatedWaitMinutes: estimatedWaitMinutes(waiting, office, queue),
  };
}

const DAY_LABEL = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' };

// Why the capacity cutoff refuses a join (from cutoffState), as the Join button's reason
export function cutoffMessage(cutoff) {
  const closes = formatMinutes(cutoff.closesAtMinute);
  const next = cutoff.nextOpen ? ` Next opens ${DAY_LABEL[cutoff.nextOpen.day]} ${formatMinutes(cutoff.nextOpen.open_min)}.` : '';
  return cutoff.reason === CutoffReason.PAST_CLOSING
    ? `This office closed at ${closes}.${next}`
    : `Not enough time left to serve one more person before the office closes at ${closes}.${next}`;
}

// Case-insensitive match on name, location or code
export function matchesOfficeQuery(office, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [office.name, office.location, office.code].some((value) => value?.toLowerCase().includes(q));
}
