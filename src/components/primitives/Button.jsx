import { ButtonType, COLORS, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const VARIANTS = {
  primary: { bg: COLORS.gold, border: null, text: COLORS.ink },
  secondary: { bg: COLORS.white, border: COLORS.border, text: COLORS.ink },
  destructive: { bg: COLORS.white, border: COLORS.error, text: COLORS.error },
  accent: { bg: COLORS.ink, border: null, text: COLORS.gold },
  disabled: { bg: COLORS.disabledBg, border: null, text: COLORS.slate },
};

const SIZES = {
  md: { height: 48, paddingHorizontal: SPACING.lg, fontSize: TYPOGRAPHY.size.md },
  sm: { height: 32, paddingHorizontal: SPACING.md, fontSize: TYPOGRAPHY.size.xs },
};

export default function Button({
  label,
  onPress,
  type = ButtonType.PRIMARY,
  size = 'md',
  accessibilityLabel,
  style,
  icon,
}) {
  const variant = VARIANTS[type] ?? VARIANTS.primary;
  const sizing = SIZES[size] || SIZES.md;
  const isDisabled = type === ButtonType.DISABLED;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      style={({ pressed }) => [
        styles.base,
        {
          height: sizing.height,
          paddingHorizontal: sizing.paddingHorizontal,
          backgroundColor: variant.bg,
          borderColor: variant.border,
          borderWidth: variant.border ? 1 : 0,
        },
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={[styles.label, { color: variant.text, fontSize: sizing.fontSize }]}>
          {label}
        </Text>
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