import { COLORS, lineHeightFor, SPACING, TYPOGRAPHY } from '@/constants';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

// Illustrations are visual, so they live here, not in constants/content
const ILLUSTRATIONS = {
  join: require('../../../assets/images/Onboarding 1.png'),
  notify: require('../../../assets/images/Onboarding 2.png'),
  start: require('../../../assets/images/Onboarding 3.png'),
};

// slide: { id, title, body } from ONBOARDING_SLIDES; width: page width
export default function OnboardingSlide({ slide, width }) {
  return (
    <View style={[styles.slide, { width }]}>
      <Image source={ILLUSTRATIONS[slide.id]} style={styles.illustration} contentFit="contain" />
      <Text style={styles.title}>{slide.title}</Text>
      <Text style={styles.body}>{slide.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'flex-end', // text sits just above the dots
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.sm,
  },
  illustration: {
    width: '72%',
    aspectRatio: 1,
    marginBottom: SPACING.lg,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xl,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.xl, TYPOGRAPHY.lineHeight.tight),
    color: COLORS.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.size.sm,
    lineHeight: lineHeightFor(TYPOGRAPHY.size.sm, TYPOGRAPHY.lineHeight.relaxed),
    color: COLORS.slate,
    textAlign: 'center',
  },
});
