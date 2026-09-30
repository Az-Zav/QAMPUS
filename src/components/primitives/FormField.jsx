import { COLORS, lineHeightFor, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

// Label + field + helper line. `error` replaces the helper and turns it red.
// The field itself (Input, Picker, ...) is passed as children.
export default function FormField({ label, helper, error, children, style }) {
  const note = error || helper;

  return (
    <View style={[styles.field, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      {children}
      {!!note && (
        <Text style={[styles.note, !!error && styles.error]} accessibilityLiveRegion={error ? 'polite' : 'none'}>
          {note}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: SPACING.xs, // label ↔ field ↔ helper spacing
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.ink,
  },
  note: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.xs),
    color: COLORS.slate,
  },
  error: {
    color: COLORS.error,
  },
});