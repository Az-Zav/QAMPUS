import {
  BAN_COPY,
  COLORS,
  IconSet,
  InfoCardType,
  lineHeightFor,
  OFFENSE_POLICY,
  RADII,
  RULES,
  SPACING,
  STRIKE_COPY,
  TYPOGRAPHY,
} from '@/constants';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Content tones (constants/content) -> colors
const TONE_COLORS = {
  error: COLORS.error,
  success: COLORS.success,
  neutral: COLORS.slate,
};

// Strike meter covers clean + warning only; an active ban uses BAN_BANNER instead
const STRIKE_STATES = {
  clean: { icon: 'shield-checkmark-outline', iconColor: COLORS.success, ...STRIKE_COPY.clean },
  warning: { icon: 'warning-outline', iconColor: COLORS.error, ...STRIKE_COPY.warning },
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

function BanBanner({ title, body = BAN_COPY.body, items }) {
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
          <Text style={[styles.label, { color: COLORS.slate }]}>{BAN_COPY.causesLabel}</Text>
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

function StrikeMeter({ title, body, strikes = 0, maxStrikes = RULES.OFFENSES_PER_BAN }) {
  const state = strikes > 0 ? STRIKE_STATES.warning : STRIKE_STATES.clean;

  return (
    <>
      <View style={styles.row}>
        <IconSet name={state.icon} size={18} color={state.iconColor} />
        <Text style={[styles.title, styles.flex]}>{title ?? state.title}</Text>
      </View>
      <View style={styles.meter} accessibilityLabel={`${strikes} of ${maxStrikes} strikes`}>
        {Array.from({ length: maxStrikes }, (_, i) => (
          <View key={i} style={[styles.meterSegment, i < strikes ? styles.meterOn : styles.meterOff]} />
        ))}
      </View>
      <Text style={styles.body}>{body ?? state.body}</Text>
    </>
  );
}

function Policy({ title = 'How offenses work', items = OFFENSE_POLICY }) {
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      {items.map((rule) => (
        <View key={rule.text} style={[styles.row, styles.alignStart]}>
          <IconSet name={rule.icon} size={16} color={TONE_COLORS[rule.tone] ?? COLORS.slate} style={styles.ruleIcon} />
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
  [InfoCardType.OFFICE_HOURS]: { Body: OfficeHours, container: null },
  [InfoCardType.BAN_BANNER]: { Body: BanBanner, container: 'danger' },
  [InfoCardType.STRIKE_METER]: { Body: StrikeMeter, container: null },
  [InfoCardType.POLICY]: { Body: Policy, container: null },
  [InfoCardType.FAQ]: { Body: Faq, container: null },
};

// FAQ keeps its own expanded state (pure UI state, like Picker's open);
// other variants are pressable only when onPress is given.
export default function InfoCard({ type = InfoCardType.POLICY, onPress, defaultExpanded = false, style, ...props }) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const variant = VARIANTS[type] ?? VARIANTS[InfoCardType.POLICY];
  const { Body } = variant;
  const isFaq = type === InfoCardType.FAQ;
  const handlePress = isFaq ? () => setExpanded((prev) => !prev) : onPress;

  return (
    <Pressable
      onPress={handlePress}
      disabled={!handlePress}
      accessibilityRole={handlePress ? 'button' : undefined}
      accessibilityState={isFaq ? { expanded } : undefined}
      style={({ pressed }) => [
        styles.card,
        variant.container && styles[variant.container],
        pressed && handlePress && styles.pressed,
        style,
      ]}
    >
      <Body {...props} expanded={isFaq ? expanded : undefined} />
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
    lineHeight: lineHeightFor(TYPOGRAPHY.size.base),
    color: COLORS.ink,
  },
  body: {
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
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.xs),
  },

  meter: { flexDirection: 'row', gap: SPACING.xs },
  meterSegment: { flex: 1, height: SPACING.xs, borderRadius: RADII.sm },
  meterOn: { backgroundColor: COLORS.error },
  meterOff: { backgroundColor: COLORS.disabledBg },
});
