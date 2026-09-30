import {
  ELEVATION,
  IconSet,
  lineHeightFor,
  ListRowTone,
  ListRowType,
  OffenseState,
  RADII,
  SPACING,
  TicketStatus,
  TYPOGRAPHY,
  withOpacity,
} from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const ICON_CIRCLE = 36;
const DOT = SPACING.sm;

const TONES = {
  [ListRowTone.NEUTRAL]: 'slate',
  [ListRowTone.HIGHLIGHT]: 'gold',
  [ListRowTone.SUCCESS]: 'success',
  [ListRowTone.ERROR]: 'error',
};

const OFFENSE_STATE = {
  [OffenseState.ACTIVE]: { label: 'Offense recorded', color: 'ink' },
  [OffenseState.REVOKED]: { label: 'Revoked', color: 'success' },
  [OffenseState.CAUSED_BAN]: { label: 'Caused 24h ban', color: 'error' },
};

function MenuRow({ title, icon, pill, destructive }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const accent = destructive ? colors.error : colors.ink;

  return (
    <>
      <View style={[styles.iconCircle, destructive ? styles.dangerTint : styles.goldTint]}>
        {!!icon && <IconSet name={icon} size={18} color={accent} />}
      </View>
      <Text style={[styles.title, styles.flex, { color: accent }]}>{title}</Text>
      {!!pill && (
        <View style={[styles.pill, styles.goldTint]}>
          <Text style={styles.pillText}>{pill}</Text>
        </View>
      )}
      <IconSet
        name="chevron-forward"
        size={18}
        color={destructive ? withOpacity(colors.error, 0.6) : colors.slate}
      />
    </>
  );
}

function NotificationRow({ title, subtitle, meta, icon, tone, unread }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const toneColor = colors[TONES[tone] ?? TONES[ListRowTone.HIGHLIGHT]];

  return (
    <>
      <View style={styles.dotSlot}>
        {unread && <View style={styles.dot} accessibilityLabel="Unread" />}
      </View>
      <View style={[styles.iconCircle, { backgroundColor: withOpacity(toneColor, 0.18) }]}>
        {!!icon && <IconSet name={icon} size={18} color={toneColor} />}
      </View>
      <View style={styles.flex}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>}
      </View>
      {!!meta && <Text style={styles.caption}>{meta}</Text>}
    </>
  );
}

function OffenseRow({ title, subtitle, status }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const state = OFFENSE_STATE[status] ?? OFFENSE_STATE[OffenseState.ACTIVE];

  return (
    <>
      <View style={styles.flex}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.caption}>{subtitle}</Text>}
      </View>
      <View style={[styles.pill, styles.goldTint]}>
        <Text style={[styles.pillText, styles.upper, { color: colors[state.color] }]}>{state.label}</Text>
      </View>
    </>
  );
}

// status is a terminal TicketStatus; label and color come from the theme's status map
function HistoryRow({ title, subtitle, meta, icon = 'ticket-outline', status }) {
  const { colors, status: statusTheme } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const theme = statusTheme[status] ?? statusTheme[TicketStatus.COMPLETED];

  return (
    <>
      <View style={[styles.iconCircle, styles.goldTint, styles.goldOutline]}>
        <IconSet name={icon} size={18} color={colors.ink} />
      </View>
      <View style={styles.flex}>
        <View style={styles.historyHead}>
          <Text style={[styles.title, styles.shrink]} numberOfLines={1}>{title}</Text>
          <View style={[styles.pill, styles.goldTint, styles.goldOutline]}>
            <Text style={[styles.pillText, { color: theme.text }]}>{theme.label}</Text>
          </View>
        </View>
        {!!subtitle && <Text style={styles.caption}>{subtitle}</Text>}
        {!!meta && <Text style={styles.caption}>{meta}</Text>}
      </View>
    </>
  );
}

const VARIANTS = {
  [ListRowType.MENU]: { Body: MenuRow, container: 'menu' },
  [ListRowType.NOTIFICATION]: { Body: NotificationRow, container: 'notification' },
  [ListRowType.OFFENSE]: { Body: OffenseRow, container: 'card' },
  [ListRowType.HISTORY]: { Body: HistoryRow, container: 'card' },
};

export default function ListRow({
  type = ListRowType.MENU,
  title,
  subtitle,
  meta,
  icon,
  tone = ListRowTone.HIGHLIGHT,
  status,
  pill,
  unread = false,
  destructive = false,
  onPress,
  style,
}) {
  const styles = useThemedStyles(makeStyles);
  const variant = VARIANTS[type] ?? VARIANTS[ListRowType.MENU];
  const { Body } = variant;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      style={({ pressed }) => [
        styles.row,
        styles[variant.container],
        type === ListRowType.HISTORY && styles.alignTop,
        type === ListRowType.MENU && destructive && styles.noDivider,
        pressed && onPress && styles.pressed,
        style,
      ]}
    >
      <Body
        title={title}
        subtitle={subtitle}
        meta={meta}
        icon={icon}
        tone={tone}
        status={status}
        pill={pill}
        unread={unread}
        destructive={destructive}
      />
    </Pressable>
  );
}

const makeStyles = (c) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  menu: {
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  noDivider: { borderTopWidth: 0 },
  notification: {
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  card: {
    backgroundColor: c.white,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: RADII.lg,
    ...ELEVATION.sm,
  },
  alignTop: { alignItems: 'flex-start' },
  pressed: { opacity: 0.85 },
  flex: { flex: 1, gap: SPACING.xxxs },
  shrink: { flexShrink: 1 },
  historyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: ICON_CIRCLE,
    height: ICON_CIRCLE,
    borderRadius: RADII.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldTint: { backgroundColor: withOpacity(c.gold, 0.15) },
  goldOutline: { borderWidth: 1, borderColor: withOpacity(c.gold, 0.3) },
  dangerTint: { backgroundColor: withOpacity(c.error, 0.08) },
  dotSlot: {
    width: DOT,
    paddingTop: (ICON_CIRCLE - DOT) / 2,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: RADII.full,
    backgroundColor: c.gold,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.base),
    color: c.ink,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.sm),
    color: c.slate,
  },
  caption: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.xs),
    color: c.slate,
  },
  pill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxxs,
    borderRadius: RADII.full,
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.xs),
    color: c.ink,
  },
  upper: { textTransform: 'uppercase' },
});
