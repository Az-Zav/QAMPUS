import { COLORS, InputType, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

export default function Input({ value, onChangeText, placeholder, type = InputType.DEFAULT, keyboardType = 'default', maxLength, style, ...rest }) {
  const [focused, setFocused] = useState(false);
  const isError = type === InputType.ERROR;
  const isDisabled = type === InputType.DISABLED;

  const borderColor = isDisabled ? COLORS.disabledBg :
    isError ? COLORS.error :
      focused ? COLORS.gold : COLORS.border;

  const borderWidth = isDisabled ? 0 : (focused || isError) ? 2 : 1;

  return (
    <TextInput
      value={value}
      onChangeText={isDisabled ? undefined : onChangeText}
      placeholder={placeholder}
      placeholderTextColor={COLORS.slate}
      keyboardType={keyboardType}
      maxLength={maxLength}
      editable={!isDisabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.base,
        {
          borderColor,
          borderWidth,
          backgroundColor: isDisabled ? COLORS.disabledBg : COLORS.white,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    height: 46,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.lg,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.ink,
  },
});