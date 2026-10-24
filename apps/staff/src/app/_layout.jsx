import { THEMES } from '@/constants';
import { useSession } from '@/hooks';
import { QueueProvider } from '@/providers/QueueProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { OfficeProvider } from '@/providers/OfficeProvider';

import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts,
} from '@expo-google-fonts/dm-sans';
import { Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_500Medium, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { ThemeProvider, useTheme } from '@qampus/ui';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    SpaceGrotesk_700Bold,
    JetBrainsMono_500Medium,
    JetBrainsMono_700Bold,
    Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <ThemeProvider themes={THEMES}>
        <SessionProvider>
          <OfficeProvider>
            <QueueProvider>
              <ThemedRoot />
            </QueueProvider>
          </OfficeProvider>
        </SessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// Routes are exceptions to "everything is reachable": each Protected block only exists in its
// session state. A guard flip sends the user to the anchor (index), which redirects by state.
// The public display (D01) needs no session.
function ThemedRoot() {
  const { colors, isDark } = useTheme();
  const { isSignedIn, hasOffice, authReady } = useSession();
  if (!authReady) return null;


  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.paper } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="display/[code]" />
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
