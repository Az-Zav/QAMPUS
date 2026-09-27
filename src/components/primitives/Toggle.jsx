import { Pressable, View, Text, StyleSheet } from 'react-native';
import theme from '@/theme/theme';
import { ToggleType } from '@/theme/types';

function Switch({ toggled }) {
    return (
        <View
            style = {[
                styles.track,
                { backgroundColor: toggled ? theme.colors.gold : theme.withOpacity(theme.colors.ink, 0.2) },
                { justifyContent: toggled ? 'flex-end' : 'flex-start' }
            ]}
        >
            <View style={styles.knob} />
        </View>
    )
}

export default function Toggle({ title, subtitle, toggled, onToggleChange, type = ToggleType.FUNCTIONAL }) {
    const isDisabled = type === ToggleType.DISABLED;
    return (
        <Pressable
            onPress = {isDisabled ? undefined : () => onToggleChange(!toggled)}
            disabled = {isDisabled}
            style = {[styles.row, isDisabled && styles.disabled]}
        >
            <View style={styles.labels}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Switch toggled={toggled} />
        </Pressable>
    )
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  disabled: { opacity: 0.55 },
  labels: { flex: 1, gap: theme.spacing.xxxs },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.base,
    color: theme.colors.ink,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.xs,
    color: theme.colors.slate,
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: theme.radii.full,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.ink,
  },
});