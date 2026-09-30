import { InputType, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

export default function Input({
  value,
  onChangeText,
  placeholder,
  type = InputType.DEFAULT,
  disabled = false,
  keyboardType = 'default',
  maxLength,
  style,
  ...rest
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [focused, setFocused] = useState(false);
  const isError = type === InputType.ERROR;

  const borderColor = disabled ? colors.disabledBg : isError ? colors.error : focused ? colors.gold : colors.border;
  const borderWidth = disabled ? 0 : focused || isError ? 2 : 1;

  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.slate}
      keyboardType={keyboardType}
      maxLength={maxLength}
      editable={!disabled}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityState={{ disabled }}
      style={[
        styles.base,
        { borderColor, borderWidth, backgroundColor: disabled ? colors.disabledBg : colors.white },
        style,
      ]}
      {...rest}
    />
  );
}

const makeStyles = (c) => StyleSheet.create({
  base: {
    height: 46,
    borderRadius: RADII.lg,
    paddingHorizontal: SPACING.lg,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.md,
    color: c.ink,
  },
});
