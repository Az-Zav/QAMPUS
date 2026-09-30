import { RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SegmentedSwitcher({ options = [], value, onChange, style }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.container, style]} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange?.(option)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: withOpacity(c.white, 0.9),
    borderWidth: 1,
    borderColor: withOpacity(c.ink, 0.05),
    borderRadius: RADII.full,
    padding: SPACING.xxs,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: RADII.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
  },
  selected: {
    backgroundColor: c.inverse,
  },
  label: {
    color: c.slate,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.sm,
  },
  selectedLabel: {
    color: c.gold,
  },
});
