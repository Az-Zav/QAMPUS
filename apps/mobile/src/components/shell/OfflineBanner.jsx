import { EMPTY_STATE_COPY, EmptyStateType, IconSet, RADII, SPACING, TYPOGRAPHY, lineHeightFor, ELEVATION } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// "You're offline" strip at the top of every signed-in screen while Firestore cannot be reached (BUG-021).
// It never takes taps (the header's bell and avatar stay usable under it). Copy is the OFFLINE empty state.
export default function OfflineBanner({ visible }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();
  if (!visible) return null;
  const copy = EMPTY_STATE_COPY[EmptyStateType.OFFLINE];

  return (
    <View pointerEvents="none" style={[styles.wrap, { top: insets.top + SPACING.xs }]}>
      <View style={styles.card} accessible accessibilityRole="alert" accessibilityLabel={`${copy.title}. ${copy.body}`}>
        <IconSet name="cloud-offline-outline" size={18} color={colors.paper} />
        <Text style={styles.text}>
          <Text style={styles.title}>{copy.title}. </Text>
          {copy.body}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  wrap: { position: 'absolute', left: SPACING.md, right: SPACING.md, zIndex: 40 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: c.ink,
    borderRadius: RADII.lg,
    ...ELEVATION.sm,
  },
  text: {
    flex: 1,
    color: c.paper,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.sm),
  },
  title: { fontFamily: TYPOGRAPHY.fontFamily.bold },
});
