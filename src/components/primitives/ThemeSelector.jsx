import { COLORS, IconSet, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Figma Input/ThemeSelector — equal-width Light | Dark halves.
// `inert` (V1, PRD §5) moves the selection but never calls onChange.

const OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
];

export default function ThemeSelector({ value, onChange, inert = false }) {
  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        const color = selected ? COLORS.ink : COLORS.slate;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange?.(option.value, { inert })}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.half, selected && styles.selected]}
          >
            <IconSet name={option.icon} size={16} color={color} />
            <Text style={[styles.label, { color }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.xs,
    padding: SPACING.xxs + 1,
    backgroundColor: COLORS.paper,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.lg + 2,
  },
  half: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md - 2,
    borderRadius: RADII.md + 2,
  },
  selected: { backgroundColor: COLORS.gold },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
  },
});
