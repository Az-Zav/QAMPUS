import OnboardingSlide from '@/components/onboarding/OnboardingSlide';
import Button from '@/components/primitives/Button';
import PageDots from '@/components/primitives/PageDots';
import { ButtonType, ComponentSize, ONBOARDING_COPY, ONBOARDING_SLIDES, SPACING } from '@/constants';
import { useSession, useThemedStyles } from '@/hooks';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// S01–S03: three swipeable, skippable slides. Exit -> Login.
export default function OnboardingScreen() {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { completeOnboarding } = useSession();
  const { width } = useWindowDimensions();
  const listRef = useRef(null);
  const [index, setIndex] = useState(0);

  const isLast = index === ONBOARDING_SLIDES.length - 1;

  const finish = () => {
    completeOnboarding();
    router.replace('/login');
  };

  const next = () => {
    if (isLast) {
      finish();
      return;
    }
    listRef.current?.scrollToIndex({ index: index + 1 });
    setIndex(index + 1);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Button type={ButtonType.TEXT} size={ComponentSize.SM} label={ONBOARDING_COPY.skip} onPress={finish} />
      </View>

      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(slide) => slide.id}
        renderItem={({ item }) => <OnboardingSlide slide={item} width={width} />}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={styles.list}
      />

      <PageDots count={ONBOARDING_SLIDES.length} index={index} style={styles.dots} />

      <View style={styles.spacer} />

      <View style={styles.footer}>
        <Button label={isLast ? ONBOARDING_COPY.getStarted : ONBOARDING_COPY.next} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: c.paper,
  },
  topBar: {
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
  },
  list: {
    flex: 1,
  },
  dots: {
    marginTop: SPACING.lg,
  },
  spacer: {
    flex: 0.6, // gap between dots and button, as a share of the free height
  },
  footer: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
});
