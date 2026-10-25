// Push notifications (R-25): only "your turn" is pushed. The phone registers an Expo push token and saves it on the
// student's profile; when staff call a ticket, the staff console sends the message through the relay (see relay/).
// While the app is open nothing is shown by the system: the in-app banner and the called dialog already announce it.

import { db } from '@/lib/firebase';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';

// Must match `defaultChannel` of the expo-notifications plugin in app.json, and what the relay sends
export const PUSH_CHANNEL = 'default';

// Call once at app start
export function configurePushHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Asks permission (once), gets this phone's Expo push token and saves it on the profile. Resolves to the token, or
// null when this phone cannot receive push (an emulator, or notifications refused).
export async function registerForPush(uid) {
  if (!Device.isDevice) return null;

  // The channel must exist before the token is requested, or Android 13 never shows the permission prompt
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(PUSH_CHANNEL, {
      name: 'Your turn',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FFC72C',
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') ({ status } = await Notifications.requestPermissionsAsync());
  if (status !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  await updateDoc(doc(db, 'users', uid), { push_token: token });
  return token;
}

// Forget this phone's token (sign-out, or push switched off) so it stops receiving this account's pushes
export const clearPushToken = (uid) => updateDoc(doc(db, 'users', uid), { push_token: null });

// The Settings switch: push on or off for the account
export const savePushEnabled = (uid, enabled) =>
  updateDoc(doc(db, 'users', uid), enabled ? { push_enabled: true } : { push_enabled: false, push_token: null });
