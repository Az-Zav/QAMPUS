import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';
import { HistoryStatus, ListRowTone, ListRowType, OffenseState } from '../../theme/types';

const ICON_CIRCLE = 36; // icon disc diameter — theme.js has no size tokens
const DOT = theme.spacing.sm;

const lineHeight = (size) => Math.round(size * theme.typography.lineHeight.normal);

// Notification icon circle: tone color as a soft tint behind a full-color icon.
const TONES = {
  neutral:   theme.colors.slate,
  highlight: theme.colors.gold,
  success:   theme.colors.success,
  error:     theme.colors.error,
};

const HISTORY_STATUS = {
  [HistoryStatus.COMPLETED]:           { label: 'Completed',           color: theme.colors.success },
  [HistoryStatus.CANCELLED]:           { label: 'Cancelled',           color: theme.colors.slate },
  [HistoryStatus.NO_SHOW]:             { label: 'No-show',             color: theme.colors.error },
  [HistoryStatus.CANCELLED_BY_OFFICE]: { label: 'Cancelled by office', color: theme.colors.slate },
};

const OFFENSE_STATE = {
  [OffenseState.ACTIVE]:     { label: 'Offense recorded', color: theme.colors.ink },
  [OffenseState.REVOKED]:    { label: 'Revoked',          color: theme.colors.success },
  [OffenseState.CAUSED_BAN]: { label: 'Caused 24h ban',   color: theme.colors.error },
};

function MenuRow({ title, icon, pill, destructive }) {
    const Icon = theme.IconSet;
    const accent = destructive ? theme.colors.error : theme.colors.ink;

    return (
        <>
            <View style={[styles.iconCircle, destructive ? styles.dangerTint : styles.goldTint]}>
                {!!icon && <Icon name={icon} size={18} color={accent} />}
            </View>
            <Text style={[styles.title, styles.flex, { color: accent }]}>{title}</Text>
            {!!pill && (
                <View style={[styles.pill, styles.goldTint]}>
                    <Text style={styles.pillText}>{pill}</Text>
                </View>
            )}
            <Icon
                name = "chevron-forward"
                size = {18}
                color = {destructive ? theme.withOpacity(theme.colors.error, 0.6) : theme.colors.slate}
            />
        </>
    );
}

function NotificationRow({ title, subtitle, meta, icon, tone, unread }) {
    const Icon = theme.IconSet;
    const toneColor = TONES[tone];

    return (
        <>
            <View style={styles.dotSlot}>
                {unread && <View style={styles.dot} accessibilityLabel="Unread" />}
            </View>
            <View style={[styles.iconCircle, { backgroundColor: theme.withOpacity(toneColor, 0.18) }]}>
                {!!icon && <Icon name={icon} size={18} color={toneColor} />}
            </View>
            <View style={styles.flex}>
                <Text style={styles.title}>{title}</Text>
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
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

function HistoryRow({ title, subtitle, meta, icon = 'school-outline', status }) {
    const Icon = theme.IconSet;
    const state = HISTORY_STATUS[status] ?? HISTORY_STATUS[HistoryStatus.COMPLETED];

    return (
        <>
            <View style={[styles.iconCircle, styles.goldTint, styles.goldOutline]}>
                <Icon name={icon} size={18} color={theme.colors.ink} />
            </View>
            <View style={styles.flex}>
                <View style={styles.historyHead}>
                    <Text style={[styles.title, styles.shrink]} numberOfLines={1}>{title}</Text>
                    <View style={[styles.pill, styles.goldTint, styles.goldOutline]}>
                        <Text style={[styles.pillText, { color: state.color }]}>{state.label}</Text>
                    </View>
                </View>
                {!!subtitle && <Text style={styles.caption}>{subtitle}</Text>}
                {!!meta && <Text style={styles.caption}>{meta}</Text>}
            </View>
        </>
    );
}

const VARIANTS = {
  menu:         { Body: MenuRow,         container: 'menu' },
  notification: { Body: NotificationRow, container: 'notification' },
  offense:      { Body: OffenseRow,      container: 'card' },
  history:      { Body: HistoryRow,      container: 'card' },
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

    const variant = VARIANTS[type];
    const { Body } = variant;

    return (
        <Pressable
            onPress = {onPress}
            disabled = {!onPress}
            accessibilityRole = {onPress ? 'button' : undefined}
            style = {({ pressed }) => [
                styles.row,
                styles[variant.container],
                type === ListRowType.HISTORY && styles.alignTop,
                type === ListRowType.MENU && destructive && styles.noDivider,
                pressed && onPress && styles.pressed,
                style
            ]}
        >
            <Body
                title = {title}
                subtitle = {subtitle}
                meta = {meta}
                icon = {icon}
                tone = {tone}
                status = {status}
                pill = {pill}
                unread = {unread}
                destructive = {destructive}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // Containers
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
    },
    menu: {
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    noDivider: { borderTopWidth: 0 },
    notification: {
        alignItems: 'flex-start',
        paddingHorizontal: 0,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    card: {
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.lg,
        ...theme.elevation.sm,
    },
    alignTop: { alignItems: 'flex-start' },
    pressed: { opacity: 0.85 },

    // Layout helpers
    flex: { flex: 1, gap: theme.spacing.xxxs },
    shrink: { flexShrink: 1 },
    historyHead: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.sm,
    },

    // Icon discs and tints
    iconCircle: {
        width: ICON_CIRCLE,
        height: ICON_CIRCLE,
        borderRadius: theme.radii.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    goldTint: { backgroundColor: theme.withOpacity(theme.colors.gold, 0.15) },
    goldOutline: { borderWidth: 1, borderColor: theme.withOpacity(theme.colors.gold, 0.3) },
    dangerTint: { backgroundColor: theme.withOpacity(theme.colors.error, 0.08) },

    // Notification unread dot — reserves its column so read rows stay aligned
    dotSlot: {
        width: DOT,
        paddingTop: (ICON_CIRCLE - DOT) / 2,
    },
    dot: {
        width: DOT,
        height: DOT,
        borderRadius: theme.radii.full,
        backgroundColor: theme.colors.gold,
    },

    // Text
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.size.base,
        lineHeight: lineHeight(theme.typography.size.base),
        color: theme.colors.ink,
    },
    subtitle: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.size.sm,
        lineHeight: lineHeight(theme.typography.size.sm),
        color: theme.colors.slate,
    },
    caption: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.size.xs,
        lineHeight: lineHeight(theme.typography.size.xs),
        color: theme.colors.slate,
    },

    // Pills
    pill: {
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxxs,
        borderRadius: theme.radii.full,
    },
    pillText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.size.xs,
        lineHeight: lineHeight(theme.typography.size.xs),
        color: theme.colors.ink,
    },
    upper: { textTransform: 'uppercase' },
});
