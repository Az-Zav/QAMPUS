import { useRef } from 'react';
import { Pressable, TextInput, StyleSheet } from 'react-native';
import theme from '@/theme/theme';

export default function SearchInput({ value, onChangeText, placeholder, style, ...rest }) {
  const inputRef = useRef(null);
  
  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={[styles.wrap, style]}>
      <theme.IconSet
        name="search"
        size={18}
        color={theme.colors.slate}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.slate}
        style={styles.input}
        {...rest}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 38,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.withOpacity(theme.colors.ink, 0.05),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.base, // rounded from Figma's 13.5px
    color: theme.colors.ink,
  },
});