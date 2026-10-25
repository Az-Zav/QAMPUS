import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import ThemeSelector from '@/components/primitives/ThemeSelector';
import { Toggle } from '@qampus/ui';
import { useBottomNavClearance } from '@/components/shell/BottomNav';
import ListRow from '@/components/shell/ListRow';
import SectionLabel from '@/components/shell/SectionLabel';
import SubHeader from '@/components/shell/SubHeader';

import { ListRowType, RADII, SETTINGS_COPY, SPACING, withOpacity } from '@/constants';
import { useSession, useTheme, useThemedStyles } from '@/hooks';
import { savePushEnabled } from '@/lib/push';
import { useBiometric } from '@/providers/BiometricProvider';
import { useQueueData } from '@/providers/QueueDataProvider';

// S16 Settings (UIUX §4.14). Theme, biometric unlock and push all work.
// The theme follows the device until a half is picked; the choice lasts until the app restarts.

export default function SettingsScreen() {
  const styles = useThemedStyles(makeStyles);
  const navClearance = useBottomNavClearance();
  const router = useRouter();
  const { user } = useSession();
  // The live profile, so the switch shows what is saved (it saves the moment it is flipped)
  const { profile } = useQueueData();
  const pushEnabled = profile ? profile.push_enabled !== false : true;
  const setPushEnabled = (on) => {
    if (user) savePushEnabled(user.id, on).catch((error) => console.warn('Could not save the push setting', error));
  };
  const { scheme, setPreference } = useTheme();
  const biometric = useBiometric();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  return (
    <View style={styles.screen}>
      <SubHeader title="Settings" onBack={goBack} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: navClearance }]} showsVerticalScrollIndicator={false}>
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
              subtitle={biometric.available ? SETTINGS_COPY.biometric.subtitle : SETTINGS_COPY.biometric.unavailable}
              value={biometric.enabled}
              onValueChange={biometric.setEnabled}
              disabled={!biometric.available && !biometric.enabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionLabel text={SETTINGS_COPY.appearanceLabel} />
          <ThemeSelector value={scheme} onChange={setPreference} />
        </View>

        <View style={styles.section}>
          <SectionLabel text={SETTINGS_COPY.legalLabel} />
          <View style={styles.group}>
            {SETTINGS_COPY.legal.map((item, i) => (
              <ListRow
                key={item.id}
                type={ListRowType.MENU}
                icon={item.icon}
                title={item.title}
                onPress={() => router.push(item.href)}
                style={i === 0 && styles.firstRow}
              />
            ))}
          </View>
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
  firstRow: { borderTopWidth: 0 },
});
