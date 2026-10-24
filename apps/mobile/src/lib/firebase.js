// Firebase app + Auth. Config comes from EXPO_PUBLIC_* vars in .env.
// Auth persists the session in AsyncStorage so users stay signed in between launches.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Only accounts on this domain count as students
export const SCHOOL_EMAIL_DOMAIN = 'tip.edu.ph';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// initializeAuth throws if called twice (fast refresh), so reuse the existing instance
const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

export const auth = isFirstInit
  ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
  : getAuth(app);

export const db = getFirestore(app);

// Must run before signIn(); the web client ID is what yields the idToken Firebase needs.
// hostedDomain only steers the account picker; SessionProvider enforces the domain.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  hostedDomain: SCHOOL_EMAIL_DOMAIN,
});
