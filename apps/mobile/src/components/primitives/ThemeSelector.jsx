import { ColorScheme, IconSet, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Figma Input/ThemeSelector — equal-width Light | Dark halves.
// value: the scheme on screen; onChange(scheme) when the user picks a half.

const OPTIONS = [
  { value: ColorScheme.LIGHT, label: 'Light', icon: 'sunny-outline' },
  { value: ColorScheme.DARK, label: 'Dark', icon: 'moon-outline' },
];

export default function ThemeSelector({ value, onChange }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.container} accessibilityRole="radiogroup">
      {OPTIONS.map((option) => {
        const selected = option.value === value;
        const color = selected ? colors.onGold : colors.slate;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange?.(option.value)}
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

const makeStyles = (c) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.xs,
    padding: SPACING.xxs + 1,
    backgroundColor: c.paper,
    borderWidth: 1,
    borderColor: c.border,
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
  selected: { backgroundColor: c.gold },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
  },
});
