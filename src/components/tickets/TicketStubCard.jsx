import Badge from '@/components/shell/Badge';
import theme from '@/theme/theme';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

const STATE_IMAGES = {
  waiting: require('../../../assets/images/TicketStub.png'),
  yourTurn: require('../../../assets/images/TicketStub-Inverted.png'),
  expired: require('../../../assets/images/TicketStub-Expired.png'),
  inService: require('../../../assets/images/TicketStub.png'),
};

const TEXT_COLORS = {
  waiting: theme.colors.ink,
  yourTurn: theme.colors.paper,
  expired: theme.colors.ink,
  inService: theme.colors.ink,
};

const TOP_LABELS = {
  waiting: 'NEXT UP',
  expired: 'WAITING FOR STAFF',
};

function getTimeLabel({ status, estimatedWaitMinutes, remainingSeconds }) {
  if (status === 'waiting') {
    return typeof estimatedWaitMinutes === 'number' ? `${estimatedWaitMinutes} mins` : null;
  }
  if ((status === 'yourTurn' || status === 'expired') && typeof remainingSeconds === 'number') {
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  return null;
}

export default function TicketStubCard({ ticket, onPress, onOpenScanner }) {
  const { shortNumber, nowServing, officeName, location, status } = ticket;
  const isCalled = status === 'yourTurn';
  const textColor = TEXT_COLORS[status] ?? theme.colors.ink;
  const mutedText = theme.withOpacity(textColor, 0.6);
  const topLabel = TOP_LABELS[status];
  const timeLabel = getTimeLabel(ticket);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Image source={STATE_IMAGES[status]} style={styles.image} resizeMode="cover" />

      <View style={styles.content}>
        {/* Everything here sits above the printed perforation line,
            because topHalf/bottomHalf are exact 50/50 splits of the
            padded content box — whose center always equals the card's
            vertical center, which is where the asset's line lives. */}
        <View style={styles.topHalf}>
          <View style={styles.headerRow}>
            <Text style={[styles.officeName, { color: textColor }]}>{officeName}</Text>
            {timeLabel && <Text style={[styles.timeLabel, { color: mutedText }]}>{timeLabel}</Text>}
          </View>

          {(topLabel || location) && (
            <View style={styles.metaRow}>
              {topLabel && (
                <View style={styles.topPill}>
                  <Text style={styles.topPillText}>{topLabel}</Text>
                </View>
              )}
              {location && <Text style={[styles.locationText, { color: mutedText }]}>{location}</Text>}
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
              <Text style={[styles.numValue, isCalled && { color: theme.colors.gold }]}>
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
    marginBottom: theme.spacing.lg,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  topHalf: {
    height: '50%',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing.xxs,
  },
  bottomHalf: {
    height: '50%',
    justifyContent: 'space-between',
    paddingTop: theme.spacing.xxs,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  officeName: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
  timeLabel: {
    fontSize: theme.typography.size.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  topPill: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radii.full,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxxs,
  },
  topPillText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
  },
  locationText: {
    fontSize: theme.typography.size.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  numsRow: {
  flexDirection: 'row',
  alignItems: 'baseline',
  justifyContent: 'space-between',   // ← added
},
  numLabel: {
    fontSize: theme.typography.size.sm,
    fontFamily: theme.typography.fontFamily.medium,
  },
  numValue: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});