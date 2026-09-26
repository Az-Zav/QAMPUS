import { useState } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { InputType } from '../../theme/types';

export default function Input({value, onChangeText, placeholder, type = InputType.DEFAULT, keyboardType = 'default', maxLength, style, ...rest}) {
    const [focused, setFocused] = useState(false);
    const isError = type === InputType.ERROR;
    const isDisabled = type === InputType.DISABLED;
    

    const borderColor = isDisabled ? theme.colors.disabledBg : 
        isError ? theme.colors.error : 
            focused ? theme.colors.gold : theme.colors.border;

    const borderWidth = isDisabled ? 0 : (focused || isError) ? 2 : 1;

    return (
        <TextInput
            value={value}
            onChangeText={isDisabled ? undefined : onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.slate}
            keyboardType={keyboardType}
            maxLength={maxLength}
            editable={!isDisabled}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style = {[styles.base, { borderColor, borderWidth, backgroundColor : isDisabled ? theme.colors.disabledBg : theme.colors.white }, style]}
            {...rest}
        />
    );
}

const styles = StyleSheet.create({
  base: {
    height: 46,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.lg,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.md,
    color: theme.colors.ink,
    outlineStyle: 'none'
  },
});