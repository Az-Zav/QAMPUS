import { useTheme } from '@/hooks';
import { SessionProvider } from '@/providers/SessionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, useFonts } from '@expo-google-fonts/dm-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor('transparent');
    }
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

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

function ThemedRoot() {
  const { colors, isDark } = useTheme();

  // Native root view behind every screen — no light flash while pages slide
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.paper);
  }, [colors.paper]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.paper },
        }}
      />
    </>
  );
}
