import Button from '@/components/primitives/Button';
import ModalShell from '@/components/shell/ModalShell';
import { ButtonType, COLORS, IconSet, SPACING, TYPOGRAPHY } from '@/constants';
import { StyleSheet, Text, View } from 'react-native';

export default function CalledModal({ visible, ticket, onClose, onOpenScanner }) {
  if (!ticket) return null;

  const { shortNumber, officeName } = ticket;

  return (
    <ModalShell visible={visible} onClose={onClose} showClose>
      <View style={styles.iconWrapper}>
        <IconSet name="notifications" color={COLORS.gold} size={28} />
      </View>

      <Text style={styles.title}>It's your turn</Text>
      <Text style={styles.subtitle}>
        Head to {officeName} and scan the code within 1:00
      </Text>

      <Text style={styles.number}>{shortNumber}</Text>
      <Text style={styles.countdown}>1:00</Text>

      <Button type={ButtonType.PRIMARY} label="Open scanner" onPress={onOpenScanner} />
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: TYPOGRAPHY.size.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.size.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.slate,
    textAlign: 'center',
    marginTop: SPACING.xxs,
    marginBottom: SPACING.lg,
  },
  number: {
    fontSize: TYPOGRAPHY.size.xl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.ink,
    textAlign: 'center',
  },
  countdown: {
    fontSize: TYPOGRAPHY.size.xxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
});