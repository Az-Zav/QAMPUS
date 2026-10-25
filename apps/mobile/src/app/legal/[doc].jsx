import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSet, LEGAL_DOCS, lineHeightFor, SPACING, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';

// Terms of Service and Privacy Policy reader (/legal/terms, /legal/privacy). Lives outside the
// (auth) and (app) groups so Login can open it signed out and Settings signed in.
// Copy lives in constants/legal (LEGAL_DOCS).

const BODY_SIZE = TYPOGRAPHY.size.md;

// "**bold**" segments -> nested bold Text
function Inline({ text, boldStyle }) {
  return text.split('**').map((part, i) =>
    i % 2 ? <Text key={i} style={boldStyle}>{part}</Text> : part,
  );
}

function Block({ block }) {
  const styles = useThemedStyles(makeStyles);

  if (typeof block === 'string') {
    return <Text style={styles.body}><Inline text={block} boldStyle={styles.bold} /></Text>;
  }
  if (block.subheading) {
    return <Text style={styles.subheading} accessibilityRole="header">{block.subheading}</Text>;
  }
  return (
    <Text style={styles.body}>
      <Text style={styles.label}>{block.label}</Text>. <Inline text={block.text} boldStyle={styles.bold} />
    </Text>
  );
}

export default function LegalScreen() {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { doc } = useLocalSearchParams();
  const content = LEGAL_DOCS[doc];

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
        <View style={styles.titleGroup}>
          <Text style={styles.title}>{content.title}</Text>
          <Text style={styles.body}>Last updated: {content.updated}</Text>
        </View>

        {content.intro?.map((para, i) => <Block key={`intro-${i}`} block={para} />)}

        {content.sections.map((section) => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading} accessibilityRole="header">{section.heading}</Text>
            {section.blocks.map((block, i) => <Block key={i} block={block} />)}
          </View>
        ))}
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
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
  },
  titleGroup: { gap: SPACING.xs, marginBottom: SPACING.sm },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: BODY_SIZE,
    lineHeight: lineHeightFor(BODY_SIZE, TYPOGRAPHY.lineHeight.relaxed),
    color: c.ink,
  },
  section: { gap: SPACING.xs, marginTop: SPACING.xl },
  heading: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: BODY_SIZE,
    lineHeight: lineHeightFor(BODY_SIZE, TYPOGRAPHY.lineHeight.relaxed),
    color: c.ink,
  },
  subheading: {
    marginTop: SPACING.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: BODY_SIZE,
    lineHeight: lineHeightFor(BODY_SIZE, TYPOGRAPHY.lineHeight.relaxed),
    color: c.ink,
  },
  body: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: BODY_SIZE,
    lineHeight: lineHeightFor(BODY_SIZE, 1.65),
    color: c.ink,
  },
  bold: { fontFamily: TYPOGRAPHY.fontFamily.bold },
  label: { textDecorationLine: 'underline' },
});
