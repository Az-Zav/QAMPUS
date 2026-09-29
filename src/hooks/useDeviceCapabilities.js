// QAMPUS useDeviceCapabilities Hook
// Checks hardware biometrics availability and OS push notification permission.
// Screens read this before calling setBiometrics or setPush to avoid promising unsupported features.

import { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';

/**
 * @returns {import('@/types').DeviceCapabilities}
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    biometricsAvailable: false,
    biometricsEnrolled: false,
    pushPermissionGranted: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function check() {
      // Biometrics hardware check
      let biometricsAvailable = false;
      let biometricsEnrolled = false;
      try {
        biometricsAvailable = await LocalAuthentication.hasHardwareAsync();
        biometricsEnrolled = biometricsAvailable
          ? await LocalAuthentication.isEnrolledAsync()
          : false;
      } catch {
        // Device does not support biometrics or expo-local-authentication unavailable
      }

      // Push notification permission check (read-only; does not request)
      let pushPermissionGranted = false;
      try {
        const { status } = await Notifications.getPermissionsAsync();
        pushPermissionGranted = status === 'granted';
      } catch {
        // expo-notifications unavailable in this environment
      }

      if (!cancelled) {
        setCapabilities({ biometricsAvailable, biometricsEnrolled, pushPermissionGranted });
      }
    }

    check();
    return () => { cancelled = true; };
  }, []);

  return capabilities;
}
