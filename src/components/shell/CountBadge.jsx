import { RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';

// Figma Badge/Count — gold pill, e.g. "4 new notifications".
export default function CountBadge({ label, style }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.pill, style]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: withOpacity(c.gold, 0.6),
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxxs,
  },
  text: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    color: c.slate,
  },
});
