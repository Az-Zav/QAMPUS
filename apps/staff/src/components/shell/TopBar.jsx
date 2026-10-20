import {
  CONTENT_MAX_WIDTH,
  NAV_ITEMS,
  PAGE_GUTTER,
  RADII,
  SPACING,
  TOP_BAR_HEIGHT,
  TYPOGRAPHY,
} from '@/constants';
import { useSession, useStaffOffice, useThemedStyles } from '@/hooks';
import { Bell, ChevronDown } from '@/icons';
import { Link, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Staff/TopBar — brand + office on the left, section nav in the middle, account on the right.
// The office status pill (OPEN/CLOSED) arrives with the queue screen's live data.
export default function TopBar() {
  const styles = useThemedStyles(makeStyles);
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const { office } = useStaffOffice();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <View style={styles.left}>
          <Text style={styles.brand}>QAMPUS</Text>
          <Text style={styles.office}>{office?.name ?? ''}</Text>
        </View>

        <View style={styles.nav}>
          {NAV_ITEMS.map(({ href, label }) => (
            <Link key={href} href={href} style={[styles.navItem, pathname === href && styles.navItemActive]}>
              {label}
            </Link>
          ))}
        </View>

        <View style={styles.right}>
          <Bell size={18} color={styles.icon.color} />
          <Pressable
            onPress={() => setMenuOpen((open) => !open)}
            accessibilityRole="button"
            accessibilityLabel="Account menu"
            accessibilityState={{ expanded: menuOpen }}
            style={styles.account}
          >
            <Text style={styles.accountName}>{user?.name}</Text>
            <ChevronDown size={14} color={styles.icon.color} />
          </Pressable>
          {menuOpen && (
            <View style={styles.menu}>
              <Pressable onPress={signOut} accessibilityRole="button" style={styles.menuItem}>
                <Text style={styles.menuLabel}>Sign out</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    bar: {
      height: TOP_BAR_HEIGHT,
      backgroundColor: c.inverse,
      alignItems: 'center',
      paddingHorizontal: PAGE_GUTTER,
      zIndex: 10,
    },
    inner: {
      flex: 1,
      width: '100%',
      maxWidth: CONTENT_MAX_WIDTH,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
    brand: {
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      fontSize: TYPOGRAPHY.size.base,
      color: c.gold,
      letterSpacing: 0.5,
    },
    office: { fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.size.base, color: c.onInverse },
    nav: { flexDirection: 'row', gap: SPACING.xxl },
    navItem: { fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.size.sm, color: c.slate },
    navItemActive: { color: c.gold },
    right: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: SPACING.lg },
    icon: { color: c.onInverse },
    account: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
    accountName: { fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.size.sm, color: c.onInverse },
    menu: {
      position: 'absolute',
      top: TOP_BAR_HEIGHT - 16,
      right: 0,
      minWidth: 160,
      backgroundColor: c.white,
      borderRadius: RADII.md,
      borderWidth: 1,
      borderColor: c.border,
      padding: SPACING.xs,
    },
    menuItem: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, borderRadius: RADII.sm },
    menuLabel: { fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: TYPOGRAPHY.size.base, color: c.ink },
  });
