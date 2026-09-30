import { COLORS, ComponentSize, IconSet, RADII, SPACING, STATUS_THEME, TYPOGRAPHY } from '@/constants';
import { Pressable, StyleSheet, Text } from 'react-native';

// Neutral gold pill used when there is no status (e.g. an action badge)
const ACTION_THEME = { bg: COLORS.gold, border: null, text: COLORS.ink, icon: null, label: '' };

export default function Badge({ status, size = ComponentSize.SM, icon, label, onPress }) {
  const theme = STATUS_THEME[status] ?? ACTION_THEME;
  const fontSize = size === ComponentSize.SM ? TYPOGRAPHY.size.sm : TYPOGRAPHY.size.base;
  const iconName = icon ?? theme.icon;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      style={({ pressed }) => [
        styles.badge,
        {
          backgroundColor: theme.bg,
          borderColor: theme.border ?? 'transparent',
          borderWidth: theme.border ? 1 : 0,
        },
        pressed && styles.pressed,
      ]}
    >
      {!!iconName && <IconSet name={iconName} color={theme.text} size={fontSize + 2} />}
      <Text style={[styles.text, { color: theme.text, fontSize, lineHeight: fontSize * TYPOGRAPHY.lineHeight.tight }]}>
        {label ?? theme.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
});
