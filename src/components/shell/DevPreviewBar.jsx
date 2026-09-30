import { COLORS, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Dev-only state switcher, same look as Home's "Preview state" toolbar.
// Renders nothing in production builds.
export default function DevPreviewBar({ states, value, onChange, style }) {
  if (!__DEV__) return null;

  return (
    <View style={[styles.toolbar, style]}>
      <Text style={styles.label}>Preview state:</Text>
      <View style={styles.pills}>
        {states.map((state) => (
          <Pressable
            key={state}
            style={[styles.pill, value === state && styles.activePill]}
            onPress={() => onChange(state)}
          >
            <Text style={[styles.pillText, value === state && styles.activePillText]}>{state}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.xxs,
    backgroundColor: COLORS.white,
    padding: SPACING.xs,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.slate,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xxs },
  pill: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxxs,
    borderRadius: RADII.full,
    backgroundColor: COLORS.disabledBg,
  },
  activePill: { backgroundColor: COLORS.ink },
  pillText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.xs,
    color: COLORS.ink,
    textTransform: 'capitalize',
  },
  activePillText: { color: COLORS.paper },
});
