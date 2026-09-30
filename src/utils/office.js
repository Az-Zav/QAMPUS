// Office selectors: stored office records -> view objects for OfficeCard,
// InfoCard (office hours) and JoinConfirmModal.

import { QUEUE_STATUS } from '@/constants';
import { formatClock } from './format';

export function toOfficeView(office) {
  const queue = office.queue ?? {};

  return {
    id: office.id,
    code: office.code,
    name: office.name,
    location: office.location,
    hours: `${formatClock(office.operating_hours.open_time)} - ${formatClock(office.operating_hours.close_time)}`,
    open: queue.status === QUEUE_STATUS.OPEN,
    nowServing: queue.current_ticket_number ?? '—',
    waiting: queue.waiting_count ?? 0,
    estimatedWaitMinutes: queue.estimated_wait_minutes ?? 0,
  };
}

// Case-insensitive match on name, location or code
export function matchesOfficeQuery(office, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [office.name, office.location, office.code].some((value) => value?.toLowerCase().includes(q));
}
