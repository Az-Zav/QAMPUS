import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LegalBody } from '@qampus/ui';
import { IconSet, SPACING, STUDENT_LEGAL_DOCS, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';

// Terms of Service and Privacy Policy reader (/legal/terms, /legal/privacy). Lives outside the
// (auth) and (app) groups so Login can open it signed out and Settings signed in.
// Text lives in @qampus/core/legal (shared with the staff console); LegalBody renders it.

export default function LegalScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doc } = useLocalSearchParams();
  const content = STUDENT_LEGAL_DOCS[doc];

  if (!content) return <Redirect href="/" />;

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Pressable
          onPress={goBack}
          hitSlop={SPACING.md}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <IconSet name="chevron-back" size={26} color={colors.ink} />
        </Pressable>
        <Text style={styles.navTitle} numberOfLines={1} accessibilityRole="header">
          {content.navTitle}
        </Text>
        <View style={styles.back} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + SPACING.huge }]}
        showsVerticalScrollIndicator={false}
      >
        <LegalBody doc={content} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: c.paper,
  },
  back: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.lg,
    color: c.ink,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
});
