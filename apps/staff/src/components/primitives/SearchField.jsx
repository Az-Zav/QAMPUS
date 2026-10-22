import { RADII, TYPOGRAPHY, withOpacity } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Search } from '@/icons';
import { StyleSheet, TextInput, View } from 'react-native';

// Figma Input/Search — white pill with a faint inset, search glyph and 13.5px placeholder.
export default function SearchField({ value, onChangeText, placeholder, style }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={[styles.field, style]}>
      <Search size={18} color={colors.slate} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.slate}
        accessibilityLabel={placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    field: {
      height: 38,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 12,
      borderRadius: RADII.full,
      borderWidth: 1,
      borderColor: withOpacity(c.ink, 0.05),
      backgroundColor: c.white,
      boxShadow: 'inset 0px 2px 4px 0px rgba(0, 0, 0, 0.05)',
    },
    input: {
      flex: 1,
      height: '100%',
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: 13.5,
      color: c.ink,
      outlineStyle: 'none',
    },
  });
