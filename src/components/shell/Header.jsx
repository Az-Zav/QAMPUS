import { IconSet, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({ title, hasNotification, inverted = false, onBellPress, onAvatarPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  const logoSource = inverted
    ? require('../../../assets/images/Qampus-Logo-Inverted.png')
    : require('../../../assets/images/Qampus-Logo.png');

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.xs }, inverted && styles.invertedContainer]}>
      <View style={styles.logoGroup}>
        <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
        <Text style={[styles.title, inverted && styles.invertedTitle]}>{title}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable onPress={onBellPress} style={styles.iconButton} accessibilityRole="button" accessibilityLabel="Notifications">
          <IconSet name="notifications-outline" color={inverted ? colors.onGold : colors.ink} size={22} />
          {hasNotification && <View style={styles.dot} />}
        </Pressable>
        <Pressable onPress={onAvatarPress} style={styles.avatar} accessibilityRole="button" accessibilityLabel="Profile">
          <IconSet name="person" color={colors.onInverse} size={18} />
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
    fontSize: TYPOGRAPHY.size.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: c.ink,
  },
  invertedTitle: {
    color: c.onGold,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconButton: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: RADII.full,
    backgroundColor: c.gold,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: RADII.full,
    backgroundColor: c.inverse,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
  },
  invertedContainer: {
    backgroundColor: 'transparent',
  },
});