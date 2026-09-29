// QAMPUS Offices Provider
// Provides the catalog of campus service offices and live queue wait metrics.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { officesService } from '@/services/offices.service';

const OfficesContext = createContext(null);

export function OfficesProvider({ children }) {
  const [offices, setOffices] = useState(() => officesService.getState().offices);
  const [status, setStatus] = useState('ready');

  useEffect(() => {
    const unsubscribe = officesService.subscribe((state) => {
      setOffices(state.offices);
      setStatus('ready');
    });

    return unsubscribe;
  }, []);

  const actions = useMemo(() => ({}), []);

  const value = useMemo(
    () => ({
      status,
      offices,
      actions,
    }),
    [status, offices, actions]
  );

  return <OfficesContext.Provider value={value}>{children}</OfficesContext.Provider>;
}

export function useOffices() {
  const context = useContext(OfficesContext);
  if (!context) {
    throw new Error('useOffices must be used within an OfficesProvider');
  }
  return context;
}
