import Badge from '@/components/shell/Badge';
import { COLORS, RADII, SPACING, TicketStatus, TYPOGRAPHY, withOpacity } from '@/constants';
import { formatCountdown } from '@/utils';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const STUB_IMAGES = {
  default: require('../../../assets/images/TicketStub.png'),
  inverted: require('../../../assets/images/TicketStub-Inverted.png'),
  expired: require('../../../assets/images/TicketStub-Expired.png'),
};

// Per-status look for the three active states shown on Home (R-08b)
const APPEARANCE = {
  [TicketStatus.WAITING]: { image: STUB_IMAGES.default, text: COLORS.ink, topLabel: 'NEXT UP' },
  [TicketStatus.YOUR_TURN]: { image: STUB_IMAGES.inverted, text: COLORS.paper, topLabel: null },
  [TicketStatus.EXPIRED]: { image: STUB_IMAGES.expired, text: COLORS.ink, topLabel: 'WAITING FOR STAFF' },
  [TicketStatus.IN_SERVICE]: { image: STUB_IMAGES.default, text: COLORS.ink, topLabel: null },
};

function getTimeLabel({ status, estimatedWaitMinutes, remainingSeconds }) {
  if (status === TicketStatus.WAITING && typeof estimatedWaitMinutes === 'number') {
    return `${estimatedWaitMinutes} mins`;
  }
  if (typeof remainingSeconds === 'number') {
    return formatCountdown(remainingSeconds);
  }
  return null;
}

// ticket: view from toTicketView()
export default function TicketStubCard({ ticket, onPress, onOpenScanner }) {
  const { shortNumber, nowServing, officeName, location, status } = ticket;
  const appearance = APPEARANCE[status] ?? APPEARANCE[TicketStatus.WAITING];
  const isCalled = status === TicketStatus.YOUR_TURN;
  const textColor = appearance.text;
  const mutedText = withOpacity(textColor, 0.6);
  const topLabel = appearance.topLabel;
  const timeLabel = getTimeLabel(ticket);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Ticket ${shortNumber}, ${officeName}`}
    >
      <Image source={appearance.image} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.topHalf}>
          <View style={styles.headerRow}>
            <Text style={[styles.officeName, { color: textColor }]} numberOfLines={1}>
              {officeName}
            </Text>
            {!!timeLabel && <Text style={[styles.timeLabel, { color: mutedText }]}>{timeLabel}</Text>}
          </View>

          {(!!topLabel || !!location) && (
            <View style={styles.metaRow}>
              {!!topLabel && (
                <View style={styles.topPill}>
                  <Text style={styles.topPillText}>{topLabel}</Text>
                </View>
              )}
              {!!location && (
                <Text style={[styles.locationText, { color: mutedText }]} numberOfLines={1}>
                  {location}
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomHalf}>
          <View style={styles.numsRow}>
            <Text style={[styles.numLabel, { color: textColor }]}>
              NOW <Text style={styles.numValue}>{nowServing}</Text>
            </Text>
            <Text style={[styles.numLabel, styles.separator, { color: mutedText }]}>|</Text>
            <Text style={[styles.numLabel, { color: textColor }]}>
              YOURS{' '}
              <Text style={[styles.numValue, isCalled && { color: COLORS.gold }]}>
                {shortNumber}
              </Text>
            </Text>
          </View>

          <View style={styles.footer}>
            <Badge status={status} />
            {isCalled && <Badge icon="qr-code" label="Open scanner" onPress={onOpenScanner} />}
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 180,
    marginBottom: SPACING.lg,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  topHalf: {
    height: '50%',
    justifyContent: 'space-between',
    paddingBottom: SPACING.xxs,
  },
  bottomHalf: {
    height: '50%',
    justifyContent: 'space-between',
    paddingTop: SPACING.xxs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  officeName: {
    fontSize: TYPOGRAPHY.size.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    flex: 1,
    marginRight: SPACING.sm,
  },
  timeLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  topPill: {
    backgroundColor: COLORS.gold,
    borderRadius: RADII.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxxs,
  },
  topPillText: {
    fontSize: TYPOGRAPHY.size.xs,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.ink,
  },
  locationText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    flex: 1,
  },
  numsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  numLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
  },
  separator: {
    marginHorizontal: SPACING.xs,
  },
  numValue: {
    fontSize: TYPOGRAPHY.size.lg,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});