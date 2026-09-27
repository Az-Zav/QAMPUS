import theme from '@/theme/theme';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header({ title, hasNotification, inverted = false, onBellPress, onAvatarPress }) {
  const insets = useSafeAreaInsets();
  const logoSource = inverted
    ? require('../../../assets/images/Qampus-Logo-Inverted.png')
    : require('../../../assets/images/Qampus-Logo.png');
    return (
    <View style={[styles.container, {paddingTop: insets.top + theme.spacing.xs }, inverted && styles.invertedContainer]}>
      <View style={styles.logoGroup}>
        <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
        <Text style={[styles.title, inverted && styles.invertedTitle]}>{title}</Text>
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
  title: {
    fontSize: theme.typography.size.md,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.ink,
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
  logoImage: {
    width: 32,
    height: 32,
  },
  invertedContainer: {
    backgroundColor: 'transparent',  
  },

});