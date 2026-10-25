import { IconSet, RADII, SPACING, TOUCH, TYPOGRAPHY } from '@/constants';
import { useSession, useTheme, useThemedStyles } from '@/hooks';
import { Image as AvatarImage } from 'expo-image';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({ title, hasNotification, inverted = false, onBellPress, onAvatarPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const { user } = useSession();
  const logoSource = inverted
    ? require('../../../assets/images/Qampus-Logo-Inverted.png')
    : require('../../../assets/images/Qampus-Logo.png');

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.md }, inverted && styles.invertedContainer]}>
      <View style={styles.logoGroup}>
        <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
        <Text style={[styles.title, inverted && styles.invertedTitle]}>{title}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onBellPress} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Notifications">
          <IconSet name="notifications-outline" color={inverted ? colors.onGold : colors.ink} size={26} />
          {hasNotification && <View style={styles.dot} />}
        </Pressable>
        <Pressable onPress={onAvatarPress} style={styles.avatarButton} accessibilityRole="button" accessibilityLabel="Profile">
          <View style={styles.avatar}>
            {user?.avatar_url ? (
              <AvatarImage source={{ uri: user.avatar_url }} style={styles.avatarImage} contentFit="cover" />
            ) : (
              <IconSet name="person" color={colors.onInverse} size={22} />
            )}
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: c.paper,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  title: {
    fontSize: TYPOGRAPHY.size.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: c.ink,
  },
  invertedTitle: {
    color: c.onGold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOUCH.GAP,
  },
  // The drawn icon is 26, the tappable area is the full 48 (Material / WCAG target size)
  iconButton: {
    position: 'relative',
    width: TOUCH.MIN_TARGET,
    height: TOUCH.MIN_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: RADII.full,
    backgroundColor: c.gold,
  },
  avatarButton: {
    width: TOUCH.MIN_TARGET,
    height: TOUCH.MIN_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADII.full,
    backgroundColor: c.inverse,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  logoImage: {
    width: 40,
    height: 40,
  },
  invertedContainer: {
    backgroundColor: 'transparent',
  },
});