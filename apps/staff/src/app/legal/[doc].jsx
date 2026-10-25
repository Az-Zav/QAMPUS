import BrandLockup from '@/components/brand/BrandLockup';
import { CONTENT_MAX_WIDTH, LEGAL_COPY, PAGE_GUTTER, STAFF_FONT, STAFF_LEGAL_DOCS, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { ChevronLeft } from '@/icons';
import { LegalBody } from '@qampus/ui';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

// Staff Terms of Use and Privacy Policy (/legal/terms, /legal/privacy). Registered outside the
// Protected blocks so it opens signed out (sign-in), signed in (account menu, new tab) or unassigned.
// Text lives in @qampus/core/legal (shared with the mobile app); LegalBody renders it.

const READING_WIDTH = 760;

export default function LegalPage() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { doc } = useLocalSearchParams();
  const content = STAFF_LEGAL_DOCS[doc];

  if (!content) return <Redirect href="/" />;

  // A tab opened from the console has no history: go to the anchor, which routes by session
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scroll}>
      <Head>
        <title>{content.navTitle}</title>
      </Head>
      <View style={styles.brandRow}>
        <BrandLockup />
      </View>

      <View style={styles.column}>
        <Pressable
          onPress={goBack}
          accessibilityRole="link"
          style={({ hovered, pressed }) => [styles.back, (hovered || pressed) && styles.backActive]}
        >
          <ChevronLeft size={18} color={colors.slate} />
          <Text style={styles.backLabel}>{LEGAL_COPY.back}</Text>
        </Pressable>

        <LegalBody doc={content} size={17} />
      </View>
    </ScrollView>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.paper },
    scroll: { paddingHorizontal: PAGE_GUTTER, paddingBottom: 96 },
    brandRow: { width: '100%', maxWidth: CONTENT_MAX_WIDTH, alignSelf: 'center', paddingTop: 64 },
    column: { width: '100%', maxWidth: READING_WIDTH, alignSelf: 'center', gap: 24, paddingTop: 48 },
    back: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingVertical: 4 },
    backActive: { opacity: 0.7 },
    backLabel: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.md, color: c.slate },
  });
