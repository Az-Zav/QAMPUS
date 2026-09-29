import Header from '@/components/shell/Header';
import ListRow from '@/components/shell/ListRow';
import { COLORS, ListRowType, SPACING, TYPOGRAPHY } from '@/constants';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, actions } = useAuth();

  const isGuest = user?.role === 'GUEST';

  const handleSignOut = async () => {
    await actions.signOut();
  };

  return (
    <View style={styles.screen}>
      <Header title="PROFILE" onBellPress={() => router.push('/(profile)/notifications')} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {user?.name ? user.name[0].toUpperCase() : 'G'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.userSub}>
              {isGuest
                ? 'Guest Account'
                : `${user?.program || 'Student'} • ${user?.institutionalId || ''}`}
            </Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuGroup}>
          <ListRow
            type={ListRowType.MENU}
            title="Edit Profile"
            icon="person-outline"
            onPress={() => router.push('/(profile)/edit-profile')}
          />
          <ListRow
            type={ListRowType.MENU}
            title="Offenses & Bans"
            icon="shield-outline"
            onPress={() => router.push('/(profile)/bans')}
          />
          <ListRow
            type={ListRowType.MENU}
            title="Notifications"
            icon="notifications-outline"
            onPress={() => router.push('/(profile)/notifications')}
          />
          <ListRow
            type={ListRowType.MENU}
            title="Settings"
            icon="settings-outline"
            onPress={() => router.push('/(profile)/settings')}
          />
          <ListRow
            type={ListRowType.MENU}
            title="Help & Policy"
            icon="help-circle-outline"
            onPress={() => router.push('/(profile)/help')}
          />
          <ListRow
            type={ListRowType.MENU}
            title="Sign Out"
            icon="log-out-outline"
            destructive
            onPress={handleSignOut}
          />
        </View>
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  avatarInitial: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.gold,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.ink,
  },
  userSub: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.slate,
    marginTop: 2,
  },
  menuGroup: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
});
