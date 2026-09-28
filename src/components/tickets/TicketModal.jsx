import Button from '@/components/primitives/Button';
import Badge from '@/components/shell/Badge';
import DetailRow from '@/components/shell/DetailRow';
import ModalShell from '@/components/shell/ModalShell';
import { ButtonType, COLORS, SPACING, TicketStatus, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function TicketModal({ visible, ticket, onClose, onCancel, onOpenScanner }) {
  if (!ticket) return null;

  const { shortNumber, officeName, status, position, peopleAhead, nowServing, estimatedWaitMinutes } = ticket;

  const isWaiting = status === TicketStatus.WAITING;
  const isCalled = status === TicketStatus.YOUR_TURN || status === 'called';
  const isExpired = status === TicketStatus.EXPIRED;
  const isInService = status === TicketStatus.IN_SERVICE;

  return (
    <ModalShell visible={visible} onClose={onClose} showClose>
      <Text style={styles.number}>{shortNumber}</Text>
      <Text style={styles.office}>{officeName}</Text>

      <View style={styles.badgeWrapper}>
        <Badge status={status} size="base" />
      </View>

      {isWaiting && (
        <View style={styles.detailsBlock}>
          <DetailRow label="Position" value={`${position} in line`} />
          <DetailRow label="People ahead" value={peopleAhead} />
          <DetailRow label="Now serving" value={nowServing} />
          <DetailRow label="Estimated wait" value={`about ${estimatedWaitMinutes} min`} />
        </View>
      )}

      {isCalled && (
        <>
          <Text style={styles.countdown}>1:00</Text>
          <View style={styles.detailsBlock}>
            <DetailRow label="Now serving" value={nowServing} />
          </View>
        </>
      )}

      {isExpired && (
        <>
          <Text style={styles.countdownExpired}>0:00</Text>
          <Text style={styles.expiredWarning}>
            Your time to check in has passed. Staff will update your ticket.
          </Text>
          <View style={styles.detailsBlock}>
            <DetailRow label="Now serving" value={nowServing} />
          </View>
        </>
      )}

      {isCalled && (
        <Button type={ButtonType.PRIMARY} label="Open scanner" onPress={onOpenScanner} />
      )}

      {!isInService && (
        <Button type={ButtonType.SECONDARY} label="Cancel ticket" onPress={onCancel} />
      )}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  number: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.ink,
    textAlign: 'center',
  },
  office: {
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.slate,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  detailsBlock: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  countdown: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.gold,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  countdownExpired: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.lg,
  },
  expiredWarning: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  badgeWrapper: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
});