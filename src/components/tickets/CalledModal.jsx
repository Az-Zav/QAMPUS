import Button from '@/components/primitives/Button';
import ModalShell from '@/components/shell/ModalShell';
import theme from '@/theme/theme';
import { ButtonType } from '@/theme/types';
import { StyleSheet, Text, View } from 'react-native';

export default function CalledModal({ visible, ticket, onClose, onOpenScanner }) {
  if (!ticket) return null;

  const { shortNumber, officeName } = ticket;

  return (
    <ModalShell visible={visible} onClose={onClose} showClose>
      <View style={styles.iconWrapper}>
        <theme.IconSet name="notifications" color={theme.colors.gold} size={28} />
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
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.size.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.slate,
    textAlign: 'center',
    marginTop: theme.spacing.xxs,
    marginBottom: theme.spacing.lg,
  },
  number: {
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
    textAlign: 'center',
  },
  countdown: {
    fontSize: theme.typography.size.xxl,
    fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.gold,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});