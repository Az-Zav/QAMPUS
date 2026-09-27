import Button from '@/components/primitives/Button';
import theme from '@/theme/theme';
import { ButtonType } from '@/theme/types';
import { StyleSheet, Text, View } from 'react-native';

// Icon badge width + the gap after it — used to indent the row below the
// divider so its text lines up with the office name/location above it.
const TEXT_INDENT = 42 + theme.spacing.sm;

export default function OfficeCard({ office, onJoin }) {
  if (!office) return null;

  const isOpen = office.open !== false;
  const joinDisabled = office.joinDisabled || !isOpen;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.officeIcon}>
          <theme.IconSet name={office.icon || 'business-outline'} size={22} color={theme.colors.ink} />
        </View>

        <View style={styles.info}>
          <Text numberOfLines={2} style={styles.name}>{office.name}</Text>
          <View style={styles.locationRow}>
            <theme.IconSet name="location-outline" size={13} color={theme.colors.slate} />
            <Text numberOfLines={1} style={styles.location}>{office.location || 'Location not listed'}</Text>
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
            <Text style={styles.ticketText}>{office.nowServing || '--'}</Text>
          </View>
          <Text style={styles.waiting}>{office.waiting ?? 0} waiting</Text>
        </View>

        <Button
          label="JOIN"
          onPress={onJoin}
          type={joinDisabled ? ButtonType.DISABLED : ButtonType.ACCENT}
          size="sm"
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
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  officeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF4CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.base,
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
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.xs,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4EC',
    borderRadius: theme.radii.full,
    paddingHorizontal: 7,
    paddingVertical: 4,
    marginLeft: theme.spacing.xs,
  },
  closedPill: {
    backgroundColor: theme.colors.disabledBg,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginRight: 4,
  },
  closedDot: {
    backgroundColor: theme.colors.slate,
  },
  statusText: {
    color: theme.colors.success,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  closedText: {
    color: theme.colors.slate,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
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
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 9,
    letterSpacing: 0.7,
    marginRight: 6,
  },
  ticketBadge: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  ticketText: {
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xs,
  },
  waiting: {
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.xs,
    marginLeft: 7,
  },
  disabledReason: {
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.xs,
    lineHeight: 16,
    marginTop: theme.spacing.sm,
    marginLeft: TEXT_INDENT,
  },
});
