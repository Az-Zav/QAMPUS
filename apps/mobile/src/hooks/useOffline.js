import { useQueueData } from '@/providers/QueueDataProvider';

// True while the app cannot reach Firestore, so tickets and queues on screen may be out of date (BUG-021)
export function useOffline() {
  return useQueueData().offline;
}
