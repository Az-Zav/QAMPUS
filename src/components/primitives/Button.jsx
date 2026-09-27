import { Pressable, Text, StyleSheet, View } from 'react-native';
import theme from '@/theme/theme';
import { ButtonType } from '@/theme/types';

const VARIANTS = {
  primary:     { bg: theme.colors.gold,         border: null,                   text: theme.colors.ink },
  secondary:   { bg: theme.colors.white,        border: theme.colors.border,    text: theme.colors.ink },
  destructive: { bg: theme.colors.white,        border: theme.colors.error,     text: theme.colors.error },
  accent:      { bg: theme.colors.ink,          border: null,                   text: theme.colors.gold },
  disabled:    { bg: theme.colors.disabledBg,   border: null,                   text: theme.colors.slate },
};

// 'md' is the default full-width CTA size (forms, modals).
// 'sm' is for compact inline actions, e.g. a card's Join button.
const SIZES = {
  md: { height: 48, paddingHorizontal: theme.spacing.lg, fontSize: theme.typography.size.md },
  sm: { height: 32, paddingHorizontal: theme.spacing.md, fontSize: theme.typography.size.xs },
};

export default function Button({label, onPress, type = ButtonType.PRIMARY, size = 'md', accessibilityLabel, style, icon,}) {

    const variant = VARIANTS[type];
    const sizing = SIZES[size] || SIZES.md;
    const isDisabled = type === ButtonType.DISABLED;

    return (
        <Pressable
            onPress = {isDisabled ? undefined : onPress}
            disabled = {isDisabled}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || label}
            style = {({ pressed }) => [
                styles.base,
                {
                    height: sizing.height,
                    paddingHorizontal: sizing.paddingHorizontal,
                    backgroundColor: variant.bg,
                    borderColor: variant.border,
                    borderWidth: variant.border ? 1 : 0,
                },
                pressed && !isDisabled && styles.pressed,
                style
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
        borderRadius: theme.radii.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pressed: { 
        opacity: 0.65,
        transform: [{ scale: 0.98 }],
    },
    label: {
        fontFamily: theme.typography.fontFamily.bold,
    },
    contentRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center' 
    },
    iconWrapper: {
    marginRight: theme.spacing.sm,
  },
});