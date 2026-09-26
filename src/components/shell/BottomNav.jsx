import theme from '@/theme/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TAB_ICONS = { home: 'home', scan: 'qr-code', queue: 'ticket' };

export default function BottomNav({ active, onNavigate }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <NavItem tab="home" label="Home" active={active === 'home'} onPress={() => onNavigate('home')} />
        <View style={styles.centerSpacer} />
        <NavItem tab="queue" label="Queue" active={active === 'queue'} onPress={() => onNavigate('queue')} />
      </View>
      <Pressable style={styles.scanButton} onPress={() => onNavigate('scan')} accessibilityLabel="Scan">
        <theme.IconSet name={TAB_ICONS.scan} color={theme.colors.ink} size={26} />
      </Pressable>
    </View>
  );
}

function NavItem({ tab, label, active, onPress }) {
  const color = active ? theme.colors.gold : theme.colors.paper;
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <theme.IconSet name={TAB_ICONS[tab]} color={color} size={22} />
      <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12 },
  bar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: theme.colors.ink, borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.sm,
    width: '100%', ...theme.elevation.sm,
  },
  navItem: { alignItems: 'center', gap: theme.spacing.xxxs, minWidth: 64 },
  centerSpacer: { width: 64 },
  label: { fontSize: theme.typography.size.xs, fontWeight: theme.typography.weight.medium, fontFamily: theme.typography.fontFamily.medium },
  scanButton: {
    position: 'absolute', top: -24, alignSelf: 'center',
    width: 56, height: 56, borderRadius: theme.radii.full,
    backgroundColor: theme.colors.gold, justifyContent: 'center', alignItems: 'center',
    ...theme.elevation.md,
  },
});