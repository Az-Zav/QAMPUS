import { COLORS, RADII, SPACING, ToggleType, TYPOGRAPHY, withOpacity } from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function Switch({ toggled }) {
  return (
    <View
      style={[
        styles.track,
        { backgroundColor: toggled ? COLORS.gold : withOpacity(COLORS.ink, 0.2) },
        { justifyContent: toggled ? 'flex-end' : 'flex-start' },
      ]}
    >
      <View style={styles.knob} />
    </View>
  );
}

export default function Toggle({ title, subtitle, toggled, onToggleChange, type = ToggleType.FUNCTIONAL }) {
  const isDisabled = type === ToggleType.DISABLED;
  return (
    <Pressable
      onPress={isDisabled ? undefined : () => onToggleChange?.(!toggled)}
      disabled={isDisabled}
      style={[styles.row, isDisabled && styles.disabled]}
      accessibilityRole="switch"
      accessibilityState={{ checked: toggled, disabled: isDisabled }}
    >
      <View style={styles.labels}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <Switch toggled={toggled} />
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
    padding: 2,
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