import Button from '@/components/primitives/Button';
import ModalShell from '@/components/shell/ModalShell';
import theme from '@/theme/theme';
import { ButtonType } from '@/theme/types';
import { StyleSheet, Text, View } from 'react-native';

function DetailRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function JoinConfirmModal({ visible, office, estimatedWait, peopleWaiting, onClose, onConfirm }) {
  if (!office) return null;

  return (
    <ModalShell visible={visible} onClose={onClose} showClose>
      <View style={styles.iconWrapper}>
        <theme.IconSet name="ticket-outline" color={theme.colors.gold} size={28} />
      </View>

      <Text style={styles.title}>Join this queue?</Text>
      <Text style={styles.subtitle}>{office.name}</Text>

      <View style={styles.rowsBlock}>
        <DetailRow label="Estimated wait" value={estimatedWait} />
        <DetailRow label="People waiting" value={peopleWaiting} />
      </View>

      <View style={styles.actions}>
        <Button label="Confirm join" type={ButtonType.PRIMARY} onPress={onConfirm} />
        <Button label="Cancel" type={ButtonType.SECONDARY} onPress={onClose} />
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  iconWrapper: { alignSelf: 'center', marginBottom: theme.spacing.sm },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xl,
    color: theme.colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    color: theme.colors.slate,
    textAlign: 'center',
    marginTop: theme.spacing.xxs,
    marginBottom: theme.spacing.lg,
  },
  rowsBlock: {
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    fontSize: theme.typography.size.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.slate,
  },
  rowValue: {
    fontSize: theme.typography.size.sm,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
  },
  actions: {
    gap: theme.spacing.sm,
  },
});