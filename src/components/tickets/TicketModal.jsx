import Button from '@/components/primitives/Button';
import Badge from '@/components/shell/Badge';
import ModalShell from '@/components/shell/ModalShell';
import theme from '@/theme/theme';
import { ButtonType } from '@/theme/types';
import { StyleSheet, Text, View } from 'react-native';

export default function TicketModal({ visible, ticket, onClose, onCancel, onOpenScanner }) {
  if (!ticket) return null;

  const { shortNumber, officeName, status, position, peopleAhead, nowServing, estimatedWaitMinutes } = ticket;

  const isWaiting = status === 'waiting';
  const isCalled = status === 'yourTurn';
  const isExpired = status === 'expired';
  const isInService = status === 'inService';

  return (
    <ModalShell visible={visible} onClose={onClose} showClose>
      <Text style={styles.number}>{shortNumber}</Text>
      <Text style={styles.office}>{officeName}</Text>

      <Badge status={status} size="base" />

      {isWaiting && (
        <View style={styles.detailsBlock}>
          <DetailRow label="Position" value={`${position} in line`} />
          <DetailRow label="People ahead" value={peopleAhead} />
          <DetailRow label="Now serving" value={nowServing} />
          <DetailRow label="Estimated wait" value={`about ${estimatedWaitMinutes} min`} />
        </View>
      )}

      {isCalled && <Text style={styles.countdown}>1:00</Text>}

      {isExpired && (
        <Text style={styles.expiredWarning}>
          Your time to check in has passed. Staff will update your ticket.
        </Text>
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

function DetailRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  number: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
    textAlign: 'center',
  },
  office: {
    fontSize: theme.typography.size.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.slate,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailsBlock: {
    marginTop: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: theme.colors.slate,
    fontSize: theme.typography.size.base,
    fontFamily: theme.typography.fontFamily.regular,
  },
  rowValue: {
    color: theme.colors.ink,
    fontSize: theme.typography.size.base,
    fontWeight: theme.typography.weight.medium,
    fontFamily: theme.typography.fontFamily.medium,
  },
  countdown: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.gold,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
  expiredWarning: {
    color: theme.colors.error,
    fontSize: theme.typography.size.sm,
    fontFamily: theme.typography.fontFamily.regular,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
});