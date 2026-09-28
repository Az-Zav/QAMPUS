import { COLORS, QueueView, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SegmentedSwitcher({ options = [QueueView.JOIN, QueueView.HISTORY], value, onChange }) {
  return (
    <View style={styles.container} accessibilityRole="tablist">
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: withOpacity(COLORS.white, 0.9),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.ink, 0.05),
    borderRadius: RADII.full,
    padding: 4,
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
    backgroundColor: COLORS.ink,
  },
  label: {
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.sm,
  },
  selectedLabel: {
    color: COLORS.gold,
  },
});
