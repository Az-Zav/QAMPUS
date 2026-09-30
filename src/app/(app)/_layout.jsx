import BottomNav from '@/components/shell/BottomNav';
import { AppTab, COLORS } from '@/constants';
import { Stack, usePathname, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

const TAB_PATHS = { '/home': AppTab.HOME, '/scan': AppTab.SCAN, '/queue': AppTab.QUEUE };

// Signed-in shell: one BottomNav over a stack of the tabs and the header-level pages
// (Profile, Notifications and their sub-pages). Pages slide in beneath the bar, which
// never moves; on those pages no tab is active — Figma Nav/Bottom "Active=None".
export default function AppLayout() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: COLORS.paper },
        }}
      />
      <BottomNav active={TAB_PATHS[pathname]} onNavigate={(tab) => router.navigate(`/${tab}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
});
