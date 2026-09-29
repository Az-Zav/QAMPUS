// QAMPUS useNow Hook
// The single clock source for screens that need the current time.
// Refreshes about once a minute. Rule R9: only hooks read the clock.

import { useEffect, useRef, useState } from 'react';

const REFRESH_INTERVAL_MS = 60_000;

/**
 * Returns the current Date, refreshing approximately once a minute.
 *
 * @returns {Date} now
 */
export function useNow() {
  const [now, setNow] = useState(() => new Date());
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNow(new Date());
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, []);

  return now;
}
