import { RADII, STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MenuBackdrop, MenuItem, MenuPanel } from './Menu';

// Figma W05 Filter pill: current choice + caret; opens a menu of `options` ({ key, label }).
export default function FilterSelect({ options, value, onChange, width, accessibilityLabel }) {
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.key === value) ?? options[0];

  return (
    <View style={[styles.wrapper, open && styles.wrapperOpen]}>
      {open && <MenuBackdrop onPress={() => setOpen(false)} />}
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ expanded: open }}
        style={[styles.pill, { width }]}
      >
        <Text style={styles.label} numberOfLines={1}>
          {selected.label}
        </Text>
        <Text style={styles.caret}>▾</Text>
      </Pressable>
      {open && (
        <MenuPanel style={styles.menu}>
          {options.map((option) => (
            <MenuItem
              key={option.key ?? 'all'}
              label={option.label}
              selected={option.key === selected.key}
              onPress={() => {
                onChange(option.key);
                setOpen(false);
              }}
            />
          ))}
        </MenuPanel>
      )}
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    wrapper: { position: 'relative' },
    wrapperOpen: { zIndex: 30 },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: RADII.full,
      borderWidth: 1,
      borderColor: c.slate,
      backgroundColor: c.paper,
    },
    label: { flexShrink: 1, fontFamily: STAFF_FONT.semibold, fontSize: 17, color: c.ink },
    caret: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.base, color: c.slate },
    menu: { position: 'absolute', top: '100%', right: 0, marginTop: 6, minWidth: 220 },
  });
