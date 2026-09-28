import { COLORS, IconSet, InfoCardType, RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const lineHeight = (size) => Math.round(size * TYPOGRAPHY.lineHeight.normal);

const DEFAULT_POLICY = [
  { icon: 'close-circle-outline', color: COLORS.error, text: "Missing your turn, or cancelling after you've been called, counts as an offense." },
  { icon: 'ticket-outline', color: COLORS.success, text: "Leaving a queue before you're called is always free and never counted." },
  { icon: 'ban-outline', color: COLORS.slate, text: 'Two offenses pause joining for 24 hours. Browsing, your tickets and your history stay open.' },
];

const STRIKE_STATES = {
  clean: { icon: 'shield-checkmark-outline', iconColor: COLORS.success, title: 'Clean record', body: 'No offenses on your record.' },
  strike: { icon: 'warning-outline', iconColor: COLORS.error, title: '1 offense on record', body: 'One more offense will pause your ability to join queues for 24 hours.' },
  banned: { icon: 'ban-outline', iconColor: COLORS.error, title: 'Joining paused', body: 'Your strikes reset once the pause ends.' },
};

function OfficeHours({ title, subtitle, hours, open = true }) {
  const textColor = open ? COLORS.ink : COLORS.slate;

  return (
    <View style={styles.row}>
      <View style={styles.stack}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {!!subtitle && (
          <View style={styles.inline}>
            <IconSet name="location-outline" size={TYPOGRAPHY.size.sm} color={COLORS.slate} />
            <Text style={[styles.caption, styles.flex]}>{subtitle}</Text>
          </View>
        )}
      </View>
      <View style={[styles.stack, styles.alignEnd]}>
        {!!hours && (
          <View style={styles.inline}>
            <IconSet name="time-outline" size={TYPOGRAPHY.size.sm} color={textColor} />
            <Text style={[styles.body, styles.noShrink, { color: textColor }]} numberOfLines={1}>{hours}</Text>
          </View>
        )}
        <Text style={[styles.label, { color: open ? COLORS.success : COLORS.slate }]}>
          {open ? 'OPEN' : 'CLOSED'}
        </Text>
      </View>
    </View>
  );
}

function BanBanner({ title, body, items }) {
  return (
    <>
      <View style={styles.row}>
        <IconSet name="ban-outline" size={18} color={COLORS.error} />
        <Text style={[styles.title, styles.flex, { color: COLORS.error }]}>{title}</Text>
      </View>
      {!!body && <Text style={styles.body}>{body}</Text>}
      {!!items?.length && (
        <>
          <View style={styles.divider} />
          <Text style={[styles.label, { color: COLORS.slate }]}>WHAT CAUSED THIS</Text>
          <View style={styles.list}>
            {items.map((item) => (
              <View key={`${item.label}-${item.ticket}`} style={styles.row}>
                <Text style={[styles.body, styles.flex, { color: COLORS.ink }]}>{item.label}</Text>
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
  const state = STRIKE_STATES[banned ? 'banned' : strikes > 0 ? 'strike' : 'clean'];

  return (
    <>
      <View style={styles.row}>
        <IconSet name={state.icon} size={18} color={state.iconColor} />
        <Text style={[styles.title, styles.flex, banned && { color: COLORS.error }]}>{title ?? state.title}</Text>
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
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      {items.map((rule) => (
        <View key={rule.text} style={[styles.row, styles.alignStart]}>
          <IconSet name={rule.icon} size={16} color={rule.color} style={styles.ruleIcon} />
          <Text style={[styles.body, styles.flex]}>{rule.text}</Text>
        </View>
      ))}
    </>
  );
}

function Faq({ title, body, expanded }) {
  return (
    <>
      <View style={styles.row}>
        <Text style={[styles.title, styles.flex]}>{title}</Text>
        <IconSet name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.slate} />
      </View>
      {expanded && !!body && <Text style={styles.body}>{body}</Text>}
    </>
  );
}

const VARIANTS = {
  officeHours: { Body: OfficeHours, container: null },
  banBanner: { Body: BanBanner, container: 'danger' },
  strikeMeter: { Body: StrikeMeter, container: null },
  policy: { Body: Policy, container: null },
  faq: { Body: Faq, container: null },
};

export default function InfoCard({ type = InfoCardType.POLICY, onPress, style, ...props }) {
  const variant = VARIANTS[type] ?? VARIANTS.policy;
  const { Body } = variant;
  const isFaq = type === InfoCardType.FAQ;
  const bannedOutline = type === InfoCardType.STRIKE_METER && props.banned;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={isFaq ? { expanded: !!props.expanded } : undefined}
      style={({ pressed }) => [
        styles.card,
        variant.container && styles[variant.container],
        bannedOutline && styles.danger,
        pressed && onPress && styles.pressed,
        style,
      ]}
    >
      <Body {...props} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
  },
  danger: { borderColor: COLORS.error },
  pressed: { opacity: 0.85 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  stack: { flex: 1, gap: SPACING.xxxs },
  list: { gap: SPACING.xs },
  inline: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xxs },
  flex: { flex: 1 },
  alignEnd: { flex: 0, flexShrink: 0, alignItems: 'flex-end' },
  alignStart: { alignItems: 'flex-start' },
  noShrink: { flexShrink: 0 },
  ruleIcon: { marginTop: SPACING.xxxs },
  divider: { height: 1, backgroundColor: COLORS.border },

  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: lineHeight(TYPOGRAPHY.size.base),
    color: COLORS.ink,
  },
  body: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeight(TYPOGRAPHY.size.sm),
    color: COLORS.slate,
  },
  caption: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: lineHeight(TYPOGRAPHY.size.xs),
    color: COLORS.slate,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: lineHeight(TYPOGRAPHY.size.xs),
  },

  meter: { flexDirection: 'row', gap: SPACING.xs },
  meterSegment: { flex: 1, height: SPACING.xs, borderRadius: RADII.sm },
  meterOn: { backgroundColor: COLORS.error },
  meterOff: { backgroundColor: COLORS.disabledBg },
});
