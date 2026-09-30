import Button from '@/components/primitives/Button';
import { ButtonType, COLORS, ComponentSize, IconSet, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

const TEXT_INDENT = 42 + SPACING.sm;

// office: view from toOfficeView(); joinDisabled/disabledReason are set by the
// screen when a join check fails (closed, cutoff, banned, ticket limit).
export default function OfficeCard({ office, onJoin }) {
  const isOpen = office.open;
  const joinDisabled = office.joinDisabled || !isOpen;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.officeIcon}>
          <IconSet name={office.icon || 'business-outline'} size={22} color={COLORS.ink} />
        </View>

        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.name}>{office.name}</Text>
          <View style={styles.locationRow}>
            <IconSet name="location-outline" size={13} color={COLORS.slate} />
            <Text numberOfLines={1} style={styles.location}>{office.location}</Text>
          </View>
        </View>

        <View style={[styles.statusPill, !isOpen && styles.closedPill]}>
          <View style={[styles.statusDot, !isOpen && styles.closedDot]} />
          <Text style={[styles.statusText, !isOpen && styles.closedText]}>
            {isOpen ? 'OPEN' : 'CLOSED'}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View style={styles.queueReadout}>
          <Text style={styles.nowLabel}>NOW</Text>
          <View style={styles.ticketBadge}>
            <Text style={styles.ticketText}>{office.nowServing}</Text>
          </View>
          <Text style={styles.waiting}>{office.waiting} waiting</Text>
        </View>

        <Button
          label="JOIN"
          onPress={onJoin}
          type={ButtonType.ACCENT}
          size={ComponentSize.SM}
          disabled={joinDisabled}
          accessibilityLabel={`Join ${office.name}`}
        />
      </View>

      {!!office.disabledReason && (
        <Text style={styles.disabledReason}>{office.disabledReason}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADII.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officeIcon: {
    width: 42,
    height: 42,
    borderRadius: RADII.full,
    backgroundColor: COLORS.goldLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  location: {
    flex: 1,
    marginLeft: 4,
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: withOpacity(COLORS.success, 0.12),
    borderRadius: RADII.full,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginLeft: SPACING.xs,
  },
  closedPill: {
    backgroundColor: COLORS.disabledBg,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: RADII.full,
    backgroundColor: COLORS.success,
    marginRight: 4,
  },
  closedDot: {
    backgroundColor: COLORS.slate,
  },
  statusText: {
    color: COLORS.success,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xxs,
    letterSpacing: 0.5,
  },
  closedText: {
    color: COLORS.slate,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    marginLeft: TEXT_INDENT,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: TEXT_INDENT,
  },
  queueReadout: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    flex: 1,
  },
  nowLabel: {
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xxs,
    letterSpacing: 0.7,
    marginRight: 6,
  },
  ticketBadge: {
    backgroundColor: COLORS.gold,
    borderRadius: RADII.sm,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  ticketText: {
    color: COLORS.ink,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
  },
  waiting: {
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    marginLeft: 7,
  },
  disabledReason: {
    color: COLORS.slate,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: 16,
    marginTop: SPACING.sm,
    marginLeft: TEXT_INDENT,
  },
});
