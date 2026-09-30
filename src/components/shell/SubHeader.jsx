import { IconSet, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BACK_SIZE = 32; // circle diameter — tweak here

// Secondary header for stacked sub-screens: circled back arrow + left-aligned title.
// No router inside; the screen passes onBack (e.g. router.back).
export default function SubHeader({ title, onBack, style }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.md }, style]}>
      <Pressable
        onPress={onBack}
        hitSlop={SPACING.sm}
        style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Back"
      >
        <IconSet name="arrow-back" size={18} color={colors.onInverse} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md, // circle ↔ title spacing — tweak here
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: c.paper,
  },
  back: {
    width: BACK_SIZE,
    height: BACK_SIZE,
    borderRadius: RADII.full,
    backgroundColor: c.inverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    flexShrink: 1,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl, // title size — tweak here
    color: c.ink,
  },
});
