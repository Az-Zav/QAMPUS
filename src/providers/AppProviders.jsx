// QAMPUS App Providers Bundle
// Bundles the five authenticated data providers (Settings, Offices, Tickets, Bans, Notifications).
// Mounted exclusively when user is authenticated; unmounts on sign-out to clear account state.

import React from 'react';
import { BansProvider } from './BansProvider';
import { NotificationsProvider } from './NotificationsProvider';
import { OfficesProvider } from './OfficesProvider';
import { SettingsProvider } from './SettingsProvider';
import { TicketsProvider } from './TicketsProvider';

export function AppProviders({ children }) {
  return (
    <SettingsProvider>
      <OfficesProvider>
        <TicketsProvider>
          <BansProvider>
            <NotificationsProvider>{children}</NotificationsProvider>
          </BansProvider>
        </TicketsProvider>
      </OfficesProvider>
    </SettingsProvider>
  );
}

export default AppProviders;
