import StaffModal from '@/components/modals/StaffModal';
import { MenuBackdrop, MenuDivider, MenuItem, MenuPanel } from '@/components/primitives/Menu';
import {
  CONTENT_MAX_WIDTH,
  INFO_COPY,
  NAV_ITEMS,
  PAGE_GUTTER,
  QUEUE_COPY,
  RADII,
  STAFF_FONT,
  TOP_BAR_COPY,
  TOP_BAR_HEIGHT,
  TYPOGRAPHY,
} from '@/constants';
import { useSession, useStaffOffice, useStaffQueue, useTheme, useThemedStyles } from '@/hooks';
import { BellRing, ChevronDown, CircleCheck, CircleX } from '@/icons';
import { Link, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const Menu = Object.freeze({ NONE: null, ACCOUNT: 'account', NOTIFICATIONS: 'notifications' });

// Figma Staff/TopBar — brand, office and queue status pill on the left, section tabs in the middle,
// notifications bell and account menu on the right.
export default function TopBar() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
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
  const StatusIcon = isOpen ? CircleCheck : CircleX;

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <View style={styles.left}>
          <Text style={styles.brand}>QAMPUS</Text>
          <Text style={styles.office} numberOfLines={1}>
            {office?.short_name}
          </Text>
          <View style={[styles.pill, { backgroundColor: isOpen ? colors.success : colors.slate }]}>
            <StatusIcon size={14} color={colors.onInverse} />
            <Text style={styles.pillLabel}>{isOpen ? TOP_BAR_COPY.open : TOP_BAR_COPY.closed}</Text>
          </View>
        </View>

        <View style={styles.tabs} accessibilityRole="tablist">
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

        <View style={styles.right}>
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
            <Text style={styles.accountName}>{user?.name}</Text>
            <ChevronDown size={18} color={colors.slate} />
          </Pressable>

          {menu === Menu.NOTIFICATIONS && (
            <MenuPanel style={styles.menu}>
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
            <MenuPanel style={styles.menu}>
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
              <MenuDivider />
              <MenuItem label={TOP_BAR_COPY.signOut} onPress={signOut} danger />
            </MenuPanel>
          )}
        </View>
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
      gap: 24,
    },
    left: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 16 },
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
    tab: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.md, color: c.slate },
    tabActive: { fontFamily: STAFF_FONT.semibold, color: c.gold },
    right: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 18 },
    account: { flexDirection: 'row', alignItems: 'center', gap: 18 },
    accountName: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.md, color: c.onInverse },
    menu: { position: 'absolute', top: TOP_BAR_HEIGHT - 13, right: 0, width: 320 },
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
