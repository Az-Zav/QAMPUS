import { useSession } from '@/hooks';
import { SessionProvider } from '@/providers/SessionProvider';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, useFonts } from '@expo-google-fonts/dm-sans';
import { ThemeProvider, useTheme } from '@qampus/ui';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ DMSans_400Regular, DMSans_500Medium, DMSans_700Bold });

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ThemeProvider>
        <SessionProvider>
          <ThemedRoot />
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Routes are exceptions to "everything is reachable": each Protected block only exists in its
// session state. A guard flip sends the user to the anchor (index), which redirects by state.
function ThemedRoot() {
  const { colors, isDark } = useTheme();
  const { isSignedIn, hasOffice } = useSession();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.paper } }}>
        <Stack.Screen name="index" />
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>
        <Stack.Protected guard={isSignedIn && !hasOffice}>
          <Stack.Screen name="not-assigned" />
        </Stack.Protected>
        <Stack.Protected guard={isSignedIn && hasOffice}>
          <Stack.Screen name="(console)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
