import theme from '@/theme/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function Header({ title, hasNotification, onBellPress, onAvatarPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.logoGroup}>
        <View style={styles.logoBadge}>
          <theme.IconSet name="ticket" color={theme.colors.ink} size={18} />
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onBellPress} style={styles.iconButton}>
          <theme.IconSet name="notifications-outline" color={theme.colors.ink} size={22} />
          {hasNotification && <View style={styles.dot} />}
        </Pressable>
        <Pressable onPress={onAvatarPress} style={styles.avatar}>
          <theme.IconSet name="person" color={theme.colors.paper} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.paper,
  },
  logoGroup: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
  logoBadge: {
    width: 28, height: 28, borderRadius: theme.radii.sm,
    backgroundColor: theme.colors.gold, justifyContent: 'center', alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.size.md, fontWeight: theme.typography.weight.bold,
    fontFamily: theme.typography.fontFamily.bold, color: theme.colors.ink,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  iconButton: { position: 'relative' },
  dot: {
    position: 'absolute', top: -2, right: -2, width: 8, height: 8,
    borderRadius: theme.radii.full, backgroundColor: theme.colors.gold,
  },
  avatar: {
    width: 32, height: 32, borderRadius: theme.radii.full,
    backgroundColor: theme.colors.ink, justifyContent: 'center', alignItems: 'center',
  },
});