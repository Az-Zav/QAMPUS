import { RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function Switch({ value }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={[
        styles.track,
        {
          backgroundColor: value ? colors.gold : withOpacity(colors.ink, 0.2),
          justifyContent: value ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <View style={styles.knob} />
    </View>
  );
}

export default function Toggle({ title, subtitle, value = false, onValueChange, disabled = false, style }) {
  const styles = useThemedStyles(makeStyles);
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

const makeStyles = (c) => StyleSheet.create({
  row: {
    backgroundColor: c.white,
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
    color: c.ink,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    color: c.slate,
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
    backgroundColor: c.ink,
  },
});
