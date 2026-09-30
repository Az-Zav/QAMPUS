import { COLORS, RADII, SPACING } from '@/constants';
import { StyleSheet, View } from 'react-native';

// Progress dots for paged content; the active page is a wider gold pill
export default function PageDots({ count, index, style }) {
  return (
    <View style={[styles.row, style]} accessibilityLabel={`Slide ${index + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.active]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: RADII.full,
    backgroundColor: COLORS.border,
  },
  active: {
    width: 20,
    backgroundColor: COLORS.gold,
  },
});
