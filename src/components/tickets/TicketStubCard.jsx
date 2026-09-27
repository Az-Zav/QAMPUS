import Button from '@/components/primitives/Button';
import Badge from '@/components/shell/Badge';
import theme from '@/theme/theme';
import { ButtonType, TicketStatus } from '@/theme/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const STATE_STYLES = {
  [TicketStatus.WAITING]: { cardBg: theme.colors.paper, border: null, textPrimary: theme.colors.ink, textSecondary: theme.colors.slate },
  [TicketStatus.YOUR_TURN]: { cardBg: theme.colors.ink, border: null, textPrimary: theme.colors.paper, textSecondary: theme.colors.slate },
  [TicketStatus.EXPIRED]: { cardBg: theme.colors.paper, border: theme.colors.error, textPrimary: theme.colors.ink, textSecondary: theme.colors.slate },
  [TicketStatus.IN_SERVICE]: { cardBg: theme.colors.paper, border: null, textPrimary: theme.colors.ink, textSecondary: theme.colors.slate },
};

export default function TicketStubCard({ ticket, nextUp, onPress, onOpenScanner }) {
  const { shortNumber, nowServing, officeName, location, status, estimatedWaitMinutes } = ticket;
  const style = STATE_STYLES[status] || STATE_STYLES[TicketStatus.WAITING];
  const isInService = status === TicketStatus.IN_SERVICE;
  const isCalled = status === TicketStatus.YOUR_TURN;
  const isExpired = status === TicketStatus.EXPIRED;

  const CardWrapper = isInService ? View : Pressable;

  return (
    <View style={styles.shadowWrapper}>
      <CardWrapper
        onPress={!isInService ? onPress : undefined}
        style={[
          styles.card,
          { backgroundColor: style.cardBg },
          style.border && { borderWidth: 1.5, borderColor: style.border },
        ]}
      >
        {/* Top section */}
        <View style={styles.topSection}>
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

        {/* Notch divider */}
        <View style={styles.notchRow}>
          <View style={styles.notchLeft} />
          <View style={styles.dashedLine} />
          <View style={styles.notchRight} />
        </View>

        {/* Bottom section */}
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
              <Button type={ButtonType.PRIMARY} label="Open scanner" onPress={onOpenScanner} />
            )}
          </View>
        </View>
      </CardWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    borderRadius: theme.radii.hero,
    marginBottom: theme.spacing.md,
    ...theme.elevation.md,
  },
  card: {
    borderRadius: theme.radii.hero,
    overflow: 'hidden',
  },
  topSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  officeName: {
    fontSize: theme.typography.size.lg,
    fontFamily: theme.typography.fontFamily.bold,
  },
  timeText: {
    fontSize: theme.typography.size.md,
    fontFamily: theme.typography.fontFamily.medium,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: theme.typography.size.xs,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
  },
  location: {
    fontSize: theme.typography.size.base,
    fontFamily: theme.typography.fontFamily.regular,
  },
  notchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginHorizontal: -10,
  },
  dashedLine: {
    flex: 1,
    borderStyle: 'dashed',
    borderTopWidth: 1.5,
    borderColor: theme.colors.border,
    marginHorizontal: 4,
  },
  notchLeft: {
    width: 20,
    height: 20,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.paper,
  },
  notchRight: {
    width: 20,
    height: 20,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.paper,
  },
  bottomSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  ticketBlock: {
    flex: 1,
  },
  label: {
    fontSize: theme.typography.size.xs,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: 4,
  },
  ticketNum: {
    fontSize: theme.typography.size.xl,
    fontFamily: theme.typography.fontFamily.bold,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: theme.withOpacity(theme.colors.slate, 0.25),
    marginHorizontal: theme.spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});