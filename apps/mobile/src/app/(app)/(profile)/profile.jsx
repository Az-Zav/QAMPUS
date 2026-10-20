import * as Clipboard from 'expo-clipboard';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ConfirmModal from '@/components/modals/ConfirmModal';
import { BOTTOM_NAV_CLEARANCE } from '@/components/shell/BottomNav';
import ListRow from '@/components/shell/ListRow';
import ProfileHeader from '@/components/shell/ProfileHeader';

import { ELEVATION, IconSet, ListRowType, MODAL_COPY, PROFILE_COPY, PROFILE_MENU, RADII, SPACING, TYPOGRAPHY, USER_ROLE, withOpacity } from '@/constants';
import { useSession, useTheme, useThemedStyles } from '@/hooks';

// S13 Profile (UIUX §4.11, §5.7). Sign in as a guest on Login to see the guest variant.

const COPIED_MS = 1500;

function IdCard({ label, value }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);
  };

  return (
    <View style={[styles.card, styles.idCard]}>
      <Text style={styles.idLabel}>{label}</Text>
      <View style={styles.idField}>
        <IconSet name="id-card-outline" size={18} color={colors.slate} />
        <Text style={styles.idValue} selectable>{value}</Text>
        <Pressable
          onPress={copy}
          style={styles.copyButton}
          hitSlop={SPACING.sm}
          accessibilityRole="button"
          accessibilityLabel={copied ? `${label} copied` : `Copy ${label}`}
        >
          <IconSet name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? colors.success : colors.slate} />
        </Pressable>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user, signOut } = useSession();
  const [logOutOpen, setLogOutOpen] = useState(false);

  // Signed out (e.g. after Log out, or opened directly) -> back to Login
  if (!user) return <Redirect href="/login" />;

  const isGuest = user.role === USER_ROLE.GUEST;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  const logOut = () => {
    setLogOutOpen(false);
    signOut();
    router.replace('/login');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll} bounces={false} showsVerticalScrollIndicator={false}>
        <ProfileHeader
          context={isGuest ? 'profileGuest' : 'profileStudent'}
          user={user}
          onBack={goBack}
          onEdit={() => router.push('/edit-profile')}
        />

        <View style={styles.body}>
          <IdCard label={isGuest ? PROFILE_COPY.guestIdLabel : PROFILE_COPY.studentIdLabel} value={user.institutional_id} />

          <View style={styles.card}>
            {PROFILE_MENU.map((item, i) => (
              <ListRow
                key={item.id}
                type={ListRowType.MENU}
                icon={item.icon}
                title={item.title}
                onPress={() => router.push(item.href)}
                style={i === 0 && styles.firstRow}
              />
            ))}
          </View>

          <View style={styles.card}>
            <ListRow
              type={ListRowType.MENU}
              icon="log-out-outline"
              title={PROFILE_COPY.logOut}
              destructive
              onPress={() => setLogOutOpen(true)}
            />
          </View>
        </View>
      </ScrollView>

      <ConfirmModal {...MODAL_COPY.logOut} visible={logOutOpen} onConfirm={logOut} onClose={() => setLogOutOpen(false)} />
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.paper },
  scroll: { paddingBottom: BOTTOM_NAV_CLEARANCE },
  body: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
  },
  card: {
    backgroundColor: c.white,
    borderRadius: RADII.xl,
    overflow: 'hidden',
    ...ELEVATION.md,
  },
  firstRow: { borderTopWidth: 0 },

  // Student / Guest ID
  idCard: { gap: SPACING.sm, padding: SPACING.lg, overflow: 'visible' },
  idLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    letterSpacing: -0.35,
    color: c.ink,
  },
  idField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: withOpacity(c.paper, 0.6),
    borderWidth: 1,
    borderColor: withOpacity(c.border, 0.6),
    borderRadius: RADII.lg,
  },
  idValue: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.sm,
    color: c.slate,
  },
  copyButton: { padding: SPACING.xxs },
});
