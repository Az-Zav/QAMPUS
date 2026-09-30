import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import ThemeSelector from '@/components/primitives/ThemeSelector';
import Toggle from '@/components/primitives/Toggle';
import { BOTTOM_NAV_CLEARANCE } from '@/components/shell/BottomNav';
import SectionLabel from '@/components/shell/SectionLabel';
import SubHeader from '@/components/shell/SubHeader';

import { RADII, SETTINGS_COPY, SPACING, withOpacity } from '@/constants';
import { useSession, useTheme, useThemedStyles } from '@/hooks';

// S16 Settings (UIUX §4.14). Push and theme are functional; biometric is inert in V1 (PRD §5).
// The theme follows the device until a half is picked; the choice lasts until the app restarts.

export default function SettingsScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { user } = useSession();
  const [pushEnabled, setPushEnabled] = useState(user?.push_enabled ?? true);
  const { scheme, setPreference } = useTheme();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  return (
    <View style={styles.screen}>
      <SubHeader title="Settings" onBack={goBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <SectionLabel text={SETTINGS_COPY.generalLabel} />
          <View style={styles.group}>
            <Toggle
              title={SETTINGS_COPY.push.title}
              subtitle={SETTINGS_COPY.push.subtitle}
              value={pushEnabled}
              onValueChange={setPushEnabled}
            />
            <Toggle
              title={SETTINGS_COPY.biometric.title}
              subtitle={SETTINGS_COPY.biometric.subtitle}
              value
              disabled
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel text={SETTINGS_COPY.appearanceLabel} />
          <ThemeSelector value={scheme} onChange={setPreference} />
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.paper },
  content: {
    gap: SPACING.huge,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
  },
  section: { gap: SPACING.sm },
  group: {
    backgroundColor: withOpacity(c.white, 0.8),
    borderWidth: 1,
    borderColor: withOpacity(c.slate, 0.18),
    borderRadius: RADII.xl,
    overflow: 'hidden',
    padding: 1,
  },
});
