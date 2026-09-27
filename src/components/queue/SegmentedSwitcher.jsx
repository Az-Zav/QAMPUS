import theme from '@/theme/theme';
import { QueueView } from '@/theme/types';
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
    backgroundColor: theme.withOpacity(theme.colors.white, 0.9),
    borderWidth: 1,
    borderColor: theme.withOpacity(theme.colors.ink, 0.05),
    borderRadius: theme.radii.full,
    padding: 4,
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
    color: theme.colors.gold,
  },
});
