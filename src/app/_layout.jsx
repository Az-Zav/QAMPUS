// Root layout — AuthProvider wraps everything; Gate routes based on auth state.
// AppProviders (5 data providers) only mount when the user is authenticated,
// so signing out unmounts them and wipes old account data.
// CalledModal lives inside AppProviders so it can read useTickets.

import CalledModal from '@/components/tickets/CalledModal';
import { COLORS } from '@/constants';
import { AppProviders } from '@/providers/AppProviders';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold, useFonts } from '@expo-google-fonts/dm-sans';
import { Redirect, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

// Gate — reads Auth and redirects as needed.
// null user    → login
// user but !profileComplete → complete-profile (student) or guest-profile (guest, from login flow)
// complete     → renders children (the app)
function Gate({ children }) {
  const { user, profileComplete, status } = useAuth();

  if (status === 'loading') return null;

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!profileComplete) {
    // Guests arriving via continueAsGuest go to guest-profile,
    // Google-signed students with no institutionalId go to complete-profile.
    const dest =
      user.role === 'GUEST'
        ? '/(auth)/guest-profile'
        : '/(auth)/complete-profile';
    return <Redirect href={dest} />;
  }

  return children;
}

// Inner layout — only rendered when fonts are ready
function RootLayoutInner() {
  const { user, profileComplete } = useAuth();
  const isAuthenticated = user !== null && profileComplete;

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={styles.shell}>
        <Gate>
          {isAuthenticated ? (
            <AppProviders>
              <Slot />
              <CalledModal />
            </AppProviders>
          ) : (
            <Slot />
          )}
        </Gate>
      </View>
    </SafeAreaProvider>
  );
}

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
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
});