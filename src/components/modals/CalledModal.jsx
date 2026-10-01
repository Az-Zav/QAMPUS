import Button from '@/components/primitives/Button';
import ModalShell from '@/components/modals/ModalShell';
import { ButtonType, MODAL_COPY, SPACING, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { formatCountdown } from '@/utils';
import { StyleSheet, Text, View } from 'react-native';

const COPY = MODAL_COPY.called;

// ticket: view from toTicketView(), status YOUR_TURN. Shown app-wide when a ticket is called.
export default function CalledModal({ visible, ticket, onClose, onOpenScanner }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <ModalShell
      visible={visible && !!ticket}
      onClose={onClose}
      icon={COPY.icon}
      title={COPY.title}
      subtitle={ticket ? COPY.body(ticket.officeName) : null}
      actions={<Button type={ButtonType.PRIMARY} label={COPY.scanLabel} onPress={onOpenScanner} />}
    >
      {!!ticket && (
        <View style={styles.numbers}>
          <Text style={styles.number}>{ticket.shortNumber}</Text>
          <Text style={styles.countdown}>{formatCountdown(ticket.remainingSeconds ?? 0)}</Text>
        </View>
      )}
    </ModalShell>
  );
}

const makeStyles = (c) => StyleSheet.create({
  numbers: {
    alignItems: 'center',
    gap: SPACING.xxs,
  },
  number: {
    fontSize: TYPOGRAPHY.size.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: c.ink,
  },
  countdown: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: c.gold,
  },
});
