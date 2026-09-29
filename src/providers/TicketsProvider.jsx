// QAMPUS Tickets Provider
// Provides the current user's active and historical queue tickets, and queue actions.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ticketsService } from '@/services/tickets.service';
import { useAuth } from './AuthProvider';

const TicketsContext = createContext(null);

export function TicketsProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [ticketState, setTicketState] = useState(() => {
    return userId ? ticketsService.getUserTickets(userId) : { active: [], history: [] };
  });
  const [status, setStatus] = useState('ready');

  useEffect(() => {
    if (!userId) return;

    // Rule R7: Data arrives only through the service subscription
    const unsubscribe = ticketsService.subscribe(() => {
      const updated = ticketsService.getUserTickets(userId);
      setTicketState(updated);
      setStatus('ready');
    });

    return unsubscribe;
  }, [userId]);

  const actions = useMemo(
    () => ({
      joinQueue: ticketsService.joinQueue,
      cancelTicket: ticketsService.cancelTicket,
      verifyArrival: ticketsService.verifyArrival,
    }),
    []
  );

  const value = useMemo(
    () => ({
      status,
      active: ticketState.active,
      history: ticketState.history,
      actions,
    }),
    [status, ticketState.active, ticketState.history, actions]
  );

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

export function useTickets() {
  const context = useContext(TicketsContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketsProvider');
  }
  return context;
}
