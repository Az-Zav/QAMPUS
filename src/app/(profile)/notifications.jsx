import Button from '@/components/primitives/Button';
import EmptyState from '@/components/shell/EmptyState';
import Header from '@/components/shell/Header';
import ListRow from '@/components/shell/ListRow';
import { ButtonType, COLORS, ListRowType, NOTIFICATION_STYLE, SPACING } from '@/constants';
import { useNow } from '@/hooks/useNow';
import { useNotifications } from '@/providers/NotificationsProvider';
import { formatRelativeTime } from '@/utils/time';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, actions } = useNotifications();
  const now = useNow();

  const handleNotificationPress = async (notif) => {
    if (!notif.read) {
      await actions.markAsRead(notif.id);
    }
    if (notif.route) {
      router.push(notif.route);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="NOTIFICATIONS" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {unreadCount > 0 && (
          <View style={styles.actionRow}>
            <Button
              label="Mark All as Read"
              type={ButtonType.SECONDARY}
              size="sm"
              onPress={() => actions.markAllAsRead()}
            />
          </View>
        )}

        {notifications.length === 0 ? (
          <EmptyState type="notifications" />
        ) : (
          <View style={styles.list}>
            {notifications.map((notif) => {
              const styleConfig = NOTIFICATION_STYLE[notif.type] || { icon: 'notifications-outline', tone: 'highlight' };
              return (
                <ListRow
                  key={notif.id}
                  type={ListRowType.NOTIFICATION}
                  title={notif.title}
                  subtitle={notif.message}
                  meta={formatRelativeTime(notif.createdAt, now)}
                  icon={styleConfig.icon}
                  tone={styleConfig.tone}
                  unread={!notif.read}
                  onPress={() => handleNotificationPress(notif)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl * 2,
  },
  actionRow: {
    alignItems: 'flex-end',
    marginBottom: SPACING.md,
  },
  list: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
});
