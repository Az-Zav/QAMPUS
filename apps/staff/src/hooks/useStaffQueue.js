import { QUEUE_STATUS, TICKET_STATUS } from '@qampus/core/domain';
import { getRemainingSeconds } from '@qampus/core/ticket';
import { useQueueStore } from '@/providers/QueueProvider';
import { useNow } from './useNow';

export const PanelState = Object.freeze({
  EMPTY: 'empty',
  CALLED: 'called',
  EXPIRED: 'expired',
  IN_SERVICE: 'inService',
});

// The cutoff banner (R-24) shows inside this window
const CUTOFF_WARNING_MINUTES = 30;

// W03 view of the live queue: the current ticket's panel state and countdown, joining state, actions.
export function useStaffQueue() {
  const store = useQueueStore();
  const { queue } = store;
  const now = useNow(1000);

  const current = queue.current;
  const remainingSeconds = current?.status === TICKET_STATUS.CALLED ? getRemainingSeconds(current.called_at, now) : 0;
  const panelState = !current
    ? PanelState.EMPTY
    : current.status === TICKET_STATUS.IN_SERVICE
      ? PanelState.IN_SERVICE
      : remainingSeconds > 0
        ? PanelState.CALLED
        : PanelState.EXPIRED;

  const isOpen = queue.status === QUEUE_STATUS.OPEN;
  const minutesToCutoff = Math.ceil((new Date(queue.cutoff_at).getTime() - now) / 60000);
  const cutoffReached = isOpen && !queue.cutoff_overridden && minutesToCutoff <= 0;

  return {
    ...store,
    isOpen,
    current,
    waiting: queue.waiting,
    panelState,
    remainingSeconds,
    averageServiceMinutes: queue.average_service_minutes,
    joiningOpen: isOpen && !cutoffReached,
    cutoffReached,
    cutoffWarningMinutes:
      isOpen && !queue.cutoff_overridden && minutesToCutoff > 0 && minutesToCutoff <= CUTOFF_WARNING_MINUTES
        ? minutesToCutoff
        : null,
    canCallNext: isOpen && !current && queue.waiting.length > 0,
    canOverride: isOpen && !current,
  };
}
