import { ComponentSize, IconSet, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Pressable, StyleSheet, Text } from 'react-native';

// Neutral gold pill used when there is no status (e.g. an action badge)
const makeActionTheme = (c) => ({ bg: c.gold, border: null, text: c.onGold, icon: null, label: '' });

export default function Badge({ status, size = ComponentSize.SM, icon, label, onPress }) {
  const styles = useThemedStyles(makeStyles);
  const { status: statusTheme } = useTheme();
  const actionTheme = useThemedStyles(makeActionTheme);
  const theme = statusTheme[status] ?? actionTheme;
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

const makeStyles = (c) => StyleSheet.create({
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
