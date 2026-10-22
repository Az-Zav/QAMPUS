import { QUEUE_STATUS } from '@qampus/core/domain';
import { useQueueStore } from '@/providers/QueueProvider';

const NEXT_COUNT = 3;

// D01: what the public display shows for an office — now serving and the next three, CODE-SEQ only
// (no names or personal data on a public screen). Offices other than the live mock queue fall back
// to their summary record. Backend swap: poll the public queue endpoint for office.code.
export function useDisplayQueue(office) {
  const { queue } = useQueueStore();
  if (!office) return null;

  if (office.id === queue.office_id) {
    return {
      isOpen: queue.status === QUEUE_STATUS.OPEN,
      nowServing: queue.current?.short_ticket_number ?? null,
      next: queue.waiting.slice(0, NEXT_COUNT).map((ticket) => ticket.short_ticket_number),
    };
  }

  return {
    isOpen: office.queue.status === QUEUE_STATUS.OPEN,
    nowServing: office.queue.current_ticket_number,
    next: [],
  };
}
