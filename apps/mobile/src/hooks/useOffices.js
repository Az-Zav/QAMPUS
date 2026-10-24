import { RULES } from '@/constants';
import { activeBanEnd, isActiveTicket, remainingSlots } from '@qampus/backend';
import { useMemo } from 'react';
import { useQueueData } from '@/providers/QueueDataProvider';
import { formatDateTime, toOfficeView } from '@/utils';
import { useNow } from './useNow';

// All active offices as OfficeCard/InfoCard views, with today's queue state.
export function useOffices() {
  const { board, tickets, profile } = useQueueData();
  const now = useNow(60000);

  // Three active tickets across all offices is the most a student may hold (R-07)
  const atLimit = remainingSlots(tickets) === 0;
  // A ban blocks joining only (R-14); it lifts by itself when its end passes
  const banEnd = activeBanEnd(profile, new Date(now));
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
          ...(banEnd
            ? { joinDisabled: true, disabledReason: `You are banned from joining until ${formatDateTime(banEnd)}.` }
            : queuedOfficeIds.has(office.id)
              ? { joinDisabled: true, disabledReason: 'You already have an active ticket here.' }
              : atLimit
                ? { joinDisabled: true, disabledReason: `You already hold ${RULES.MAX_ACTIVE_TICKETS} active tickets.` }
                : {}),
        })),
    }),
    [board, atLimit, queuedOfficeIds, banEnd],
  );
}
