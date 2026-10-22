import ActionButton from '@/components/primitives/ActionButton';
import { SIGN_IN_COPY, SIGN_IN_SPLIT_BREAKPOINT, STAFF_FONT, SPACING, TYPOGRAPHY } from '@/constants';
import { useSession, useTheme, useThemedStyles } from '@/hooks';
import { ShieldCheck, Timer, UserRoundCheck } from '@/icons';
import { SignInStatus } from '@/providers/SessionProvider';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const HIGHLIGHT_ICONS = { timer: Timer, userCheck: UserRoundCheck, shield: ShieldCheck };

// W01 — Sign in (+ Loading, Error)
export default function SignIn() {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { signIn, signInStatus } = useSession();
  // Dev aid until real auth: /sign-in?as=unassigned signs in an account with no office,
  // /sign-in?as=error shows the off-domain error
  const { as } = useLocalSearchParams();
  const loading = signInStatus === SignInStatus.LOADING;

  return (
    <View style={styles.screen}>
      {width >= SIGN_IN_SPLIT_BREAKPOINT && (
        <View style={styles.hero}>
          <View style={styles.logo}>
            <Image
              source={require('../../assets/images/brand/logo-hero.svg')}
              style={StyleSheet.absoluteFill}
              contentFit="fill"
            />
            <Text style={styles.logoQ}>Q</Text>
          </View>
          <Text style={styles.headline}>{SIGN_IN_COPY.headline}</Text>
          <Text style={styles.heroBody}>{SIGN_IN_COPY.body}</Text>
          <View style={styles.highlights}>
            {SIGN_IN_COPY.highlights.map(({ icon, text }) => {
              const Icon = HIGHLIGHT_ICONS[icon];
              return (
                <View key={text} style={styles.highlight}>
                  <Icon size={20} color={colors.gold} />
                  <Text style={styles.highlightText}>{text}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.panel}>
        <View style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">
            {SIGN_IN_COPY.title}
          </Text>
          <Text style={styles.subtitle}>{SIGN_IN_COPY.subtitle}</Text>
          <ActionButton
            label={loading ? SIGN_IN_COPY.ctaLoading : SIGN_IN_COPY.cta}
            disabled={loading}
            onPress={() => signIn({ variant: as })}
            style={styles.cta}
          />
          {signInStatus === SignInStatus.ERROR && (
            <Text style={styles.error} accessibilityLiveRegion="polite">
              {SIGN_IN_COPY.error}
            </Text>
          )}
          <Text style={styles.footnote}>{SIGN_IN_COPY.footnote}</Text>
        </View>
      </View>
    </View>
  );
}

// The hero is always the dark surface (Figma W01), independent of the color scheme
const makeStyles = (c) =>
  StyleSheet.create({
    screen: { flex: 1, flexDirection: 'row', backgroundColor: c.paper },
    // 880 of 1920: 200px left / 120px right margins at full width, scaling down with the window
    hero: {
      width: '45.83%',
      backgroundColor: c.inverse,
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: 34,
      paddingLeft: '10.4%',
      paddingRight: '6.25%',
      paddingVertical: 88,
    },
    logo: { width: 96, height: 80, alignItems: 'center', justifyContent: 'center' },
    logoQ: { fontFamily: STAFF_FONT.logo, fontSize: 72, lineHeight: 80, color: c.onInverse },
    headline: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 45, lineHeight: 54, color: c.onInverse },
    heroBody: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: 20,
      lineHeight: 31,
      color: c.onInverse,
      opacity: 0.78,
    },
    highlights: { alignSelf: 'stretch', gap: 14 },
    highlight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
    highlightText: {
      flex: 1,
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.lg,
      color: c.onInverse,
      opacity: 0.85,
    },
    panel: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl },
    card: { width: '100%', maxWidth: 540, alignItems: 'center', gap: 22 },
    title: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 35, color: c.ink, textAlign: 'center' },
    subtitle: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.lg, color: c.slate, textAlign: 'center' },
    cta: { alignSelf: 'stretch' },
    error: { fontFamily: STAFF_FONT.semibold, fontSize: 17, lineHeight: 24, color: c.error, textAlign: 'center' },
    footnote: {
      fontFamily: TYPOGRAPHY.fontFamily.regular,
      fontSize: TYPOGRAPHY.size.md,
      lineHeight: 24,
      color: c.slate,
      textAlign: 'center',
    },
  });
