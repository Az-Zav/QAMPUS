import { ButtonType, COLORS, ComponentSize, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const VARIANTS = {
  [ButtonType.PRIMARY]: { bg: COLORS.gold, border: null, text: COLORS.ink },
  [ButtonType.SECONDARY]: { bg: COLORS.white, border: COLORS.border, text: COLORS.ink },
  [ButtonType.DESTRUCTIVE]: { bg: COLORS.white, border: COLORS.error, text: COLORS.error },
  [ButtonType.ACCENT]: { bg: COLORS.ink, border: null, text: COLORS.gold },
  [ButtonType.TEXT]: { bg: 'transparent', border: null, text: COLORS.slate },
};

const DISABLED = { bg: COLORS.disabledBg, border: null, text: COLORS.slate };

const SIZES = {
  [ComponentSize.MD]: { height: 48, paddingHorizontal: SPACING.lg, fontSize: TYPOGRAPHY.size.md },
  [ComponentSize.SM]: { height: 32, paddingHorizontal: SPACING.md, fontSize: TYPOGRAPHY.size.xs },
};

export default function Button({
  label,
  onPress,
  type = ButtonType.PRIMARY,
  size = ComponentSize.MD,
  disabled = false,
  icon,
  accessibilityLabel,
  style,
}) {
  const variant = disabled ? DISABLED : VARIANTS[type] ?? VARIANTS[ButtonType.PRIMARY];
  const sizing = SIZES[size] ?? SIZES[ComponentSize.MD];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          height: sizing.height,
          paddingHorizontal: sizing.paddingHorizontal,
          backgroundColor: variant.bg,
          borderColor: variant.border,
          borderWidth: variant.border ? 1 : 0,
        },
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={[styles.label, { color: variant.text, fontSize: sizing.fontSize }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADII.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: SPACING.sm,
  },
});
