import { AppTab, COLORS, ELEVATION, IconSet, RADII, SPACING, TYPOGRAPHY } from '@/constants';
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
        <IconSet name={TAB_ICONS[AppTab.SCAN]} color={COLORS.ink} size={26} />
      </Pressable>
    </View>
  );
}

function NavItem({ tab, label, active, onPress }) {
  const color = active ? COLORS.gold : COLORS.paper;
  return (
    <Pressable style={styles.navItem} onPress={onPress}>
      <IconSet name={TAB_ICONS[tab]} color={color} size={22} />
      <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.ink,
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.xl + SPACING.lg,
    paddingVertical: SPACING.md,
    width: '100%',
    ...ELEVATION.sm,
  },
  navItem: {
    alignItems: 'center',
    gap: SPACING.xxxs,
    minWidth: 64,
  },
  centerSpacer: {
    width: 64,
  },
  label: {
    fontSize: TYPOGRAPHY.size.xs,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  scanButton: {
    position: 'absolute',
    top: -24,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: RADII.full,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    ...ELEVATION.md,
  },
});