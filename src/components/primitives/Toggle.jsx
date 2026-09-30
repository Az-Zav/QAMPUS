import { COLORS, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function Switch({ value }) {
  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: value ? COLORS.gold : withOpacity(COLORS.ink, 0.2),
          justifyContent: value ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <View style={styles.knob} />
    </View>
  );
}

export default function Toggle({ title, subtitle, value = false, onValueChange, disabled = false, style }) {
  return (
    <Pressable
      onPress={() => onValueChange?.(!value)}
      disabled={disabled}
      style={[styles.row, disabled && styles.disabled, style]}
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value, disabled }}
    >
      <View style={styles.labels}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Switch value={value} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: COLORS.white,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  disabled: { opacity: 0.55 },
  labels: { flex: 1, gap: SPACING.xxxs },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.slate,
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: RADII.full,
    padding: SPACING.xxxs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: RADII.full,
    backgroundColor: COLORS.ink,
  },
});
