import { COLORS, IconSet, RADII, SPACING, STATUS_THEME, TYPOGRAPHY } from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Badge({ status, size = 'sm', onPress, icon, label }) {
  const isActionable = typeof onPress === 'function';
  const Wrapper = isActionable ? Pressable : View;

  const currentTheme = STATUS_THEME[status] ?? {
    bg: COLORS.gold,
    border: null,
    text: COLORS.ink,
    icon: 'notifications',
    label: status ?? 'Status',
  };

  const fontSize = size === 'sm' ? TYPOGRAPHY.size.sm : TYPOGRAPHY.size.base;
  const iconName = icon ?? currentTheme.icon;
  const displayLabel = label ?? currentTheme.label;

  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }) => [
        styles.badge,
        {
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border ?? 'transparent',
          borderWidth: currentTheme.border ? 1 : 0,
        },
        isActionable && pressed && styles.pressed,
      ]}
      accessibilityRole={isActionable ? 'button' : undefined}
    >
      {iconName && <IconSet name={iconName} color={currentTheme.text} size={fontSize + 2} />}
      <Text
        style={[
          styles.text,
          {
            color: currentTheme.text,
            fontSize,
            lineHeight: fontSize * 1.2,
          },
        ]}
      >
        {displayLabel}
      </Text>
    </Wrapper>
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