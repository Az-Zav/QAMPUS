import { STAFF_FONT, TYPOGRAPHY, withOpacity } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Dropdown panel (Figma AccountMenu): Paper card with a Slate hairline, rows of 15px semibold items.
// Position it with `style` (absolute) from the trigger's wrapper.
export function MenuPanel({ children, style }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.panel, style]} accessibilityRole="menu">
      {children}
    </View>
  );
}

export function MenuItem({ label, onPress, danger = false, selected = false }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="menuitem"
      accessibilityState={{ selected }}
      style={({ pressed, hovered }) => [styles.item, (pressed || hovered || selected) && styles.itemActive]}
    >
      <Text style={[styles.itemLabel, danger && styles.danger]}>{label}</Text>
    </Pressable>
  );
}

// Invisible full-window layer under an open menu: clicking anywhere outside closes it
export function MenuBackdrop({ onPress }) {
  const styles = useThemedStyles(makeStyles);
  return <Pressable onPress={onPress} accessible={false} style={styles.backdrop} />;
}

export function MenuDivider() {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.divider} />;
}

const makeStyles = (c) =>
  StyleSheet.create({
    panel: {
      backgroundColor: c.paper,
      borderWidth: 1,
      borderColor: c.slate,
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 12,
      gap: 2,
      zIndex: 20,
    },
    item: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 9 },
    itemActive: { backgroundColor: withOpacity(c.slate, 0.1) },
    itemLabel: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.md, color: c.ink },
    danger: { color: c.error },
    divider: { height: 1, backgroundColor: withOpacity(c.slate, 0.4) },
    // web-only app: `fixed` covers the viewport regardless of where the menu sits
    backdrop: { position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 15, cursor: 'default' },
  });
