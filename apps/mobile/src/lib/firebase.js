
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';

import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';

import { Platform } from 'react-native';

import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only once
const app = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

// Use persistent authentication on React Native
// and regular browser authentication on web.
function createAuth() {
  // Firebase Auth for web
  if (Platform.OS === 'web') {
    return getAuth(app);
  }

  // If the React Native persistence export isn't
  // available, avoid crashing during initialization.
  if (typeof getReactNativePersistence !== 'function') {
    console.warn(
      'React Native Firebase persistence is unavailable. ' +
      'Using default authentication persistence.',
    );

    return getAuth(app);
  }

  // Android/iOS: use AsyncStorage persistence.
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // An Auth instance may already exist after
    // Metro Fast Refresh.
    if (error?.code === 'auth/already-initialized') {
      return getAuth(app);
    }

    throw error;
  }
}

export const auth = createAuth();

// Google Sign-In configuration
if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });
}
