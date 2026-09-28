import { COLORS, IconSet, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Picker({ value, onSelect, options = [], placeholder = 'Select an option', searchable = false, style }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const select = (option) => {
    onSelect?.(option);
    setOpen(false);
  };

  const visible = searchable && search.trim()
    ? options.filter((option) => option.toLowerCase().includes(search.trim().toLowerCase()))
    : options;

  const toggle = () => {
    if (open) setSearch('');
    setOpen((prev) => !prev);
  };

  return (
    <View style={[styles.wrap, open && styles.wrapOpen, style]}>
      <Pressable style={styles.field} onPress={toggle}>
        {searchable && open ? (
          <TextInput
            autoFocus
            value={search}
            onChangeText={setSearch}
            placeholder={placeholder}
            placeholderTextColor={COLORS.slate}
            style={styles.searchInput}
          />
        ) : (
          <Text
            style={[styles.value, (open || !value) && styles.valueOpen]}
            numberOfLines={1}
          >
            {open ? placeholder : value ?? placeholder}
          </Text>
        )}
        <IconSet
          name="chevron-down"
          size={16}
          color={COLORS.slate}
          style={open && styles.chevronOpen}
        />
      </Pressable>

      {open && (
        <ScrollView style={styles.options} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {visible.map((option) => {
            const isSelected = option === value;

            return (
              <Pressable
                key={option}
                style={[styles.option, isSelected && styles.optionSelected]}
                onPress={() => select(option)}
              >
                <Text
                  style={[styles.optionText, isSelected && styles.optionTextSelected]}
                  numberOfLines={1}
                >
                  {option}
                </Text>
              </Pressable>
            );
          })}
          {visible.length === 0 && (
            <View style={styles.option}>
              <Text style={styles.optionText}>No matches</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: RADII.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },
  wrapOpen: {
    borderWidth: 2,
    borderColor: COLORS.gold,
  },
  field: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  value: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.ink,
  },
  valueOpen: {
    color: COLORS.slate,
  },
  searchInput: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.ink,
    padding: 0,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  options: {
    maxHeight: 42 * 4,
  },
  option: {
    height: 42,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  optionSelected: {
    backgroundColor: withOpacity(COLORS.gold, 0.18),
  },
  optionText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.slate,
  },
  optionTextSelected: {
    color: COLORS.ink,
  },
});