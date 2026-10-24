import { campusDate } from '@qampus/core/format';
import { useEffect, useState } from 'react';

// The campus day key (yyyymmdd), re-read every minute so listeners restart when the day rolls over
export function useCampusDay() {
  const [dayKey, setDayKey] = useState(() => campusDate().key);
  useEffect(() => {
    const id = setInterval(() => setDayKey(campusDate().key), 60000);
    return () => clearInterval(id);
  }, []);
  return dayKey;
}
