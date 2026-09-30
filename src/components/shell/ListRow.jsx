import {
  COLORS,
  ELEVATION,
  IconSet,
  lineHeightFor,
  ListRowTone,
  ListRowType,
  OffenseState,
  RADII,
  SPACING,
  STATUS_THEME,
  TicketStatus,
  TYPOGRAPHY,
  withOpacity,
} from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const ICON_CIRCLE = 36;
const DOT = SPACING.sm;

const TONES = {
  [ListRowTone.NEUTRAL]: COLORS.slate,
  [ListRowTone.HIGHLIGHT]: COLORS.gold,
  [ListRowTone.SUCCESS]: COLORS.success,
  [ListRowTone.ERROR]: COLORS.error,
};

const OFFENSE_STATE = {
  [OffenseState.ACTIVE]: { label: 'Offense recorded', color: COLORS.ink },
  [OffenseState.REVOKED]: { label: 'Revoked', color: COLORS.success },
  [OffenseState.CAUSED_BAN]: { label: 'Caused 24h ban', color: COLORS.error },
};

function MenuRow({ title, icon, pill, destructive }) {
  const accent = destructive ? COLORS.error : COLORS.ink;

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
        color={destructive ? withOpacity(COLORS.error, 0.6) : COLORS.slate}
      />
    </>
  );
}

function NotificationRow({ title, subtitle, meta, icon, tone, unread }) {
  const toneColor = TONES[tone] ?? COLORS.gold;

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
  const state = OFFENSE_STATE[status] ?? OFFENSE_STATE[OffenseState.ACTIVE];

  return (
    <>
      <View style={styles.flex}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.caption}>{subtitle}</Text>}
      </View>
      <View style={[styles.pill, styles.goldTint]}>
        <Text style={[styles.pillText, styles.upper, { color: state.color }]}>{state.label}</Text>
      </View>
    </>
  );
}

// status is a terminal TicketStatus; label and color come from STATUS_THEME
function HistoryRow({ title, subtitle, meta, icon = 'ticket-outline', status }) {
  const theme = STATUS_THEME[status] ?? STATUS_THEME[TicketStatus.COMPLETED];

  return (
    <>
      <View style={[styles.iconCircle, styles.goldTint, styles.goldOutline]}>
        <IconSet name={icon} size={18} color={COLORS.ink} />
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

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  menu: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  noDivider: { borderTopWidth: 0 },
  notification: {
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  goldTint: { backgroundColor: withOpacity(COLORS.gold, 0.15) },
  goldOutline: { borderWidth: 1, borderColor: withOpacity(COLORS.gold, 0.3) },
  dangerTint: { backgroundColor: withOpacity(COLORS.error, 0.08) },
  dotSlot: {
    width: DOT,
    paddingTop: (ICON_CIRCLE - DOT) / 2,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: RADII.full,
    backgroundColor: COLORS.gold,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.base),
    color: COLORS.ink,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.sm),
    color: COLORS.slate,
  },
  caption: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.xs),
    color: COLORS.slate,
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
    color: COLORS.ink,
  },
  upper: { textTransform: 'uppercase' },
});
