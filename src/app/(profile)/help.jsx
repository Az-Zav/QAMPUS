import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/primitives/Button';
import { BOTTOM_NAV_CLEARANCE } from '@/components/shell/BottomNav';
import InfoCard from '@/components/shell/InfoCard';
import SubHeader from '@/components/shell/SubHeader';

import { ButtonType, COLORS, FAQ_ITEMS, HELP_COPY, IconSet, InfoCardType, lineHeightFor, SPACING, TYPOGRAPHY } from '@/constants';

// S17 Help & Support (UIUX §4.15). FAQ copy lives in constants/content (FAQ_ITEMS).

// TODO: replace with the campus services support address once confirmed.
const SUPPORT_MAILTO = 'mailto:?subject=QAMPUS%20support';

export default function HelpScreen() {
  const router = useRouter();

  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/profile'));

  return (
    <View style={styles.screen}>
      <SubHeader title="Help & Support" onBack={goBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.faqHead}>
          <Text style={styles.faqTitle} accessibilityRole="header">{HELP_COPY.faqTitle}</Text>
          <Text style={styles.faqCount}>{HELP_COPY.faqCount(FAQ_ITEMS.length)}</Text>
        </View>

        {FAQ_ITEMS.map((faq, i) => (
          <InfoCard
            key={faq.id}
            type={InfoCardType.FAQ}
            title={faq.question}
            body={faq.answer}
            defaultExpanded={i === 0}
          />
        ))}

        <View style={styles.contact}>
          <Text style={styles.contactTitle}>{HELP_COPY.contactTitle}</Text>
          <Text style={styles.contactBody}>{HELP_COPY.contactBody}</Text>
          <Button
            type={ButtonType.SECONDARY}
            label={HELP_COPY.contactLabel}
            icon={<IconSet name="mail-outline" size={18} color={COLORS.ink} />}
            onPress={() => Linking.openURL(SUPPORT_MAILTO)}
            style={styles.contactButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.paper },
  content: {
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: BOTTOM_NAV_CLEARANCE,
  },
  faqHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xxs,
    marginBottom: SPACING.sm,
  },
  faqTitle: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.md,
    letterSpacing: -0.4,
    textTransform: 'uppercase',
    color: COLORS.ink,
  },
  faqCount: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.slate,
  },
  contact: { gap: SPACING.xxs, paddingTop: SPACING.xl },
  contactTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.ink,
  },
  contactBody: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.base,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.base),
    color: COLORS.slate,
  },
  contactButton: { marginTop: SPACING.sm },
});
