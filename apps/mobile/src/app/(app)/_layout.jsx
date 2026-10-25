import CalledModal from '@/components/modals/CalledModal';
import BottomNav from '@/components/shell/BottomNav';
import NotificationToast from '@/components/shell/NotificationToast';
import { AppTab, TicketStatus } from '@/constants';
import { useBiometric } from '@/providers/BiometricProvider';
import { useMyTickets, useNotificationToast, useTheme, useThemedStyles } from '@/hooks';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

const TAB_PATHS = { '/home': AppTab.HOME, '/scan': AppTab.SCAN, '/queue': AppTab.QUEUE };

// Signed-in shell: one BottomNav over a stack of the tabs and the header-level pages
// (Profile, Notifications and their sub-pages). Pages slide in beneath the bar, which
// never moves; on those pages no tab is active — Figma Nav/Bottom "Active=None".
export default function AppLayout() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const pathname = usePathname();
  const { active } = useMyTickets();
  // Nothing from behind the biometric lock may pop up over it
  const { locked } = useBiometric();

  // "It's your turn": shown on any screen while a ticket is being called, until the student dismisses
  // it or opens the scanner. A ticket is only announced once; it is not shown on the scanner itself.
  const [dismissedIds, setDismissedIds] = useState(() => new Set());
  const calledTicket =
    pathname === '/scan' || locked
      ? null
      : (active.find((t) => t.status === TicketStatus.YOUR_TURN && !dismissedIds.has(t.id)) ?? null);
  const dismiss = (id) => setDismissedIds((prev) => new Set(prev).add(id));

  // A subtle banner from the top for a new notification while the app is open (not on the Notifications screen)
  const { toast, dismiss: dismissToast } = useNotificationToast({ muted: pathname === '/notifications' });

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.paper },
        }}
      />
      <BottomNav active={TAB_PATHS[pathname]} onNavigate={(tab) => router.navigate(`/${tab}`)} />
      <NotificationToast
        notification={locked ? null : toast}
        onPress={() => {
          dismissToast();
          router.navigate('/notifications');
        }}
      />
      <CalledModal
        visible={!!calledTicket}
        ticket={calledTicket}
        onClose={() => calledTicket && dismiss(calledTicket.id)}
        onOpenScanner={() => {
          if (calledTicket) dismiss(calledTicket.id);
          router.navigate('/scan');
        }}
      />
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.paper },
});
