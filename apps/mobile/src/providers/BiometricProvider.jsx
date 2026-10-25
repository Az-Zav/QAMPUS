// Biometric unlock: when the setting is on, the app asks for a fingerprint, face or device PIN when it opens and when it
// comes back after more than a minute in the background. It only unlocks an already signed-in session (it never
// replaces sign-in) and applies to students and guests. It covers the screen only: the Firebase session itself still
// sits in app storage, which is enough for the prototype.

import LockScreen from '@/components/shell/LockScreen';
import { LOCK_COPY } from '@/constants';
import {
  authenticate,
  biometricAvailable,
  canNoLongerAsk,
  readBiometricSetting,
  writeBiometricSetting,
} from '@/lib/biometric';
import { useSession } from '@/providers/SessionProvider';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

const BiometricContext = createContext(null);

// A quick trip to the background (a permission dialog, the biometric prompt itself) must not lock the app
const LOCK_AFTER_MS = 60 * 1000;

export function BiometricProvider({ children }) {
  const { user } = useSession();
  const uid = user?.id ?? null;

  // The setting is tagged with the account it was read for, so another account never inherits it
  const [setting, setSetting] = useState({ uid: null, enabled: false });
  const [available, setAvailable] = useState(false);
  const [locked, setLocked] = useState(false);
  const backgroundedAt = useRef(null);
  const prompting = useRef(false);

  const ready = !uid || setting.uid === uid;
  const enabled = !!uid && setting.uid === uid && setting.enabled;

  // Read this account's setting; a cold start with it on starts locked (and a different account starts unlocked)
  useEffect(() => {
    if (!uid) return undefined;
    let cancelled = false;
    readBiometricSetting(uid).then((on) => {
      if (cancelled) return;
      setSetting({ uid, enabled: on });
      setLocked(on);
    });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  // Whether the phone has something to ask for (re-checked on return: the user may set one up in the phone's settings)
  useEffect(() => {
    let cancelled = false;
    const refresh = () => biometricAvailable().then((ok) => !cancelled && setAvailable(ok));
    refresh();
    const sub = AppState.addEventListener('change', (state) => state === 'active' && refresh());
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);

  // Lock after more than a minute in the background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        backgroundedAt.current = Date.now();
      } else if (state === 'active') {
        const away = backgroundedAt.current ? Date.now() - backgroundedAt.current : 0;
        backgroundedAt.current = null;
        if (enabled && away > LOCK_AFTER_MS) setLocked(true);
      }
    });
    return () => sub.remove();
  }, [enabled]);

  const unlock = useCallback(async () => {
    if (prompting.current) return;
    prompting.current = true;
    try {
      const { success, error } = await authenticate(LOCK_COPY.prompt);
      if (success) {
        setLocked(false);
      } else if (uid && canNoLongerAsk(error)) {
        // The phone has nothing left to ask with (its fingerprints, face or screen lock were removed): switch the
        // setting off and let the student in, or they could never get past the lock
        await writeBiometricSetting(uid, false);
        setSetting({ uid, enabled: false });
        setLocked(false);
      }
    } finally {
      prompting.current = false;
    }
  }, [uid]);

  // Ask as soon as the lock appears; if it is cancelled the Unlock button asks again
  const asked = useRef(false);
  useEffect(() => {
    if (!locked) {
      asked.current = false;
      return;
    }
    if (ready && !asked.current) {
      asked.current = true;
      unlock();
    }
  }, [locked, ready, unlock]);

  // Settings switch. Turning it on first proves it works with one successful prompt. Resolves to true when changed.
  const setEnabled = useCallback(
    async (on) => {
      if (!uid) return false;
      if (on && !(await authenticate(LOCK_COPY.confirmPrompt)).success) return false;
      if (!(await writeBiometricSetting(uid, on))) return false;
      setSetting({ uid, enabled: on });
      if (!on) setLocked(false);
      return true;
    },
    [uid],
  );

  const value = useMemo(
    () => ({ enabled, available, locked: !!uid && (locked || !ready), setEnabled }),
    [enabled, available, locked, ready, uid, setEnabled],
  );

  return (
    <BiometricContext.Provider value={value}>
      {children}
      {value.locked && <LockScreen waiting={!ready} onUnlock={unlock} />}
    </BiometricContext.Provider>
  );
}

export function useBiometric() {
  const context = useContext(BiometricContext);
  if (!context) throw new Error('useBiometric must be used within a BiometricProvider');
  return context;
}
