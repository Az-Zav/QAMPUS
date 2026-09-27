import ModalShell from '@/components/shell/ModalShell';
import Button from '@/components/primitives/Button';
import theme from '@/theme/theme';
import { ButtonType } from '@/theme/types';
import { StyleSheet, Text, View } from 'react-native';

export default function JoinConfirmModal({ visible, office, estimatedWait, onClose, onConfirm }) {
  if (!office) return null;

  return (
    <ModalShell visible={visible} onClose={onClose}>
      <Text style={styles.title}>Join Queue</Text>
      <Text style={styles.subtitle}>Confirm joining line for {office.name}</Text>
      <Text style={styles.wait}>Estimated wait: {estimatedWait}</Text>

      <View style={styles.actions}>
        <Button label="Cancel" type={ButtonType.GHOST} onPress={onClose} />
        <Button label="Confirm" type={ButtonType.ACCENT} onPress={onConfirm} />
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xl,
    color: theme.colors.ink,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    color: theme.colors.slate,
    marginTop: theme.spacing.xs,
  },
  wait: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.size.sm,
    color: theme.colors.ink,
    marginTop: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
});
