import { COLORS, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

// Figma Badge/Count — gold pill, e.g. "4 new notifications".
export default function CountBadge({ label, style }) {
  return (
    <View style={[styles.pill, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: withOpacity(COLORS.gold, 0.6),
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxxs,
  },
  text: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.slate,
  },
});
