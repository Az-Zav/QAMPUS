import { AppTab, ELEVATION, IconSet, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const TAB_ICONS = { [AppTab.HOME]: 'home', [AppTab.SCAN]: 'qr-code', [AppTab.QUEUE]: 'ticket' };

// Bottom padding a scrolling screen needs so its last item clears the bar and Scan disc.
export const BOTTOM_NAV_CLEARANCE = 126;

export default function BottomNav({ active, onNavigate }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.wrapper}>
      <View style={styles.bar}>
        <NavItem tab={AppTab.HOME} label="Home" active={active === AppTab.HOME} onPress={() => onNavigate(AppTab.HOME)} />
        <Pressable
          style={styles.centerSpacer}
          onPress={() => onNavigate(AppTab.SCAN)}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
            <Text style={[styles.label, { color: active === AppTab.SCAN ? colors.gold : colors.onInverse }]}>SCAN</Text>
        </Pressable>
        <NavItem tab={AppTab.QUEUE} label="Queue" active={active === AppTab.QUEUE} onPress={() => onNavigate(AppTab.QUEUE)} />
      </View>
      <Pressable
        style={styles.scanButton}
        onPress={() => onNavigate(AppTab.SCAN)}
        accessibilityRole="tab"
        accessibilityLabel="Scan"
        accessibilityState={{ selected: active === AppTab.SCAN }}
      >
        <IconSet name={TAB_ICONS[AppTab.SCAN]} color={colors.onGold} size={26} />
      </Pressable>
    </View>
  );
}

function NavItem({ tab, label, active, onPress }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const color = active ? colors.gold : colors.onInverse;
  return (
    <Pressable
      style={styles.navItem}
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <IconSet name={TAB_ICONS[tab]} color={color} size={22} />
      <Text style={[styles.label, { color }]}>{label.toUpperCase()}</Text>
    </Pressable>
  );
}

const makeStyles = (c) => StyleSheet.create({
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
    backgroundColor: c.inverse,
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
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'flex-end',
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
    backgroundColor: c.gold,
    justifyContent: 'center',
    alignItems: 'center',
    ...ELEVATION.md,
  },
});