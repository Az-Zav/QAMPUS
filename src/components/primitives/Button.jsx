import { Pressable, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { ButtonType } from '../../theme/types';

const VARIANTS = {
  primary:     { bg: theme.colors.gold,         border: null,                   text: theme.colors.ink },
  secondary:   { bg: theme.colors.white,        border: theme.colors.border,    text: theme.colors.ink },
  destructive: { bg: theme.colors.white,        border: theme.colors.error,     text: theme.colors.error },
  disabled:    { bg: theme.colors.disabledBg,   border: null,                   text: theme.colors.slate },
};

export default function Button({label, onPress, type = ButtonType.PRIMARY, style}) {
    
    const variant = VARIANTS[type];
    const isDisabled = type === ButtonType.DISABLED;

    return (
        <Pressable
            onPress = {isDisabled ? undefined : onPress}
            disabled = {isDisabled}
            style = {({ pressed }) => [
                styles.base, 
                { backgroundColor: variant.bg, borderColor: variant.border, borderWidth: variant.border ? 1 : 0 },
                pressed && !isDisabled && styles.pressed,
                style
            ]}
        >
            <Text style={[styles.label, { color: variant.text }]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        height: 48,
        borderRadius: theme.radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.lg,
    },
    pressed: { opacity: 0.85 },
    label: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.size.md
    },
    });