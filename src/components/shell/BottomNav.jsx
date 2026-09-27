import theme from '@/theme/theme';
import { AppTab } from '@/theme/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TAB_ICONS = { [AppTab.HOME]: 'home', [AppTab.SCAN]: 'qr-code', [AppTab.QUEUE]: 'ticket' };

export default function BottomNav({ active, onNavigate }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <NavItem tab={AppTab.HOME} label="Home" active={active === AppTab.HOME} onPress={() => onNavigate(AppTab.HOME)} />
        <View style={styles.centerSpacer} />
        <NavItem tab={AppTab.QUEUE} label="Queue" active={active === AppTab.QUEUE} onPress={() => onNavigate(AppTab.QUEUE)} />
      </View>
      <Pressable style={styles.scanButton} onPress={() => onNavigate(AppTab.SCAN)} accessibilityLabel="Scan">
        <theme.IconSet name={TAB_ICONS[AppTab.SCAN]} color={theme.colors.ink} size={26} />
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
  label: { fontSize: theme.typography.size.xs, fontFamily: theme.typography.fontFamily.medium },
  scanButton: {
    position: 'absolute', top: -24, alignSelf: 'center',
    width: 56, height: 56, borderRadius: theme.radii.full,
    backgroundColor: theme.colors.gold, justifyContent: 'center', alignItems: 'center',
    ...theme.elevation.md,
  },
});