import { useQueueStore } from '@/providers/QueueProvider';
import { useMemo } from 'react';

// W04: the office's offenses, newest first, filtered by holder name, student ID / Guest ID or ticket number
export function useOffenses(search = '') {
  const { offenses, revokeOffense } = useQueueStore();

  const results = useMemo(() => {
    const term = search.trim().toLowerCase();
    const sorted = [...offenses].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (!term) return sorted;
    return sorted.filter(({ holder, ticket_number }) =>
      [holder.name, holder.id_number, ticket_number].some((field) => field.toLowerCase().includes(term)),
    );
  }, [offenses, search]);

  return { offenses: results, total: offenses.length, revokeOffense };
}
