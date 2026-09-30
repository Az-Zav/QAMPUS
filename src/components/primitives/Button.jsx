import { ButtonType, ComponentSize, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const makeVariants = (c) => ({
  [ButtonType.PRIMARY]: { bg: c.gold, border: null, text: c.onGold },
  [ButtonType.SECONDARY]: { bg: c.white, border: c.border, text: c.ink },
  [ButtonType.DESTRUCTIVE]: { bg: c.white, border: c.error, text: c.error },
  [ButtonType.ACCENT]: { bg: c.inverse, border: null, text: c.gold },
  [ButtonType.TEXT]: { bg: 'transparent', border: null, text: c.slate },
  disabled: { bg: c.disabledBg, border: null, text: c.slate },
});

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
  const styles = useThemedStyles(makeStyles);
  const variants = useThemedStyles(makeVariants);
  const variant = disabled ? variants.disabled : variants[type] ?? variants[ButtonType.PRIMARY];
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

const makeStyles = (c) => StyleSheet.create({
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
