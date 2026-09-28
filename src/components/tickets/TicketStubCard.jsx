import Badge from '@/components/shell/Badge';
import { COLORS, RADII, SPACING, TYPOGRAPHY, withOpacity } from '@/constants';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const STATE_IMAGES = {
  waiting: require('../../../assets/images/TicketStub.png'),
  yourTurn: require('../../../assets/images/TicketStub-Inverted.png'),
  called: require('../../../assets/images/TicketStub-Inverted.png'),
  expired: require('../../../assets/images/TicketStub-Expired.png'),
  inService: require('../../../assets/images/TicketStub.png'),
};

const TEXT_COLORS = {
  waiting: COLORS.ink,
  yourTurn: COLORS.paper,
  called: COLORS.paper,
  expired: COLORS.ink,
  inService: COLORS.ink,
};

const TOP_LABELS = {
  waiting: 'NEXT UP',
  expired: 'WAITING FOR STAFF',
};

function getTimeLabel({ status, estimatedWaitMinutes, remainingSeconds }) {
  if (status === 'waiting') {
    return typeof estimatedWaitMinutes === 'number' ? `${estimatedWaitMinutes} mins` : null;
  }
  if ((status === 'yourTurn' || status === 'called' || status === 'expired') && typeof remainingSeconds === 'number') {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  return null;
}

export default function TicketStubCard({ ticket, onPress, onOpenScanner }) {
  const { shortNumber, nowServing, officeName, location, status } = ticket;
  const isCalled = status === 'yourTurn' || status === 'called';
  const textColor = TEXT_COLORS[status] ?? COLORS.ink;
  const mutedText = withOpacity(textColor, 0.6);
  const topLabel = TOP_LABELS[status];
  const timeLabel = getTimeLabel(ticket);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={STATE_IMAGES[status] ?? STATE_IMAGES.waiting} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        <View style={styles.topHalf}>
          <View style={styles.headerRow}>
            <Text style={[styles.officeName, { color: textColor }]} numberOfLines={1}>
              {officeName}
            </Text>
            {timeLabel && <Text style={[styles.timeLabel, { color: mutedText }]}>{timeLabel}</Text>}
          </View>

          {(topLabel || location) && (
            <View style={styles.metaRow}>
              {topLabel && (
                <View style={styles.topPill}>
                  <Text style={styles.topPillText}>{topLabel}</Text>
                </View>
              )}
              {location && (
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
            <Badge status={status} size="sm" />
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