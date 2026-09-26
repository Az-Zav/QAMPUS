import ModalShell from '@/components/shell/ModalShell';
import theme from '@/theme/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function NoticeModal({
  visible,
  title,
  message,
  buttonLabel = 'OK',
  icon = 'information-circle-outline',
  destructive = false,
  onClose,
}) {
  return (
    <ModalShell visible={visible} onClose={onClose}>
      <View style={[styles.iconCircle, destructive && styles.destructiveCircle]}>
        <theme.IconSet
          name={icon}
          size={25}
          color={destructive ? theme.colors.error : theme.colors.ink}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable
        onPress={onClose}
        style={[styles.button, destructive && styles.destructiveButton]}
      >
        <Text style={[styles.buttonText, destructive && styles.destructiveText]}>
          {buttonLabel}
        </Text>
      </Pressable>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  destructiveCircle: {
    backgroundColor: '#FCE8E6',
  },
  title: {
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.xl,
  },
  message: {
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    lineHeight: 20,
    marginTop: theme.spacing.sm,
  },
  button: {
    minHeight: 48,
    backgroundColor: theme.colors.gold,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  destructiveButton: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  buttonText: {
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.sm,
  },
  destructiveText: {
    color: theme.colors.error,
  },
});
