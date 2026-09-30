import BottomNav from '@/components/shell/BottomNav';
import { COLORS } from '@/constants';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

// Header-level destinations (Profile, Notifications and their sub-pages) keep the
// bottom nav visible with no tab active — Figma Nav/Bottom "Active=None".
export default function ProfileLayout() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: COLORS.paper },
        }}
      />
      <BottomNav onNavigate={(tab) => router.push(`/${tab}`)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.paper },
});
