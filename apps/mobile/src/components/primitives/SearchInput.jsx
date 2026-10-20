import { IconSet, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

export default function SearchInput({ value, onChangeText, placeholder, style, ...rest }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const inputRef = useRef(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={[styles.wrap, style]}>
      <IconSet
        name="search"
        size={18}
        color={colors.slate}
        style={styles.icon}
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.slate}
        style={styles.input}
        {...rest}
      />
    </Pressable>
  );
}

const makeStyles = (c) => StyleSheet.create({
  wrap: {
    height: 38,
    borderRadius: RADII.full,
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: withOpacity(c.ink, 0.05),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.base,
    color: c.ink,
  },
});