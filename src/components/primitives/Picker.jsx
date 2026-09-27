import { useState } from 'react';
import { View, Pressable, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import theme from '@/theme/theme';

export default function Picker({ value, onSelect, options = [], placeholder = 'Select an option', searchable = false, style }) {
    const [open, setOpen] = useState(false); // Whether options are open or collapsed
    const [search, setSearch] = useState(''); // Search input value

    const select = (option) => {
        onSelect(option);
        setOpen(false);
    };

    const visible = searchable && search.trim() ? options.filter((option) => option.toLowerCase().includes(search.trim().toLowerCase())) : options; //search filtering function

    const toggle = () => {
        if (open) setSearch('');
        setOpen((prev) => !prev);
    };

    return (
        <View style={[styles.wrap, open && styles.wrapOpen, style]}>
            <Pressable style={styles.field} onPress={toggle}>
                {searchable && open ? (
                    <TextInput  //rendered if searchable
                        autoFocus
                        value={search}
                        onChangeText={setSearch}
                        placeholder={placeholder}
                        placeholderTextColor={theme.colors.slate}
                        style={styles.searchInput}
                    />
                ) : (
                    <Text style={[styles.value, (open || !value) && styles.valueOpen]} //rendered if not searchable
                        numberOfLines={1}>
                        {open ? placeholder : value ?? placeholder}
                    </Text>
                )}
                <theme.IconSet
                    name="chevron-down"
                    size={16}
                    color={theme.colors.slate}
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
                                <Text style={[styles.optionText, isSelected && styles.optionTextSelected]} numberOfLines={1}>
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
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
  },
  wrapOpen: {
    borderWidth: 2,
    borderColor: theme.colors.gold,
  },
  field: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  value: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.md,
    color: theme.colors.ink,
  },
  valueOpen: {
    color: theme.colors.slate,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.md,
    color: theme.colors.ink,
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
    paddingHorizontal: theme.spacing.lg,
  },
  optionSelected: {
    backgroundColor: theme.withOpacity(theme.colors.gold, 0.18),
  },
  optionText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.base,
    color: theme.colors.slate,
  },
  optionTextSelected: {
    color: theme.colors.ink,
  },
});