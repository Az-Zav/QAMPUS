import Toggle from '@/components/primitives/Toggle';
import Header from '@/components/shell/Header';
import { COLORS, SPACING, TYPOGRAPHY } from '@/constants';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { useSettings } from '@/providers/SettingsProvider';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  const { settings, actions } = useSettings();
  const caps = useDeviceCapabilities();

  return (
    <View style={styles.screen}>
      <Header title="SETTINGS" />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Notifications & Alerts</Text>
        <View style={styles.group}>
          <Toggle
            title="Push Notifications"
            subtitle="Get notified when it's your turn"
            toggled={settings?.pushEnabled ?? true}
            onToggleChange={(val) => actions.updateSettings({ pushEnabled: val })}
          />
          <Toggle
            title="Sound Effects"
            subtitle="Play alert sound when ticket is called"
            toggled={settings?.soundEnabled ?? true}
            onToggleChange={(val) => actions.updateSettings({ soundEnabled: val })}
          />
          <Toggle
            title="Haptic Feedback"
            subtitle="Vibrate device on important updates"
            toggled={settings?.hapticsEnabled ?? true}
            onToggleChange={(val) => actions.updateSettings({ hapticsEnabled: val })}
          />
        </View>

        <Text style={styles.sectionTitle}>Security & Hardware</Text>
        <View style={styles.group}>
          <Toggle
            title="Biometric App Lock"
            subtitle={
              caps.hasBiometrics
                ? `Require ${caps.biometricsType || 'Biometrics'} to open app`
                : 'Biometrics not available on this device'
            }
            toggled={settings?.biometricsEnabled ?? false}
            onToggleChange={(val) => actions.updateSettings({ biometricsEnabled: val })}
            type={caps.hasBiometrics ? 'functional' : 'disabled'}
          />
        </View>

        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>QAMPUS Mobile</Text>
          <Text style={styles.infoSub}>Version 1.0.0 (Expo SDK 54)</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.paper,
  },
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxl * 2,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.ink,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  group: {
    gap: SPACING.xs,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  infoTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.base,
    color: COLORS.ink,
  },
  infoSub: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.slate,
    marginTop: 2,
  },
});
