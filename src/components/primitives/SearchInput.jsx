import { COLORS, IconSet, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { useRef } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

export default function SearchInput({ value, onChangeText, placeholder, style, ...rest }) {
  const inputRef = useRef(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={[styles.wrap, style]}>
      <IconSet
        name="search"
        size={18}
        color={COLORS.slate}
        style={styles.icon}
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.slate}
        style={styles.input}
        {...rest}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 38,
    borderRadius: RADII.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: withOpacity(COLORS.ink, 0.05),
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
    color: COLORS.ink,
  },
});