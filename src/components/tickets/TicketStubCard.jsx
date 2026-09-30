import Badge from '@/components/shell/Badge';
import TicketStubShape, { STUB_ASPECT_RATIO } from '@/components/tickets/TicketStubShape';
import {
  COLORS,
  RADII,
  SPACING,
  TICKET_STUB_COPY,
  TICKET_STUB_THEME,
  TicketStatus,
  TYPOGRAPHY,
  withOpacity,
} from '@/constants';
import { formatCountdown } from '@/utils';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
  const theme = TICKET_STUB_THEME[status] ?? TICKET_STUB_THEME[TicketStatus.WAITING];
  const isCalled = status === TicketStatus.YOUR_TURN;
  const textColor = theme.text;
  const mutedText = withOpacity(textColor, 0.6);
  const topLabel = TICKET_STUB_COPY[status]?.topLabel;
  const timeLabel = getTimeLabel(ticket);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Ticket ${shortNumber}, ${officeName}`}
    >
      <TicketStubShape status={status} />

      <View style={styles.content}>
        <View style={styles.topHalf}>
          <View style={styles.headerRow}>
            <Text style={[styles.officeName, { color: textColor }]} numberOfLines={1}>
              {officeName}
            </Text>
            {!!timeLabel && (
              <Badge
                status={status}
                icon={status === TicketStatus.EXPIRED ? 'hourglass-outline' : 'time-outline'}
                label={timeLabel}
              />
            )}
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
    aspectRatio: STUB_ASPECT_RATIO,
    marginBottom: SPACING.lg,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  topHalf: {
    height: '50%',
    justifyContent: 'flex-start',
    gap: SPACING.xxs, // title ↔ subtitle spacing — tweak here
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