import StaffModal from '@/components/modals/StaffModal';
import { MenuBackdrop, MenuDivider, MenuItem, MenuPanel } from '@/components/primitives/Menu';
import {
  CONTENT_MAX_WIDTH,
  INFO_COPY,
  LegalDoc,
  NAV_ITEMS,
  PAGE_GUTTER,
  QUEUE_COPY,
  RADII,
  STAFF_FONT,
  TOP_BAR_COPY,
  TOP_BAR_HEIGHT,
  TOP_BAR_HEIGHT_NARROW,
  TOP_BAR_MEDIUM_BREAKPOINT,
  TOP_BAR_MENU_WIDTH,
  TOP_BAR_NARROW_BREAKPOINT,
  TYPOGRAPHY,
} from '@/constants';
import { useSession, useStaffOffice, useStaffQueue, useTheme, useThemedStyles } from '@/hooks';
import { BellRing, ChevronDown, CircleCheck, CircleX } from '@/icons';
import { Image } from 'expo-image';
import { Link, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const LOGO = require('../../../assets/images/Qampus-Logo.png');
const Menu = Object.freeze({ NONE: null, ACCOUNT: 'account', NOTIFICATIONS: 'notifications' });

// Figma Staff/TopBar — brand, office and queue status pill on the left, section tabs in the middle,
// notifications bell and account menu on the right.
export default function TopBar() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const narrow = width < TOP_BAR_NARROW_BREAKPOINT;
  const medium = !narrow && width < TOP_BAR_MEDIUM_BREAKPOINT;
  const barHeight = narrow ? TOP_BAR_HEIGHT_NARROW : TOP_BAR_HEIGHT;
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const { office } = useStaffOffice();
  const { isOpen, cutoffWarningMinutes, notifications } = useStaffQueue();
  const [menu, setMenu] = useState(Menu.NONE);
  const [info, setInfo] = useState(null);

  const toggle = (next) => setMenu((current) => (current === next ? Menu.NONE : next));
  const showInfo = (content) => {
    setMenu(Menu.NONE);
    setInfo(content);
  };
  // A new tab, like the public display, so the queue stays open behind it
  const openLegal = (doc) => {
    setMenu(Menu.NONE);
    if (typeof window !== 'undefined') window.open(`${window.location.origin}/legal/${doc}`, '_blank');
  };
  const StatusIcon = isOpen ? CircleCheck : CircleX;

  const identity = (
    <View style={styles.left}>
      <View style={styles.brandRow}>
        <Image source={LOGO} style={styles.logo} contentFit="contain" accessibilityLabel="QAMPUS" />
        {!medium && !narrow && <Text style={styles.brand}>QAMPUS</Text>}
      </View>
      <Text style={styles.office} numberOfLines={1}>
        {office?.short_name}
      </Text>
      <View style={[styles.pill, { backgroundColor: isOpen ? colors.success : colors.slate }]}>
        <StatusIcon size={14} color={colors.onInverse} />
        <Text style={styles.pillLabel}>{isOpen ? TOP_BAR_COPY.open : TOP_BAR_COPY.closed}</Text>
      </View>
    </View>
  );

  const tabs = (
    <View style={[styles.tabs, medium && styles.tabsMedium, narrow && styles.tabsNarrow]} accessibilityRole="tablist">
      {NAV_ITEMS.map(({ href, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[styles.tab, active && styles.tabActive]}
          >
            {label}
          </Link>
        );
      })}
    </View>
  );

  const account = (
    <View style={[styles.right, narrow && styles.rightNarrow]}>
      {menu !== Menu.NONE && <MenuBackdrop onPress={() => setMenu(Menu.NONE)} />}
      <Pressable
        onPress={() => toggle(Menu.NOTIFICATIONS)}
        accessibilityRole="button"
        accessibilityLabel={TOP_BAR_COPY.notifications}
        accessibilityState={{ expanded: menu === Menu.NOTIFICATIONS }}
        hitSlop={8}
      >
        <BellRing size={22} color={colors.onInverse} />
      </Pressable>
      <Pressable
        onPress={() => toggle(Menu.ACCOUNT)}
        accessibilityRole="button"
        accessibilityLabel={TOP_BAR_COPY.accountMenu}
        accessibilityState={{ expanded: menu === Menu.ACCOUNT }}
        style={styles.account}
      >
        <Text style={[styles.accountName, narrow && styles.accountNameNarrow]} numberOfLines={1}>
              {user?.name}
            </Text>
        <ChevronDown size={18} color={colors.slate} />
      </Pressable>

      {menu === Menu.NOTIFICATIONS && (
        <MenuPanel style={[styles.menu, { top: barHeight - 13, width: Math.min(TOP_BAR_MENU_WIDTH, width - 2 * PAGE_GUTTER) }]}>
          <Text style={styles.menuHeading}>{TOP_BAR_COPY.notifications}</Text>
          <MenuDivider />
          {cutoffWarningMinutes !== null && (
            <View style={styles.notice}>
              <Text style={styles.noticeTitle}>{QUEUE_COPY.cutoffBanner(cutoffWarningMinutes)}</Text>
            </View>
          )}
          {notifications.map(({ id, title, message }) => (
            <View key={id} style={styles.notice}>
              <Text style={styles.noticeTitle}>{title}</Text>
              <Text style={styles.noticeBody}>{message}</Text>
            </View>
          ))}
          {cutoffWarningMinutes === null && notifications.length === 0 && (
            <View style={styles.notice}>
              <Text style={styles.noticeBody}>{TOP_BAR_COPY.noNotifications}</Text>
            </View>
          )}
        </MenuPanel>
      )}

      {menu === Menu.ACCOUNT && (
        <MenuPanel style={[styles.menu, { top: barHeight - 13, width: Math.min(TOP_BAR_MENU_WIDTH, width - 2 * PAGE_GUTTER) }]}>
          <View style={styles.menuHead}>
            <Text style={styles.menuName}>{user?.full_name ?? user?.name}</Text>
            <Text style={styles.menuRole}>
              {office?.short_name} · {TOP_BAR_COPY.assignedStaff}
            </Text>
          </View>
          <MenuDivider />
          <MenuItem
            label={TOP_BAR_COPY.officeAssignment}
            onPress={() => showInfo(INFO_COPY.officeAssignment(office))}
          />
          <MenuItem label={TOP_BAR_COPY.help} onPress={() => showInfo(INFO_COPY.help)} />
          <MenuItem label={TOP_BAR_COPY.terms} onPress={() => openLegal(LegalDoc.TERMS)} />
          <MenuItem label={TOP_BAR_COPY.privacy} onPress={() => openLegal(LegalDoc.PRIVACY)} />
          <MenuDivider />
          <MenuItem label={TOP_BAR_COPY.signOut} onPress={signOut} danger />
        </MenuPanel>
      )}
    </View>
  );

  return (
    <View style={[styles.bar, { height: barHeight }]}>
      <View style={[styles.inner, medium && styles.innerMedium, narrow && styles.innerNarrow]}>
        {identity}
        {narrow ? account : tabs}
        {narrow ? tabs : account}
      </View>

      <StaffModal
        visible={!!info}
        title={info?.title}
        body={info?.body}
        cancelLabel={INFO_COPY.ok}
        onCancel={() => setInfo(null)}
      />
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    bar: {
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
      gap: 24,
    },
    innerMedium: { gap: 12 },
    // Two rows: identity and account, then the tabs across the full width
    innerNarrow: { flexWrap: 'wrap', alignContent: 'center', rowGap: 8, gap: 8 },
    left: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 16 },
    brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    logo: { width: 32, height: 32 },
    brand: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.size.lg, color: c.gold },
    office: { flexShrink: 1, fontFamily: STAFF_FONT.semibold, fontSize: 16, color: c.onInverse },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingLeft: 10,
      paddingRight: 12,
      paddingVertical: 5,
      borderRadius: RADII.full,
    },
    pillLabel: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: TYPOGRAPHY.size.xs, color: c.onInverse },
    tabs: { flexDirection: 'row', alignItems: 'center', gap: 28 },
    tabsMedium: { gap: 16 },
    tabsNarrow: { width: '100%', justifyContent: 'space-around', gap: 12 },
    tab: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.md, color: c.slate },
    tabActive: { fontFamily: STAFF_FONT.semibold, color: c.gold },
    right: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 18 },
    rightNarrow: { flex: 0 },
    account: { flexDirection: 'row', alignItems: 'center', gap: 18, flexShrink: 1, minWidth: 0 },
    accountName: { flexShrink: 1, fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.md, color: c.onInverse },
    accountNameNarrow: { maxWidth: 120 },
    menu: { position: 'absolute', right: 0 },
    menuHead: { gap: 3, paddingTop: 6, paddingBottom: 12, paddingHorizontal: 14 },
    menuName: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 16, color: c.ink },
    menuRole: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 13, color: c.slate },
    menuHeading: {
      fontFamily: TYPOGRAPHY.fontFamily.bold,
      fontSize: 16,
      color: c.ink,
      paddingTop: 6,
      paddingBottom: 12,
      paddingHorizontal: 14,
    },
    notice: { gap: 3, paddingHorizontal: 14, paddingVertical: 12 },
    noticeTitle: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.md, color: c.ink },
    noticeBody: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 13, color: c.slate },
  });
