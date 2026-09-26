import theme from '@/theme/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function SegmentedSwitcher({ options = ['Join', 'History'], value, onChange }) {
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
    backgroundColor: theme.colors.disabledBg,
    borderRadius: theme.radii.full,
    padding: 3,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  selected: {
    backgroundColor: theme.colors.ink,
  },
  label: {
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.sm,
  },
  selectedLabel: {
    color: theme.colors.white,
  },
});
