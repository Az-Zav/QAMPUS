import { RULES } from '@/constants';
import { isActiveTicket, remainingSlots } from '@qampus/backend';
import { useMemo } from 'react';
import { useQueueData } from '@/providers/QueueDataProvider';
import { toOfficeView } from '@/utils';

// All active offices as OfficeCard/InfoCard views, with today's queue state.
export function useOffices() {
  const { board, tickets } = useQueueData();

  // Three active tickets across all offices is the most a student may hold (R-07)
  const atLimit = remainingSlots(tickets) === 0;
  // One active ticket per office at a time
  const queuedOfficeIds = useMemo(
    () => new Set(tickets.filter(isActiveTicket).map((ticket) => ticket.office_id)),
    [tickets],
  );

  return useMemo(
    () => ({
      offices: board.offices
        .filter((office) => office.status !== 'INACTIVE')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((office) => ({
          ...toOfficeView(office, board.queues[office.id]),
          ...(queuedOfficeIds.has(office.id)
            ? { joinDisabled: true, disabledReason: 'You already have an active ticket here.' }
            : atLimit
              ? { joinDisabled: true, disabledReason: `You already hold ${RULES.MAX_ACTIVE_TICKETS} active tickets.` }
              : {}),
        })),
    }),
    [board, atLimit, queuedOfficeIds],
  );
}
