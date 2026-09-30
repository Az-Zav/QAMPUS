import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import ThemeSelector from '@/components/primitives/ThemeSelector';
import Toggle from '@/components/primitives/Toggle';
import { BOTTOM_NAV_CLEARANCE } from '@/components/shell/BottomNav';
import SectionLabel from '@/components/shell/SectionLabel';
import SubHeader from '@/components/shell/SubHeader';

import { COLORS, RADII, SETTINGS_COPY, SPACING, withOpacity } from '@/constants';
import { useSession } from '@/hooks';

// S16 Settings (UIUX §4.14). Push is functional; biometric and theme are inert in V1 (PRD §5).

export default function SettingsScreen() {
  const router = useRouter();
  const { user } = useSession();
  const [pushEnabled, setPushEnabled] = useState(user?.push_enabled ?? true);
  // Inert: the selector moves, but the app theme never changes
  const [themePreview, setThemePreview] = useState('light');

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
          <ThemeSelector value={themePreview} onChange={setThemePreview} inert />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.paper },
  content: {
    gap: SPACING.huge,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
  },
  section: { gap: SPACING.sm },
  group: {
    backgroundColor: withOpacity(COLORS.white, 0.8),
    borderWidth: 1,
    borderColor: withOpacity(COLORS.slate, 0.18),
    borderRadius: RADII.xl,
    overflow: 'hidden',
    padding: 1,
  },
});
