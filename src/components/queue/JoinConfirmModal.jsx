import Button from '@/components/primitives/Button';
import DetailRow from '@/components/shell/DetailRow';
import ModalShell from '@/components/shell/ModalShell';
import { ButtonType, COLORS, IconSet, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function JoinConfirmModal({ visible, office, estimatedWait, peopleWaiting, onClose, onConfirm }) {
  if (!office) return null;

  return (
    <ModalShell visible={visible} onClose={onClose} showClose>
      <View style={styles.iconWrapper}>
        <IconSet name="ticket-outline" color={COLORS.gold} size={28} />
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
  iconWrapper: {
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    color: COLORS.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.slate,
    textAlign: 'center',
    marginTop: SPACING.xxs,
    marginBottom: SPACING.lg,
  },
  rowsBlock: {
    marginBottom: SPACING.xl,
    gap: SPACING.xs,
  },
  actions: {
    gap: SPACING.sm,
  },
});