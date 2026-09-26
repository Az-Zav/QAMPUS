import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme/theme';
import { InfoCardType } from '../../theme/types';


const lineHeight = (size) => Math.round(size * theme.typography.lineHeight.normal);

// Static copy from Figma Card/PolicyExplainer ("Static copy — no variants").
const DEFAULT_POLICY = [
  { icon: 'close-circle-outline', color: theme.colors.error,   text: "Missing your turn, or cancelling after you've been called, counts as an offense." },
  { icon: 'ticket-outline',       color: theme.colors.success, text: "Leaving a queue before you're called is always free and never counted." },
  { icon: 'ban-outline',          color: theme.colors.slate,   text: 'Two offenses pause joining for 24 hours. Browsing, your tickets and your history stay open.' },
];

const STRIKE_STATES = {
  clean:  { icon: 'shield-checkmark-outline', iconColor: theme.colors.success, title: 'Clean record',        body: 'No offenses on your record.' },
  strike: { icon: 'warning-outline',          iconColor: theme.colors.error,   title: '1 offense on record', body: 'One more offense will pause your ability to join queues for 24 hours.' },
  banned: { icon: 'ban-outline',              iconColor: theme.colors.error,   title: 'Joining paused',      body: 'Your strikes reset once the pause ends.' },
};

function OfficeHours({ title, subtitle, hours, open = true }) {
    const Icon = theme.IconSet;
    const textColor = open ? theme.colors.ink : theme.colors.slate;

    return (
        <View style={styles.row}>
            <View style={styles.stack}>
                <Text style={[styles.title, { color: textColor }]}>{title}</Text>
                {!!subtitle && (
                    <View style={styles.inline}>
                        <Icon name="location-outline" size={theme.typography.size.sm} color={theme.colors.slate} />
                        <Text style={[styles.caption, styles.flex]}>{subtitle}</Text>
                    </View>
                )}
            </View>
            <View style={[styles.stack, styles.alignEnd]}>
                {!!hours && (
                    <View style={styles.inline}>
                        <Icon name="time-outline" size={theme.typography.size.sm} color={textColor} />
                        <Text style={[styles.body, styles.noShrink, { color: textColor }]} numberOfLines={1}>{hours}</Text>
                    </View>
                )}
                <Text style={[styles.label, { color: open ? theme.colors.success : theme.colors.slate }]}>
                    {open ? 'OPEN' : 'CLOSED'}
                </Text>
            </View>
        </View>
    );
}

function BanBanner({ title, body, items }) {
    const Icon = theme.IconSet;

    return (
        <>
            <View style={styles.row}>
                <Icon name="ban-outline" size={18} color={theme.colors.error} />
                <Text style={[styles.title, styles.flex, { color: theme.colors.error }]}>{title}</Text>
            </View>
            {!!body && <Text style={styles.body}>{body}</Text>}
            {!!items?.length && (
                <>
                    <View style={styles.divider} />
                    <Text style={[styles.label, { color: theme.colors.slate }]}>WHAT CAUSED THIS</Text>
                    <View style={styles.list}>
                        {items.map((item) => (
                            <View key={`${item.label}-${item.ticket}`} style={styles.row}>
                                <Text style={[styles.body, styles.flex, { color: theme.colors.ink }]}>{item.label}</Text>
                                <Text style={styles.caption}>{item.ticket}</Text>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </>
    );
}

function StrikeMeter({ title, body, strikes = 0, maxStrikes = 2, banned = false }) {
    const Icon = theme.IconSet;
    const state = STRIKE_STATES[banned ? 'banned' : strikes > 0 ? 'strike' : 'clean'];

    return (
        <>
            <View style={styles.row}>
                <Icon name={state.icon} size={18} color={state.iconColor} />
                <Text style={[styles.title, styles.flex, banned && { color: theme.colors.error }]}>{title ?? state.title}</Text>
            </View>
            {!banned && (
                <View style={styles.meter} accessibilityLabel={`${strikes} of ${maxStrikes} strikes`}>
                    {Array.from({ length: maxStrikes }, (_, i) => (
                        <View key={i} style={[styles.meterSegment, i < strikes ? styles.meterOn : styles.meterOff]} />
                    ))}
                </View>
            )}
            <Text style={styles.body}>{body ?? state.body}</Text>
        </>
    );
}

function Policy({ title = 'How offenses work', items = DEFAULT_POLICY }) {
    const Icon = theme.IconSet;

    return (
        <>
            <Text style={styles.title}>{title}</Text>
            {items.map((rule) => (
                <View key={rule.text} style={[styles.row, styles.alignStart]}>
                    <Icon name={rule.icon} size={16} color={rule.color} style={styles.ruleIcon} />
                    <Text style={[styles.body, styles.flex]}>{rule.text}</Text>
                </View>
            ))}
        </>
    );
}

function Faq({ title, body, expanded }) {
    const Icon = theme.IconSet;

    return (
        <>
            <View style={styles.row}>
                <Text style={[styles.title, styles.flex]}>{title}</Text>
                <Icon name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.slate} />
            </View>
            {expanded && !!body && <Text style={styles.body}>{body}</Text>}
        </>
    );
}

const VARIANTS = {
  officeHours: { Body: OfficeHours, container: null },
  banBanner:   { Body: BanBanner,   container: 'danger' },
  strikeMeter: { Body: StrikeMeter, container: null },
  policy:      { Body: Policy,      container: null },
  faq:         { Body: Faq,         container: null },
};

export default function InfoCard({ type = InfoCardType.POLICY, onPress, style, ...props }) {

    const variant = VARIANTS[type];
    const { Body } = variant;
    const isFaq = type === InfoCardType.FAQ;
    const bannedOutline = type === InfoCardType.STRIKE_METER && props.banned;

    return (
        <Pressable
            onPress = {onPress}
            disabled = {!onPress}
            accessibilityRole = {onPress ? 'button' : undefined}
            accessibilityState = {isFaq ? { expanded: !!props.expanded } : undefined}
            style = {({ pressed }) => [
                styles.card,
                variant.container && styles[variant.container],
                bannedOutline && styles.danger,
                pressed && onPress && styles.pressed,
                style
            ]}
        >
            <Body {...props} />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    // Shared card shell — same surface, border and radius as the other components
    card: {
        gap: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radii.lg,
    },
    danger: { borderColor: theme.colors.error },
    pressed: { opacity: 0.85 },

    // Layout helpers
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    stack: { flex: 1, gap: theme.spacing.xxxs },
    list: { gap: theme.spacing.xs },
    inline: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xxs },
    flex: { flex: 1 },
    alignEnd: { flex: 0, flexShrink: 0, alignItems: 'flex-end' },
    alignStart: { alignItems: 'flex-start' },
    noShrink: { flexShrink: 0 },
    ruleIcon: { marginTop: theme.spacing.xxxs },
    divider: { height: 1, backgroundColor: theme.colors.border },

    // Text
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.size.base,
        lineHeight: lineHeight(theme.typography.size.base),
        color: theme.colors.ink,
    },
    body: {
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
    label: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.size.xs,
        lineHeight: lineHeight(theme.typography.size.xs),
    },

    // Strike meter
    meter: { flexDirection: 'row', gap: theme.spacing.xs },
    meterSegment: { flex: 1, height: theme.spacing.xs, borderRadius: theme.radii.sm },
    meterOn: { backgroundColor: theme.colors.error },
    meterOff: { backgroundColor: theme.colors.disabledBg },
});
