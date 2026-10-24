import { useMemo } from 'react';
import { useQueueData } from '@/providers/QueueDataProvider';
import { toOfficeView } from '@/utils';

// All active offices as OfficeCard/InfoCard views, with today's queue state.
export function useOffices() {
  const { board } = useQueueData();

  return useMemo(
    () => ({
      offices: board.offices
        .filter((office) => office.status !== 'INACTIVE')
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((office) => toOfficeView(office, board.queues[office.id])),
    }),
    [board],
  );
}
