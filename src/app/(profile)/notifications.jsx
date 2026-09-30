import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';

import { BOTTOM_NAV_CLEARANCE } from '@/components/shell/BottomNav';
import CountBadge from '@/components/shell/CountBadge';
import EmptyState from '@/components/shell/EmptyState';
import ListRow from '@/components/shell/ListRow';
import SectionLabel from '@/components/shell/SectionLabel';
import SubHeader from '@/components/shell/SubHeader';
import CalledModal from '@/components/tickets/CalledModal';

import {
  COLORS, EmptyStateType, ListRowTone, ListRowType, NOTIFICATION_TYPE, NOTIFICATIONS_COPY, SPACING, TicketStatus,
} from '@/constants';
import { usePreview } from '@/dev/previews'; // DEV-PREVIEW
import { useMyTickets, useNotifications, useNow } from '@/hooks';
import { daysBetween, formatRelative } from '@/utils';

// S12 Notifications (UIUX §4.10, §5.6).

const TYPE_STYLE = {
  [NOTIFICATION_TYPE.QUEUE_CONFIRMED]: { icon: 'ticket-outline', tone: ListRowTone.HIGHLIGHT },
  [NOTIFICATION_TYPE.YOUR_TURN]: { icon: 'notifications-outline', tone: ListRowTone.HIGHLIGHT },
  [NOTIFICATION_TYPE.APPROACHING_TURN]: { icon: 'timer-outline', tone: ListRowTone.HIGHLIGHT },
  [NOTIFICATION_TYPE.NO_SHOW]: { icon: 'person-remove-outline', tone: ListRowTone.ERROR },
  [NOTIFICATION_TYPE.QUEUE_CANCELLED]: { icon: 'close-circle-outline', tone: ListRowTone.NEUTRAL },
  [NOTIFICATION_TYPE.SERVICE_COMPLETED]: { icon: 'checkmark-circle-outline', tone: ListRowTone.SUCCESS },
  [NOTIFICATION_TYPE.WARNING]: { icon: 'warning-outline', tone: ListRowTone.ERROR },
  [NOTIFICATION_TYPE.GLOBAL_ANNOUNCEMENT]: { icon: 'megaphone-outline', tone: ListRowTone.NEUTRAL },
  [NOTIFICATION_TYPE.OFFENSE_REVOKED]: { icon: 'shield-checkmark-outline', tone: ListRowTone.SUCCESS },
};

// Types that point at the penalty record (UIUX §5.6)
const OPENS_BANS = new Set([NOTIFICATION_TYPE.WARNING, NOTIFICATION_TYPE.NO_SHOW]);

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications: liveNotifications } = useNotifications();
  const { active } = useMyTickets();
  const now = useNow(60000);

  const preview = usePreview('notifications'); // DEV-PREVIEW
  const notifications = preview.data?.notifications ?? liveNotifications; // DEV-PREVIEW
  // Read state is local until the notifications hook can mark items read
  const [readIds, setReadIds] = useState(() => new Set());
  const [calledTicketId, setCalledTicketId] = useState(null);

  const items = useMemo(
    () => notifications.map((n) => ({ ...n, is_read: n.is_read || readIds.has(n.id) })),
    [notifications, readIds],
  );
  const unread = items.filter((n) => !n.is_read).length;

  const sections = useMemo(
    () => [
      { title: NOTIFICATIONS_COPY.recent, data: items.filter((n) => daysBetween(n.created_at, now) === 0) },
      { title: NOTIFICATIONS_COPY.previous, data: items.filter((n) => daysBetween(n.created_at, now) > 0) },
    ].filter((s) => s.data.length),
    [items, now],
  );

  // Live lookup so the countdown keeps ticking; null once the ticket is no longer called
  const calledTicket = active.find((t) => t.id === calledTicketId && t.status === TicketStatus.YOUR_TURN) ?? null;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  const onPressItem = (notification) => {
    setReadIds((ids) => new Set(ids).add(notification.id));

    if (notification.type === NOTIFICATION_TYPE.YOUR_TURN) {
      // Opens M05 only while the ticket is still CALLED; otherwise it's just marked read
      const called = active.find((t) => t.status === TicketStatus.YOUR_TURN);
      if (called) setCalledTicketId(called.id);
    } else if (OPENS_BANS.has(notification.type)) {
      router.push('/bans');
    }
  };

  const openScanner = () => {
    setCalledTicketId(null);
    router.push('/scan');
  };

  return (
    <View style={styles.screen}>
      <SubHeader title="Notifications" onBack={goBack} />

      <SectionList
        sections={sections}
        keyExtractor={(n) => n.id}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={(
          <View style={styles.header}>
            {preview.bar /* DEV-PREVIEW */}
            {unread > 0 && <CountBadge label={NOTIFICATIONS_COPY.newCount(unread)} />}
          </View>
        )}
        ListEmptyComponent={<EmptyState type={EmptyStateType.NO_NOTIFICATIONS} />}
        renderSectionHeader={({ section }) => <SectionLabel text={section.title} style={styles.sectionLabel} />}
        renderItem={({ item }) => {
          const { icon, tone } = TYPE_STYLE[item.type] ?? TYPE_STYLE[NOTIFICATION_TYPE.GLOBAL_ANNOUNCEMENT];
          return (
            <ListRow
              type={ListRowType.NOTIFICATION}
              icon={icon}
              tone={tone}
              title={item.title}
              subtitle={item.message}
              meta={formatRelative(item.created_at, now)}
              unread={!item.is_read}
              onPress={() => onPressItem(item)}
            />
          );
        }}
      />

      <CalledModal
        visible={!!calledTicket}
        ticket={calledTicket}
        onClose={() => setCalledTicketId(null)}
        onOpenScanner={openScanner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.paper },
  content: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
  },
  header: { gap: SPACING.md, marginBottom: SPACING.xs },
  sectionLabel: { marginTop: SPACING.md, paddingHorizontal: 0 },
});
