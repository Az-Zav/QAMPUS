import { db } from '@/lib/firebase';
import { useOffice } from '@/providers/OfficeProvider';
import { campusDayStart } from '@qampus/core/format';
import { EVENTS_PAGE_SIZE, loadEventsPage, watchOfficeEvents } from '@qampus/backend';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCampusDay } from './useCampusDay';

const NONE = Object.freeze({ events: [], cursor: null, hasMore: false });

// `days` null = all time, 0 = today, 1 = yesterday only, n > 1 = the last n days (campus days)
function dateBounds(days, now) {
  if (days === null) return {};
  if (days === 0) return { from: campusDayStart(now, 0) };
  if (days === 1) return { from: campusDayStart(now, 1), to: campusDayStart(now, 0) };
  return { from: campusDayStart(now, days - 1) };
}

// A stored event as the log row reads it
const toEntry = (event) => ({
  id: event.id,
  action: event.action,
  ticket_number: event.ticket_number,
  actor: event.actor_name,
  from: event.from_status,
  to: event.to_status,
  reason: event.reason,
  note: null,
  created_at: event.created_at,
});

// W05: the office's activity, newest first, 50 per page. Page 1 is live; Older loads the next 50 once,
// Newer steps back. `action` null = all actions (see dateBounds for `days`). Changing a filter returns to page 1.
export function useActivityLog({ action = null, days = 0 } = {}) {
  const { office } = useOffice();
  const officeId = office?.id ?? null;
  const dayKey = useCampusDay();
  const key = `${officeId}|${action}|${days}|${dayKey}`;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const filters = useMemo(() => ({ action, ...dateBounds(days, new Date()) }), [action, days, dayKey]);

  // Everything is tagged with the key it was loaded for, so a filter change never shows the old list
  const [live, setLive] = useState({ key: null, ...NONE });
  const [view, setView] = useState({ key: null, page: 0, pages: {} });
  const busy = useRef(false);

  useEffect(() => {
    if (!officeId) return undefined;
    return watchOfficeEvents(
      db,
      officeId,
      filters,
      (page) => setLive({ key, ...page }),
      (error) => {
        console.warn('Could not load the activity log', error);
        setLive({ key, ...NONE });
      },
    );
  }, [officeId, key, filters]);

  const current = view.key === key ? view : { key, page: 0, pages: {} };
  const page = current.page;
  const liveNow = live.key === key ? live : NONE;
  const shown = page === 0 ? liveNow : current.pages[page] ?? NONE;

  const older = useCallback(async () => {
    if (busy.current || !shown.hasMore) return;
    busy.current = true;
    try {
      const next = await loadEventsPage(db, officeId, filters, shown.cursor);
      setView({ key, page: page + 1, pages: { ...current.pages, [page + 1]: next } });
    } catch (error) {
      console.warn('Could not load the next page', error);
    } finally {
      busy.current = false;
    }
  }, [officeId, filters, key, page, shown, current.pages]);

  // Back on page 1 the cached older pages are dropped: a new event moves the page boundary
  const newer = useCallback(() => {
    if (page === 0) return;
    setView({ key, page: page - 1, pages: page === 1 ? {} : current.pages });
  }, [key, page, current.pages]);

  const entries = useMemo(() => shown.events.map(toEntry), [shown]);
  const first = page * EVENTS_PAGE_SIZE + 1;
  const rangeLabel = entries.length ? `${first}–${first + entries.length - 1}` : null;

  return { entries, page, rangeLabel, hasNewer: page > 0, hasOlder: shown.hasMore, newer, older };
}
