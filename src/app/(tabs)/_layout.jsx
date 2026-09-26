import BottomNav from '@/components/shell/BottomNav';
import { Slot, usePathname, useRouter } from 'expo-router';
import { View } from 'react-native';

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const active = pathname.includes('queue')
    ? 'queue'
    : pathname.includes('scan')
    ? 'scan'
    : 'home';

  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <BottomNav active={active} onNavigate={(tab) => router.push(`/${tab}`)} />
    </View>
  );
}