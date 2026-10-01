import Button from '@/components/primitives/Button';
import Badge from '@/components/primitives/Badge';
import ModalShell from '@/components/modals/ModalShell';
import { ButtonType, ComponentSize, lineHeightFor, MODAL_COPY, SPACING, TicketStatus, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { formatCountdown } from '@/utils';
import { StyleSheet, Text, View } from 'react-native';

const COPY = MODAL_COPY.ticket;

function detailRows({ status, position, peopleAhead, nowServing, estimatedWaitMinutes }) {
  if (status === TicketStatus.WAITING) {
    return [
      { label: COPY.positionLabel, value: COPY.positionValue(position) },
      { label: COPY.aheadLabel, value: peopleAhead },
      { label: COPY.nowServingLabel, value: nowServing },
      { label: COPY.waitLabel, value: COPY.waitValue(estimatedWaitMinutes) },
    ];
  }
  return [{ label: COPY.nowServingLabel, value: nowServing }];
}

// ticket: view from toTicketView(). Opened from a Home ticket card.
export default function TicketModal({ visible, ticket, onClose, onCancel, onOpenScanner }) {
  const styles = useThemedStyles(makeStyles);
  const status = ticket?.status;
  const isCalled = status === TicketStatus.YOUR_TURN;
  const isExpired = status === TicketStatus.EXPIRED;
  const canCancel = status !== TicketStatus.IN_SERVICE;

  return (
    <ModalShell
      visible={visible && !!ticket}
      onClose={onClose}
      title={ticket?.shortNumber}
      subtitle={ticket?.officeName}
      rows={ticket ? detailRows(ticket) : null}
      actions={
        <>
          {isCalled && <Button type={ButtonType.PRIMARY} label={COPY.scanLabel} onPress={onOpenScanner} />}
          {canCancel && <Button type={ButtonType.SECONDARY} label={COPY.cancelLabel} onPress={onCancel} />}
        </>
      }
    >
      {!!ticket && (
        <View style={styles.statusBlock}>
          <Badge status={status} size={ComponentSize.MD} />
          {(isCalled || isExpired) && (
            <Text style={[styles.countdown, isExpired && styles.expired]}>
              {formatCountdown(ticket.remainingSeconds ?? 0)}
            </Text>
          )}
          {isExpired && (
            <Text style={styles.expiredWarning}>{COPY.expiredWarning}</Text>
          )}
        </View>
      )}
    </ModalShell>
  );
}

const makeStyles = (c) => StyleSheet.create({
  statusBlock: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  countdown: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: c.gold,
  },
  expired: {
    color: c.error,
  },
  expiredWarning: {
    color: c.error,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.sm),
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    textAlign: 'center',
  },
});
