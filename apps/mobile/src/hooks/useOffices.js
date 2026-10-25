import { RULES } from '@/constants';
import { activeBanEnd, cutoffState, isActiveTicket, remainingSlots } from '@qampus/backend';
import { useMemo } from 'react';
import { useQueueData } from '@/providers/QueueDataProvider';
import { cutoffMessage, formatDateTime, toOfficeView } from '@/utils';
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
        .map((office) => {
          const queue = board.queues[office.id];
          // The capacity cutoff only matters while the queue is open (a closed queue already says so)
          const cutoff = cutoffState({ office, queue, now: new Date(now) });
          return {
            ...toOfficeView(office, queue),
            ...(banEnd
              ? { joinDisabled: true, disabledReason: `You are banned from joining until ${formatDateTime(banEnd)}.` }
              : queuedOfficeIds.has(office.id)
                ? { joinDisabled: true, disabledReason: 'You already have an active ticket here.' }
                : atLimit
                  ? { joinDisabled: true, disabledReason: `You already hold ${RULES.MAX_ACTIVE_TICKETS} active tickets.` }
                  : queue?.status === 'OPEN' && !cutoff.canJoin
                    ? { joinDisabled: true, disabledReason: cutoffMessage(cutoff) }
                    : {}),
          };
        }),
    }),
    [board, atLimit, queuedOfficeIds, banEnd, now],
  );
}
