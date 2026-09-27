import Badge from '@/components/shell/Badge';
import theme from '@/theme/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const CORNER_RADIUS = theme.radii.hero; // 44
const NOTCH_RADIUS = 12;

function buildTicketPath(width, height, r, notchR, notchY) {
  return `
    M ${r},0
    H ${width - r}
    A ${r},${r} 0 0 1 ${width},${r}
    V ${notchY - notchR}
    A ${notchR},${notchR} 0 0 0 ${width},${notchY + notchR}
    V ${height - r}
    A ${r},${r} 0 0 1 ${width - r},${height}
    H ${r}
    A ${r},${r} 0 0 1 0,${height - r}
    V ${notchY + notchR}
    A ${notchR},${notchR} 0 0 0 0,${notchY - notchR}
    V ${r}
    A ${r},${r} 0 0 1 ${r},0
    Z
  `;
}

const STATE_STYLES = {
  waiting: { fill: theme.colors.paper, border: theme.colors.border, textPrimary: theme.colors.ink, textSecondary: theme.colors.slate },
  yourTurn: { fill: theme.colors.ink, border: theme.colors.border, textPrimary: theme.colors.paper, textSecondary: theme.colors.slate },
  expired: { fill: theme.colors.paper, border: theme.colors.error, textPrimary: theme.colors.ink, textSecondary: theme.colors.slate },
  inService: { fill: theme.colors.paper, border: theme.colors.border, textPrimary: theme.colors.ink, textSecondary: theme.colors.slate },
};

export default function TicketStubCard({ ticket, nextUp, onPress, onOpenScanner }) {
  const { shortNumber, nowServing, officeName, location, status, estimatedWaitMinutes } = ticket;
  const style = STATE_STYLES[status] || STATE_STYLES.waiting;
  const isInService = status === 'inService';
  const isCalled = status === 'yourTurn';
  const isExpired = status === 'expired';

  const CardWrapper = isInService ? View : Pressable;

  // Determine standard height and notch midpoint with comfortable margins
  const cardHeight = 220;
  const notchY = 100;

  return (
    <View style={styles.shadowWrapper}>
      <CardWrapper onPress={!isInService ? onPress : undefined} style={[styles.cardTouchArea, { height: cardHeight }]}>
        {/* SVG background shape */}
        <Svg
          width="100%"
          height={cardHeight}
          viewBox={`0 0 350 ${cardHeight}`}
          style={StyleSheet.absoluteFill}
        >
          <Path
            d={buildTicketPath(350, cardHeight, CORNER_RADIUS, NOTCH_RADIUS, notchY)}
            fill={style.fill}
            stroke={style.border ?? 'none'}
            strokeWidth={style.border ? 1.5 : 0}
          />
        </Svg>

        {/* Content Flow */}
        <View style={[styles.content, { height: cardHeight }]}>
          {/* Top Half */}
          <View style={[styles.topSection, { height: notchY }]}>
            <View style={styles.topRow}>
              <Text style={[styles.officeName, { color: style.textPrimary }]}>{officeName}</Text>
              {!isInService && (
                <Text style={[styles.timeText, { color: isExpired ? theme.colors.error : style.textPrimary }]}>
                  {isCalled || isExpired ? '1:00' : `${estimatedWaitMinutes} mins`}
                </Text>
              )}
            </View>

            <View style={styles.subRow}>
              {nextUp && !isCalled && !isExpired && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>NEXT UP</Text>
                </View>
              )}
              {isExpired && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>WAITING FOR STAFF</Text>
                </View>
              )}
              <Text style={[styles.location, { color: style.textSecondary }]}>{location}</Text>
            </View>
          </View>

          {/* Dashed Separator Line */}
          <View
            style={[
              styles.dashedLine,
              { borderColor: isCalled ? theme.withOpacity(theme.colors.paper, 0.25) : theme.colors.border },
            ]}
          />

          {/* Bottom Half */}
          <View style={styles.bottomSection}>
            <View style={styles.bottomRow}>
              <View style={styles.ticketBlock}>
                <Text style={[styles.label, { color: style.textSecondary }]}>NOW</Text>
                <Text style={[styles.ticketNum, { color: style.textPrimary }]}>{nowServing}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.ticketBlock}>
                <Text style={[styles.label, { color: style.textSecondary }]}>YOURS</Text>
                <Text style={[styles.ticketNum, { color: isCalled ? theme.colors.gold : style.textPrimary }]}>
                  {shortNumber}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Badge status={status} size="sm" />
              {isCalled && (
                <Badge icon="qr-code" label="Open scanner" onPress={onOpenScanner} />
              )}
            </View>
          </View>
        </View>
      </CardWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: CORNER_RADIUS,
    marginBottom: theme.spacing.lg,
    ...theme.elevation.md,
  },
  cardTouchArea: {
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topSection: {
    paddingHorizontal: theme.spacing.xl, // 24px inner margin from notch edge
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  officeName: {
    fontSize: theme.typography.size.lg,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
  timeText: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  tag: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
  },
  location: {
    fontSize: theme.typography.size.base,
    fontFamily: theme.typography.fontFamily.regular,
  },
  dashedLine: {
    marginHorizontal: theme.spacing.xl, // Retained inside notch cutouts
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    justifyContent: 'space-between',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  ticketBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontWeight: theme.typography.weight.medium,
    fontFamily: theme.typography.fontFamily.medium,
  },
  ticketNum: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: theme.withOpacity(theme.colors.slate, 0.25),
    marginHorizontal: theme.spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
});