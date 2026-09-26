import theme from '@/theme/theme';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState({ title = 'Nothing here yet', message, icon = 'ticket-outline' }) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <theme.IconSet name={icon} size={24} color={theme.colors.ink} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    color: theme.colors.ink,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.size.md,
    textAlign: 'center',
  },
  message: {
    marginTop: theme.spacing.xs,
    color: theme.colors.slate,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.size.sm,
    lineHeight: 18,
    textAlign: 'center',
  },
});
