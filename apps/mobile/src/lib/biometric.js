// Biometric unlock helpers: the per-device setting and the system prompt. The setting is a preference of this phone,
// kept per account (a different account on the same phone has its own), and is not stored in Firestore.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const settingKey = (uid) => `qampus.biometric.${uid}`;

// True when the phone has a fingerprint or face (or a screen lock) set up to ask for
export async function biometricAvailable() {
  try {
    return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
  } catch {
    return false;
  }
}

export async function readBiometricSetting(uid) {
  try {
    return (await AsyncStorage.getItem(settingKey(uid))) === 'on';
  } catch {
    return false;
  }
}

export async function writeBiometricSetting(uid, enabled) {
  try {
    if (enabled) await AsyncStorage.setItem(settingKey(uid), 'on');
    else await AsyncStorage.removeItem(settingKey(uid));
    return true;
  } catch {
    return false;
  }
}

// Why a prompt can fail for good: the phone has nothing to ask with any more (the fingerprints, face or screen lock were removed)
const CANNOT_ASK = ['not_enrolled', 'not_available', 'passcode_not_set'];
export const canNoLongerAsk = (error) => CANNOT_ASK.includes(error);

// Shows the system prompt (the device PIN stays available as a fallback, so nobody is locked out).
// Resolves to { success, error }; `error` is Expo's reason when it fails (for example 'user_cancel').
export async function authenticate(promptMessage) {
  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: 'Cancel' });
    return { success: result.success, error: result.success ? null : result.error };
  } catch {
    return { success: false, error: 'unknown' };
  }
}
