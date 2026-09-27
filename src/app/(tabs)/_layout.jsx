import BottomNav from '@/components/shell/BottomNav';
import theme from '@/theme/theme';
import { Slot, usePathname, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const active = pathname.includes('queue')
    ? 'queue'
    : pathname.includes('scan')
    ? 'scan'
    : 'home';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Slot />
      </View>
      <BottomNav active={active} onNavigate={(tab) => router.push(`/${tab}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.paper,
  },
  content: {
    flex: 1,
    paddingBottom: 90,
  },
});