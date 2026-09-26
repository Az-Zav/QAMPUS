import theme from '@/theme/theme';
import { Pressable, View } from 'react-native';
import Badge from './Badge';

export default function Header({ unreadCount, onAvatar, onBell }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.paper,
      }}
    >
      <Pressable onPress={onAvatar}>{/* avatar icon */}</Pressable>
      <Pressable onPress={onBell}>
        {/* bell icon */}
        {unreadCount > 0 && <Badge status="yourTurn" size="sm" />}
      </Pressable>
    </View>
  );
}